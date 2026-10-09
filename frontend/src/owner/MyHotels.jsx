import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function MyHotels() {
    const [hotels, setHotels] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getOwnerHotels()
            .then(data => setHotels(data.hotels || []))
            .catch(requestError => setError(requestError.message));
    }, []);

    return (
        <section className="hotelbook-page-layout owner-page-layout">
            <div className="page-heading-group">
                <h1>My Hotels</h1>

                <Link
                    to="/owner/add-hotel"
                    className="owner-add-hotel-link"
                >
                    ＋ Add Hotel
                </Link>
            </div>

            {error && (
                <p className="form-error-message">{error}</p>
            )}

            {hotels.length ? (
                <div className="owner-hotel-list">
                    {hotels.map(h => (
                        <article
                            className="owner-hotel-listing"
                            key={h.id}
                        >
                            {h.image ? (
                                <img src={h.image} alt={h.name} />
                            ) : (
                                <div
                                    className="owner-hotel-image-placeholder"
                                    aria-hidden="true"
                                />
                            )}

                            <div className="owner-hotel-details">
                                <h2>{h.name}</h2>

                                <p className="supporting-copy">
                                    ⌖ {h.location}
                                </p>

                                {Number(h.rating) > 0 && (
                                    <p className="supporting-copy">
                                        ★ {h.rating}
                                    </p>
                                )}
                            </div>

                            <div className="owner-hotel-controls">
                                <Link
                                    className="owner-edit-hotel-link"
                                    to={`/owner/edit-hotel/${h.id}`}
                                >
                                    Edit
                                </Link>

                                <Link
                                    className="owner-manage-rooms-link"
                                    to={`/owner/manage-rooms/${h.id}`}
                                >
                                    Rooms
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                !error && (
                    <div className="empty-results-panel">
                        <h3>No hotels added yet.</h3>

                        <Link
                            className="owner-add-hotel-link"
                            to="/owner/add-hotel"
                        >
                            ＋ Add Hotel
                        </Link>
                    </div>
                )
            )}
        </section>
    );
}