import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Hotels from './pages/Hotels.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import Booking from './pages/Booking.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Profile from './pages/Profile.jsx';
import OwnerDashboard from './owner/OwnerDashboard.jsx';
import MyHotels from './owner/MyHotels.jsx';
import AddHotel from './owner/AddHotel.jsx';
import EditHotel from './owner/EditHotel.jsx';
import ManageRooms from './owner/ManageRooms.jsx';
import OwnerBookings from './owner/OwnerBookings.jsx';

function readUser() {
    try {
        return JSON.parse(localStorage.getItem('hotelbook_user') || 'null');
    } catch {
        return null;
    }
}

export default function App() {
    const { pathname } = useLocation();
    const user = readUser();
    const hasSession = Boolean(localStorage.getItem('hotelbook_token') && user?.role);
    const signedInHome = user?.role === 'owner' ? '/owner' : '/';
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const navbarType = isAuthPage || !hasSession ? 'auth' : user.role === 'owner' ? 'owner' : 'customer';

    const customerPage = (page) => {
        if (!hasSession) return <Navigate to="/login" replace />;
        if (user.role !== 'customer') return <Navigate to="/owner" replace />;
        return page;
    };
    const ownerPage = (page) => {
        if (!hasSession) return <Navigate to="/login" replace />;
        if (user.role !== 'owner') return <Navigate to="/" replace />;
        return page;
    };
    const authPage = (page) => hasSession ? <Navigate to={signedInHome} replace /> : page;

    return <>
        <Navbar type={navbarType} />
        <main className="route-render-outlet">
            <Routes>
                <Route path="/" element={!hasSession ? <Navigate to="/login" replace /> : user.role === 'owner' ? <Navigate to="/owner" replace /> : <Home />} />
                <Route path="/login" element={authPage(<Login />)} />
                <Route path="/register" element={authPage(<Register />)} />
                <Route path="/hotels" element={customerPage(<Hotels />)} />
                <Route path="/hotels/:id" element={customerPage(<HotelDetails />)} />
                <Route path="/booking/:id" element={customerPage(<Booking />)} />
                <Route path="/my-bookings" element={customerPage(<MyBookings />)} />
                <Route path="/wishlist" element={customerPage(<Wishlist />)} />
                <Route path="/profile" element={hasSession ? <Profile /> : <Navigate to="/login" replace />} />
                <Route path="/owner" element={ownerPage(<OwnerDashboard />)} />
                <Route path="/owner/hotels" element={ownerPage(<MyHotels />)} />
                <Route path="/owner/add-hotel" element={ownerPage(<AddHotel />)} />
                <Route path="/owner/edit-hotel/:id" element={ownerPage(<EditHotel />)} />
                <Route path="/owner/manage-rooms/:id" element={ownerPage(<ManageRooms />)} />
                <Route path="/owner/bookings" element={ownerPage(<OwnerBookings />)} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </main>
    </>;
}
