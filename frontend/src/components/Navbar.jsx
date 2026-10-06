import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar({ type = 'customer' }) {
    const navigate = useNavigate();
    const owner = type === 'owner';

    const links = owner
        ? [
              ['Dashboard', '/owner'],
              ['My Hotels', '/owner/hotels'],
              ['Add Hotel', '/owner/add-hotel'],
              ['Bookings', '/owner/bookings'],
              ['Profile', '/profile']
          ]
        : [
              ['Home', '/'],
              ['Hotels', '/hotels'],
              ['My Bookings', '/my-bookings'],
              ['Wishlist', '/wishlist'],
              ['Profile', '/profile']
          ];

    function logout() {
        localStorage.removeItem('hotelbook_token');
        localStorage.removeItem('hotelbook_user');
        navigate('/login');
    }

    return (
        <header className="site-navigation-header">
            <div className="site-navigation-layout">
                <Link
                    className="hotelbook-brand"
                    to={owner ? '/owner' : '/'}
                >
                    <span className="hotelbook-brand-symbol">H</span>
                    <span>
                        Hotel<span>Book</span>
                    </span>
                </Link>

                {type !== 'auth' && (
                    <>
                        <nav
                            className="site-navigation-links"
                            aria-label="Main navigation"
                        >
                            {links.map(([label, path]) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    end={path === '/'}
                                    className={({ isActive }) =>
                                        isActive
                                            ? 'current-navigation-link'
                                            : undefined
                                    }
                                >
                                    {label}
                                </NavLink>
                            ))}

                            <button
                                className="session-logout-button"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </nav>

                        <details className="mobile-site-navigation">
                            <summary aria-label="Open navigation">
                                ☰
                            </summary>

                            <nav>
                                {links.map(([label, path]) => (
                                    <NavLink
                                        key={path}
                                        to={path}
                                        className={({ isActive }) =>
                                            isActive
                                                ? 'current-navigation-link'
                                                : undefined
                                        }
                                    >
                                        {label}
                                    </NavLink>
                                ))}

                                <button
                                    className="session-logout-button"
                                    onClick={logout}
                                >
                                    Logout
                                </button>
                            </nav>
                        </details>
                    </>
                )}
            </div>
        </header>
    );
}