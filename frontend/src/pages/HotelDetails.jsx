import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import RoomCard from '../components/RoomCard.jsx';

export default function HotelDetails() {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getHotel(id)
            .then(setHotel)
            .catch(requestError => setError(requestError.message));
    }, [id]);

    if (error) {
        return (
            <section className="hotelbook-page-layout">
                <div className="empty-results-panel">
                    <h3>Hotel unavailable</h3>
                    <p>{error}</p>
                    <Link to="/hotels">Browse hotels</Link>
                </div>
            </section>
        );
    }

    if (!hotel) {
        return (
            <section className="hotelbook-page-layout">
                <p className="supporting-copy">Loading…</p>
            </section>
        );
    }

    const availableRooms = (hotel.rooms || []).filter(
        room => Boolean(room.availability)
    );

    return (
        <section className="hotelbook-page-layout hotel-details-page">
            <div className="hotel-information-heading">
                <div>
                    <h1>{hotel.name}</h1>

                    <p className="supporting-copy">
                        ⌖ {hotel.location}

                        {Number(hotel.rating) > 0 && (
                            <span className="hotel-guest-rating">
                                ★ {hotel.rating}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="hotel-information-layout">
                <div>
                    {hotel.description && (
                        <section className="hotel-information-section">
                            <h2>About</h2>
                            <p>{hotel.description}</p>
                        </section>
                    )}

                    {hotel.amenities?.length > 0 && (
                        <section className="hotel-information-section">
                            <h2>Amenities</h2>

                            <div className="hotel-amenity-list">
                                {hotel.amenities.map(amenity => (
                                    <span key={amenity}>
                                        ✓ &nbsp;{amenity}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="hotel-information-section">
                        <h2>Available rooms</h2>

                        <div className="hotel-available-rooms">
                            {availableRooms.length ? (
                                availableRooms.map(room => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        hotelId={hotel.id}
                                    />
                                ))
                            ) : (
                                <p className="supporting-copy">
                                    No rooms available.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}