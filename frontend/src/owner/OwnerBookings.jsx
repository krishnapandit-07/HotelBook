import React, { useEffect, useState } from 'react';
import BookingCard from '../components/BookingCard.jsx';
import { api } from '../api.js';

export default function OwnerBookings() {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getOwnerBookings()
            .then(data => setBookings(data.bookings || []))
            .catch(requestError => setError(requestError.message));
    }, []);

    return (
        <section className="hotelbook-page-layout owner-page-layout">
            <div className="page-heading-group">
                <h1>Bookings</h1>
            </div>

            {error && (
                <p className="form-error-message">{error}</p>
            )}

            {bookings.length ? (
                <div className="reservation-card-list">
                    {bookings.map(booking => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                        />
                    ))}
                </div>
            ) : (
                !error && (
                    <div className="empty-results-panel">
                        <h3>No bookings for your hotels yet.</h3>
                    </div>
                )
            )}
        </section>
    );
}