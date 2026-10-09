import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingCard from '../components/BookingCard.jsx';
import { api } from '../api.js';

export default function OwnerDashboard() {
    const [hotels, setHotels] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [roomCount, setRoomCount] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            api.getOwnerHotels(),
            api.getOwnerBookings()
        ])
            .then(async ([hotelData, bookingData]) => {
                const ownedHotels = hotelData.hotels || [];

                setHotels(ownedHotels);

                const roomLists = await Promise.all(
                    ownedHotels.map(hotel => api.getRooms(hotel.id))
                );

                setRoomCount(
                    roomLists.reduce(
                        (total, result) => total + (result.rooms || []).length,
                        0
                    )
                );

                setBookings(bookingData.bookings || []);
            })
            .catch(requestError => setError(requestError.message));
    }, []);

    const pendingCount = bookings.filter(
        booking => String(booking.status).toLowerCase() === 'pending'
    ).length;

    const stats = [
        ['Total Hotels', hotels.length],
        ['Total Rooms', roomCount],
        ['Total Bookings', bookings.length],
        ['Pending Bookings', pendingCount]
    ];

    return (
        <section className="hotelbook-page-layout owner-page-layout">
            <div className="page-heading-group">
                <h1>Owner Dashboard</h1>

                <Link
                    className="owner-add-hotel-link"
                    to="/owner/add-hotel"
                >
                    ＋ Add Hotel
                </Link>
            </div>

            {error && (
                <p className="form-error-message">{error}</p>
            )}

            <div className="dashboard-stat-grid">
                {stats.map(([title, value]) => (
                    <article className="dashboard-stat-card" key={title}>
                        <p>{title}</p>
                        <strong>{value}</strong>
                    </article>
                ))}
            </div>

            <div className="page-section-heading owner-booking-section-heading">
                <h2>Recent bookings</h2>

                <Link
                    to="/owner/bookings"
                    className="section-view-all-link"
                >
                    All bookings ↗
                </Link>
            </div>

            {bookings.length ? (
                <div className="reservation-card-list">
                    {bookings.slice(0, 3).map(booking => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-results-panel">
                    <h3>No bookings yet.</h3>
                </div>
            )}
        </section>
    );
}