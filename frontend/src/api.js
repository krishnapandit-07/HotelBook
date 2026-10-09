const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
    const token = localStorage.getItem('hotelbook_token');

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

const post = (body) => ({
    method: 'POST',
    body: JSON.stringify(body)
});

const put = (body) => ({
    method: 'PUT',
    body: JSON.stringify(body)
});

export const api = {
    login: (values) => request('/auth/login', post(values)),
    register: (values) => request('/auth/register', post(values)),

    getHotels: (query = '') =>
        request(`/hotels${query ? `?${query}` : ''}`),

    getHotel: (id) => request(`/hotels/${id}`),

    createBooking: (values) => request('/bookings', post(values)),
    getBookings: () => request('/bookings/mine'),

    cancelBooking: (id, reason) =>
        request(`/bookings/${id}/cancel`, post({ reason })),

    rateBooking: (id, rating) =>
        request(`/bookings/${id}/rating`, post({ rating })),

    getWishlist: () => request('/wishlist'),
    addWishlist: (hotelId) => request('/wishlist', post({ hotelId })),

    removeWishlist: (hotelId) =>
        request(`/wishlist/${hotelId}`, { method: 'DELETE' }),

    getProfile: () => request('/users/me'),
    updateProfile: (values) => request('/users/me', put(values)),

    getOwnerHotels: () => request('/owner/hotels'),
    addHotel: (values) => request('/owner/hotels', post(values)),

    editHotel: (id, values) =>
        request(`/owner/hotels/${id}`, put(values)),

    getRooms: (hotelId) => request(`/rooms/hotel/${hotelId}`),
    addRoom: (values) => request('/rooms', post(values)),

    editRoom: (id, values) =>
        request(`/rooms/${id}`, put(values)),

    deleteRoom: (id) =>
        request(`/rooms/${id}`, { method: 'DELETE' }),

    getOwnerBookings: () => request('/owner/bookings')
};