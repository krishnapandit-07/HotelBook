import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function AddHotel() {
    return (
        <section className="hotelbook-page-layout owner-page-layout">
            <div className="page-heading-group">
                <h1>Add a hotel</h1>
                <Link className="navigation-back-link" to="/owner/hotels">
                    ← My Hotels
                </Link>
            </div>

            <HotelForm button="Add Hotel" />
        </section>
    );
}

export function HotelForm({ button = 'Save Changes', initial = null, hotelId }) {
    const navigate = useNavigate();

    const [values, setValues] = useState({
        name: initial?.name || '',
        location: initial?.location || '',
        description: initial?.description || '',
        image: initial?.image || '',
        rating: initial?.rating ?? 0,
        amenities: Array.isArray(initial?.amenities)
            ? initial.amenities.join(', ')
            : (initial?.amenities || '')
    });

    const [error, setError] = useState('');

    React.useEffect(() => {
        if (initial) {
            setValues({
                name: initial.name || '',
                location: initial.location || '',
                description: initial.description || '',
                image: initial.image || '',
                rating: initial.rating ?? 0,
                amenities: Array.isArray(initial.amenities)
                    ? initial.amenities.join(', ')
                    : (initial.amenities || '')
            });
        }
    }, [initial]);

    async function submit(event) {
        event.preventDefault();
        setError('');

        try {
            if (hotelId)
                await api.editHotel(hotelId, values);
            else
                await api.addHotel(values);

            navigate('/owner/hotels');
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    const update = (field) => (event) =>
        setValues({ ...values, [field]: event.target.value });

    return (
        <form className="owner-hotel-form" onSubmit={submit}>
            <div className="form-field-layout">
                <label>
                    Hotel name
                    <input
                        required
                        value={values.name}
                        onChange={update('name')}
                        placeholder="Hotel name"
                    />
                </label>

                <label>
                    Location
                    <input
                        required
                        value={values.location}
                        onChange={update('location')}
                        placeholder="City, State"
                    />
                </label>

                <label className="wide-form-field">
                    Description
                    <textarea
                        required
                        rows="4"
                        value={values.description}
                        onChange={update('description')}
                        placeholder="Hotel description"
                    />
                </label>

                <label className="wide-form-field">
                    Amenities
                    <input
                        value={values.amenities}
                        onChange={update('amenities')}
                        placeholder="Free Wi-Fi, Breakfast, Parking"
                    />
                </label>

                <label>
                    Hotel image URL
                    <input
                        value={values.image}
                        onChange={update('image')}
                        placeholder="Optional image URL"
                    />
                </label>
            </div>

            {error && <p className="form-error-message">{error}</p>}

            <button className="owner-save-hotel-button">
                {button} <span>→</span>
            </button>
        </form>
    );
}