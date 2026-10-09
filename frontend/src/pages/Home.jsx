import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    return (
        <section className="hotel-search-banner">
            <div className="hotel-search-introduction">
                <h1>
                    Find Your
                    <br />
                    <span>Perfect Stay</span>
                </h1>
            </div>

            <form
                className="hotel-search-form"
                onSubmit={event => {
                    event.preventDefault();
                    navigate('/hotels');
                }}
            >
                <label>
                    Location
                    <input
                        placeholder="Where are you going?"
                        name="location"
                    />
                </label>

                <label>
                    Check-in
                    <input type="date" name="checkin" />
                </label>

                <label>
                    Check-out
                    <input type="date" name="checkout" />
                </label>

                <label>
                    Guests
                    <input
                        type="number"
                        name="guests"
                        min="1"
                        defaultValue="2"
                    />
                </label>

                <button className="home-search-button">
                    Search hotels <span>→</span>
                </button>
            </form>
        </section>
    );
}