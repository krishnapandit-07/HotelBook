import React from 'react';
import { Link } from 'react-router-dom';

export default function HotelCard({ hotel, onRemove, onSave }) {
    return (
        <article className="hotel-card">
            <Link to={`/hotels/${hotel.id}`} className="hotel-card-image-link">
                {hotel.image && (
                    <img
                        src={hotel.image}
                        alt={hotel.name}
                        onError={e => {
                            e.currentTarget.remove();
                        }}
                    />
                )}

                <span className="hotel-rating-badge">
                    ★ {hotel.rating || 'New'}
                </span>
            </Link>

            <div className="hotel-card-details">
                <div>
                    <h3>{hotel.name}</h3>
                    <p className="supporting-copy">
                        ⌖ {hotel.location}
                    </p>
                </div>

                <div className="hotel-card-booking-details">
                    <p className="nightly-price">
                        {Number(hotel.price) > 0 ? (
                            <>
                                ₹{Number(hotel.price).toLocaleString('en-IN')}
                                {' '}
                                <span>/ night</span>
                            </>
                        ) : (
                            'See room rates'
                        )}
                    </p>

                    <Link
                        className="hotel-view-button"
                        to={`/hotels/${hotel.id}`}
                    >
                        View Hotel
                    </Link>
                </div>

                {onRemove && (
                    <button
                        className="wishlist-remove-button"
                        onClick={() => onRemove(hotel.id)}
                    >
                        Remove from Wishlist
                    </button>
                )}

                {onSave && (
                    <button
                        className="wishlist-remove-button"
                        onClick={() => onSave(hotel.id)}
                    >
                        ♡ Save to Wishlist
                    </button>
                )}
            </div>
        </article>
    );
}