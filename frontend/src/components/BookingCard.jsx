import React from 'react';

const paymentMethodNames = { upi: 'UPI', card: 'Credit/debit card', net_banking: 'Net banking', pay_at_hotel: 'Pay at hotel' };

function formatBookingDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const pad = part => String(part).padStart(2, '0');
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function BookingCard({ booking }) {
    return <div className="reservation-card">
        <div className="reservation-hotel-summary">
            <h3>{booking.hotel || booking.hotelName || 'Hotel booking'}</h3>
            {booking.customer && <p className="supporting-copy">Guest: {booking.customer}</p>}
            <p className="supporting-copy">{booking.room || booking.roomType || 'Room'} · {booking.guests || 2} guests</p>
            {booking.payment_method && <p className="supporting-copy">Payment method: {paymentMethodNames[booking.payment_method] || booking.payment_method}</p>}
            {booking.cancellation_reason && <p className="supporting-copy">Cancellation reason: {booking.cancellation_reason}</p>}
        </div>
        <div className="reservation-stay-date"><span>Check-in</span><strong>{formatBookingDate(booking.check_in || booking.checkIn)}</strong></div>
        <div className="reservation-stay-date"><span>Check-out</span><strong>{formatBookingDate(booking.check_out || booking.checkOut)}</strong></div>
        <div className="reservation-price-summary">
            <strong>₹{Number(booking.total_amount || booking.total || 0).toLocaleString('en-IN')}</strong>
            <span className={`reservation-status-badge ${String(booking.status || 'confirmed').toLowerCase()}`}>{booking.status || 'Confirmed'}</span>
        </div>
    </div>;
}
