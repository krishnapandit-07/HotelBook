import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    return (
        <section className="authentication-page">
            <div className="authentication-panel">
                <div className="authentication-emblem">H</div>

                <h1>Login</h1>

                <form
                    onSubmit={async e => {
                        e.preventDefault();

                        const form = new FormData(e.currentTarget);

                        try {
                            const result = await api.login({
                                email: form.get('email'),
                                password: form.get('password')
                            });

                            if (result.token)
                                localStorage.setItem('hotelbook_token', result.token);

                            if (result.user)
                                localStorage.setItem(
                                    'hotelbook_user',
                                    JSON.stringify(result.user)
                                );

                            navigate(
                                result.user?.role === 'owner' ? '/owner' : '/'
                            );
                        } catch (requestError) {
                            setError(requestError.message);
                        }
                    }}
                >
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
                        Password
                        <input
                            required
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                        />
                    </label>

                    {error && (
                        <p className="form-error-message">{error}</p>
                    )}

                    <button className="authentication-submit-button">
                        Login <span>→</span>
                    </button>
                </form>

                <p className="authentication-switch">
                    Don’t have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </section>
    );
}