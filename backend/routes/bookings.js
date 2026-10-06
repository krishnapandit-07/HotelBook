import { Router } from 'express';
import db from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const paymentMethods = new Set(['upi', 'card', 'net_banking', 'pay_at_hotel']);

router.post('/', authenticate, async (req, res) => {
    const { hotelId, roomId, checkIn, checkOut, guests, paymentMethod } = req.body;
    const guestCount = Number(guests);
    const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

    if (!Number.isInteger(Number(hotelId)) || !Number.isInteger(Number(roomId)) || !Number.isInteger(guestCount) || guestCount < 1 || !paymentMethods.has(paymentMethod)) {
        return res.status(400).json({ message: 'Choose a valid room, guest count, and payment method.' });
    }
    if (!validDate(checkIn) || !validDate(checkOut) || checkOut <= checkIn) {
        return res.status(400).json({ message: 'Choose valid check-in and check-out dates.' });
    }

    const nights = (Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [rooms] = await connection.execute('SELECT price,capacity,availability FROM rooms WHERE id=? AND hotel_id=? FOR UPDATE', [roomId, hotelId]);
        const room = rooms[0];
        if (!room) throw Object.assign(new Error('Room not found for this hotel.'), { statusCode: 404 });
        if (!room.availability) throw Object.assign(new Error('This room is not currently available.'), { statusCode: 409 });
        if (guestCount > room.capacity) throw Object.assign(new Error('Guest count exceeds this room capacity.'), { statusCode: 400 });

        const [conflictingBookings] = await connection.execute(
            "SELECT id FROM bookings WHERE room_id=? AND status <> 'cancelled' AND check_in < ? AND check_out > ? LIMIT 1",
            [roomId, checkOut, checkIn]
        );
        if (conflictingBookings.length) {
            throw Object.assign(new Error('This room is already booked for the selected dates.'), { statusCode: 409 });
        }

        const totalAmount = Number(room.price) * nights;
        const [bookingResult] = await connection.execute(
            'INSERT INTO bookings (user_id,hotel_id,room_id,check_in,check_out,guests,total_amount,status) VALUES (?,?,?,?,?,?,?,?)',
            [req.user.id, hotelId, roomId, checkIn, checkOut, guestCount, totalAmount, 'confirmed']
        );
        await connection.execute(
            'INSERT INTO payments (booking_id,payment_method,amount,payment_status) VALUES (?,?,?,?)',
            [bookingResult.insertId, paymentMethod, totalAmount, 'not_charged']
        );
        await connection.commit();
        res.status(201).json({ id: bookingResult.insertId, status: 'confirmed', paymentStatus: 'not_charged', totalAmount });
    } catch (error) {
        await connection.rollback();
        res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Could not create booking and save payment details.' });
    } finally {
        connection.release();
    }
});

router.get('/mine', authenticate, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT b.id,b.check_in,b.check_out,b.guests,b.total_amount,b.status,h.name AS hotel,r.room_type AS room,
                    p.payment_method,p.payment_status,c.reason AS cancellation_reason,hr.rating AS user_rating
             FROM bookings b
             JOIN hotels h ON h.id=b.hotel_id
             JOIN rooms r ON r.id=b.room_id
             LEFT JOIN payments p ON p.booking_id=b.id
             LEFT JOIN booking_cancellations c ON c.booking_id=b.id
             LEFT JOIN hotel_ratings hr ON hr.booking_id=b.id AND hr.user_id=b.user_id
             WHERE b.user_id=? ORDER BY b.id DESC`,
            [req.user.id]
        );
        res.json({ bookings: rows });
    } catch {
        res.status(500).json({ message: 'Could not load bookings' });
    }
});

router.post('/:id/cancel', authenticate, async (req, res) => {
    const reason = String(req.body.reason || '').trim();
    if (!reason || reason.length > 160) return res.status(400).json({ message: 'Choose a cancellation reason.' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute('SELECT id,status FROM bookings WHERE id=? AND user_id=? FOR UPDATE', [req.params.id, req.user.id]);
        if (!rows[0]) throw Object.assign(new Error('Booking not found.'), { statusCode: 404 });
        if (rows[0].status === 'cancelled') throw Object.assign(new Error('This booking has already been cancelled.'), { statusCode: 409 });

        await connection.execute('UPDATE bookings SET status=? WHERE id=? AND user_id=?', ['cancelled', req.params.id, req.user.id]);
        await connection.execute('INSERT INTO booking_cancellations (booking_id,user_id,reason) VALUES (?,?,?)', [req.params.id, req.user.id, reason]);
        await connection.execute('UPDATE payments SET payment_status=? WHERE booking_id=?', ['cancelled', req.params.id]);
        await connection.commit();
        res.json({ message: 'Booking cancelled.' });
    } catch (error) {
        await connection.rollback();
        res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : 'Could not cancel this booking.' });
    } finally {
        connection.release();
    }
});

router.post('/:id/rating', authenticate, async (req, res) => {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Choose a rating from 1 to 5.' });
    try {
        const [rows] = await db.execute('SELECT hotel_id,status FROM bookings WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
        if (!rows[0]) return res.status(404).json({ message: 'Booking not found.' });
        if (rows[0].status === 'cancelled') return res.status(409).json({ message: 'Cancelled bookings cannot be rated.' });

        const hotelId = rows[0].hotel_id;
        await db.execute(
            'INSERT INTO hotel_ratings (booking_id,user_id,hotel_id,rating) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE rating=VALUES(rating)',
            [req.params.id, req.user.id, hotelId, rating]
        );
        await db.execute('UPDATE hotels SET rating=(SELECT AVG(rating) FROM hotel_ratings WHERE hotel_id=?) WHERE id=?', [hotelId, hotelId]);
        res.json({ message: 'Your rating has been saved.', rating });
    } catch {
        res.status(500).json({ message: 'Could not save your rating.' });
    }
});

export default router;
