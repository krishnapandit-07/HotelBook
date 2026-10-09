import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    return (
        <section className="authentication-page">
            <div className="authentication-panel">
                <div className="authentication-emblem">H</div>

                <h1>Create an account</h1>

                <form
                    onSubmit={async e => {
                        e.preventDefault();

                        const f = new FormData(e.currentTarget);

                        if (f.get('password') !== f.get('confirm')) {
                            setError('Passwords do not match.');
                            return;
                        }

                        try {
                            await api.register({
                                name: f.get('name'),
                                email: f.get('email'),
                                password: f.get('password'),
                                phone: f.get('phone'),
                                role: f.get('role')
                            });

                            navigate('/login');
                        } catch (requestError) {
                            setError(requestError.message);
                        }
                    }}
                >
                    <label>
                        Full name
                        <input
                            required
                            name="name"
                            placeholder="Your name"
                        />
                    </label>

                    <label>
                        Email
                        <input
                            required
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                        />
                    </label>

                    <label>
                        Phone number
                        <input
                            required
                            type="tel"
                            name="phone"
                            maxLength="30"
                            autoComplete="tel"
                            placeholder="e.g. +91 98765 43210"
                        />
                    </label>

                    <label>
                        Password
                        <input
                            required
                            minLength="6"
                            type="password"
                            name="password"
                            placeholder="At least 6 characters"
                        />
                    </label>

                    <label>
                        Confirm password
                        <input
                            required
                            type="password"
                            name="confirm"
                            placeholder="Enter password again"
                        />
                    </label>

                    <label>
                        Account type
                        <select name="role">
                            <option value="customer">Customer</option>
                            <option value="owner">Hotel Owner</option>
                        </select>
                    </label>

                    {error && (
                        <p className="form-error-message">{error}</p>
                    )}

                    <button className="authentication-submit-button">
                        Register <span>→</span>
                    </button>
                </form>

                <p className="authentication-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </section>
    );
}