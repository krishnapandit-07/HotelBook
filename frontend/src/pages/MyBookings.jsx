import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingCard from '../components/BookingCard.jsx';
import { api } from '../api.js';

const cancellationReasons = [
    'Change of plans',
    'Booked by mistake',
    'Found another hotel',
    'Other reason'
];

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [reasons, setReasons] = useState({});
    const [ratings, setRatings] = useState({});
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    async function loadBookings() {
        try {
            const data = await api.getBookings();
            setBookings(data.bookings || []);
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    useEffect(() => {
        loadBookings();
    }, []);

    async function cancelBooking(event, bookingId) {
        event.preventDefault();
        setError('');
        setNotice('');

        try {
            await api.cancelBooking(
                bookingId,
                reasons[bookingId] || cancellationReasons[0]
            );

            setNotice('Your booking is cancelled.');
            await loadBookings();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function submitRating(event, bookingId) {
        event.preventDefault();
        setError('');
        setNotice('');

        try {
            await api.rateBooking(
                bookingId,
                Number(ratings[bookingId] || 5)
            );

            setNotice('Your rating has been saved.');
            await loadBookings();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="hotelbook-page-layout">
            <div className="page-heading-group">
                <h1>My Bookings</h1>
            </div>

            {error && (
                <p className="form-error-message">{error}</p>
            )}

            {notice && (
                <p className="form-success-message">{notice}</p>
            )}

            {bookings.length ? (
                <div className="customer-booking-list">
                    {bookings.map((booking, index) => {
                        const cancelled = booking.status === 'cancelled';

                        return (
                            <article
                                className="customer-booking-entry"
                                key={booking.id || index}
                            >
                                <BookingCard booking={booking} />

                                <div className="customer-booking-actions">
                                    {!cancelled && (
                                        <form
                                            className="booking-cancellation-form"
                                            onSubmit={event =>
                                                cancelBooking(event, booking.id)
                                            }
                                        >
                                            <label
                                                htmlFor={`cancel-reason-${booking.id}`}
                                            >
                                                Cancellation reason
                                            </label>

                                            <select
                                                id={`cancel-reason-${booking.id}`}
                                                value={
                                                    reasons[booking.id] ||
                                                    cancellationReasons[0]
                                                }
                                                onChange={event =>
                                                    setReasons(current => ({
                                                        ...current,
                                                        [booking.id]: event.target.value
                                                    }))
                                                }
                                            >
                                                {cancellationReasons.map(reason => (
                                                    <option
                                                        key={reason}
                                                        value={reason}
                                                    >
                                                        {reason}
                                                    </option>
                                                ))}
                                            </select>

                                            <button className="booking-cancel-button">
                                                Cancel Booking
                                            </button>
                                        </form>
                                    )}

                                    {!cancelled && (
                                        <form
                                            className="hotel-rating-form"
                                            onSubmit={event =>
                                                submitRating(event, booking.id)
                                            }
                                        >
                                            <label
                                                htmlFor={`hotel-rating-${booking.id}`}
                                            >
                                                {booking.user_rating
                                                    ? `Your rating: ${booking.user_rating}/5`
                                                    : 'Rate this stay'}
                                            </label>

                                            <select
                                                id={`hotel-rating-${booking.id}`}
                                                value={
                                                    ratings[booking.id] ||
                                                    String(booking.user_rating || 5)
                                                }
                                                onChange={event =>
                                                    setRatings(current => ({
                                                        ...current,
                                                        [booking.id]: event.target.value
                                                    }))
                                                }
                                            >
                                                {[5, 4, 3, 2, 1].map(value => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {'★'.repeat(value)} ({value}/5)
                                                    </option>
                                                ))}
                                            </select>

                                            <button className="hotel-rating-submit-button">
                                                {booking.user_rating
                                                    ? 'Update Rating'
                                                    : 'Save Rating'}
                                            </button>
                                        </form>
                                    )}

                                    {cancelled && (
                                        <p className="cancellation-recorded-message">
                                            Cancelled
                                            {booking.cancellation_reason
                                                ? `: ${booking.cancellation_reason}`
                                                : ''}
                                        </p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                !error && (
                    <div className="empty-results-panel">
                        <h3>No bookings found.</h3>

                        <Link
                            className="bookings-explore-hotels-link"
                            to="/hotels"
                        >
                            Explore hotels
                        </Link>
                    </div>
                )
            )}
        </section>
    );
}