import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';

export default function Booking() {
    const { id } = useParams();
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const [hotel, setHotel] = useState(null);
    const [room, setRoom] = useState(null);
    const [guest, setGuest] = useState({ name: '', email: '', phone: '' });
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [guestCount, setGuestCount] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [error, setError] = useState('');

    const nights = useMemo(() => {
        if (!dates.checkIn || !dates.checkOut) return 1;

        return Math.max(
            1,
            Math.ceil(
                (new Date(dates.checkOut) - new Date(dates.checkIn)) / 86400000
            )
        );
    }, [dates]);

    useEffect(() => {
        const hotelId = params.get('hotel');

        if (!hotelId) {
            setError('The hotel for this room could not be identified.');
            return;
        }

        Promise.all([
            api.getHotel(hotelId),
            api.getProfile()
        ])
            .then(([hotelData, userData]) => {
                const selectedRoom = (hotelData.rooms || []).find(
                    item => String(item.id) === id
                );

                if (!selectedRoom || !selectedRoom.availability) {
                    setError('This room is not currently available.');
                    return;
                }

                setHotel(hotelData);
                setRoom(selectedRoom);
                setGuestCount(Math.min(2, selectedRoom.capacity));

                setGuest({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || ''
                });
            })
            .catch(requestError => setError(requestError.message));
    }, [id, params]);

    async function confirmBooking(event) {
        event.preventDefault();
        setError('');

        try {
            await api.createBooking({
                hotelId: hotel.id,
                roomId: room.id,
                checkIn: dates.checkIn,
                checkOut: dates.checkOut,
                guests: Number(guestCount),
                paymentMethod
            });

            navigate('/my-bookings');
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    if (error && !hotel) {
        return (
            <section className="hotelbook-page-layout">
                <div className="empty-results-panel">
                    <h3>Booking unavailable</h3>
                    <p>{error}</p>
                    <Link to="/hotels">Browse hotels</Link>
                </div>
            </section>
        );
    }

    if (!hotel || !room) {
        return (
            <section className="hotelbook-page-layout">
                <p className="supporting-copy">Loading your booking…</p>
            </section>
        );
    }

    return (
        <section className="hotelbook-page-layout booking-page">
            <div className="page-heading-group">
                <h1>Complete your booking</h1>
            </div>

            <form className="booking-page-layout" onSubmit={confirmBooking}>
                <div className="booking-form-panel">
                    <h2>Guest details</h2>

                    <div className="form-field-layout">
                        <label>
                            Guest name
                            <input
                                required
                                value={guest.name}
                                onChange={e => setGuest({
                                    ...guest,
                                    name: e.target.value
                                })}
                                placeholder="Full name"
                            />
                        </label>

                        <label>
                            Email address
                            <input
                                required
                                type="email"
                                value={guest.email}
                                onChange={e => setGuest({
                                    ...guest,
                                    email: e.target.value
                                })}
                                placeholder="you@example.com"
                            />
                        </label>

                        <label>
                            Phone number
                            <input
                                required
                                type="tel"
                                value={guest.phone}
                                onChange={e => setGuest({
                                    ...guest,
                                    phone: e.target.value
                                })}
                                placeholder="+91 98765 43210"
                            />
                        </label>

                        <label>
                            Number of guests
                            <input
                                required
                                type="number"
                                min="1"
                                max={room.capacity}
                                value={guestCount}
                                onChange={e => setGuestCount(e.target.value)}
                            />
                        </label>

                        <label>
                            Check-in
                            <input
                                required
                                type="date"
                                value={dates.checkIn}
                                onChange={e => setDates({
                                    ...dates,
                                    checkIn: e.target.value
                                })}
                            />
                        </label>

                        <label>
                            Check-out
                            <input
                                required
                                type="date"
                                min={dates.checkIn || undefined}
                                value={dates.checkOut}
                                onChange={e => setDates({
                                    ...dates,
                                    checkOut: e.target.value
                                })}
                            />
                        </label>

                        <label className="payment-method-field">
                            Payment method
                            <select
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                            >
                                <option value="upi">UPI</option>
                                <option value="card">Credit or debit card</option>
                                <option value="net_banking">Net banking</option>
                                <option value="pay_at_hotel">Pay at hotel</option>
                            </select>
                        </label>
                    </div>

                    {error && (
                        <p className="form-error-message">{error}</p>
                    )}

                    <button className="booking-confirm-button">
                        Confirm Booking
                    </button>
                </div>

                <aside className="booking-price-summary">
                    <h2>{hotel.name}</h2>
                    <p className="supporting-copy">{hotel.location}</p>

                    <div className="booking-room-summary">
                        {room.image && (
                            <img src={room.image} alt={room.room_type} />
                        )}

                        <div>
                            <strong>{room.room_type}</strong>
                            <span>Up to {room.capacity} guests</span>
                        </div>
                    </div>

                    <div className="booking-price-line">
                        <span>
                            ₹{Number(room.price).toLocaleString('en-IN')}
                            {' × '}{nights} {nights === 1 ? 'night' : 'nights'}
                        </span>

                        <strong>
                            ₹{(Number(room.price) * nights).toLocaleString('en-IN')}
                        </strong>
                    </div>

                    <div className="booking-total-line">
                        <span>Total amount</span>

                        <strong>
                            ₹{(Number(room.price) * nights).toLocaleString('en-IN')}
                        </strong>
                    </div>

                    <Link
                        className="navigation-back-link"
                        to={`/hotels/${hotel.id}`}
                    >
                        ← Back to hotel details
                    </Link>
                </aside>
            </form>
        </section>
    );
}