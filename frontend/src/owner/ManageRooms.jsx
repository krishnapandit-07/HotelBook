import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

const blankRoom = { roomType: '', price: '', capacity: '', beds: '', availability: true };

export default function ManageRooms() {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [roomFormOpen, setRoomFormOpen] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [roomForm, setRoomForm] = useState(blankRoom);
    const [saving, setSaving] = useState(false);

    async function refresh(hotelId = id) {
        const result = await api.getRooms(hotelId);
        setItems(result.rooms || []);
    }

    useEffect(() => {
        api.getOwnerHotels()
            .then(async data => {
                const ownedHotel = (data.hotels || []).find(item => String(item.id) === id);
                if (!ownedHotel) {
                    setError('This hotel is not part of your account.');
                    return;
                }
                setHotel(ownedHotel);
                await refresh(ownedHotel.id);
            })
            .catch(requestError => setError(requestError.message));
    }, [id]);

    function startAddingRoom() {
        setError('');
        setEditingRoomId(null);
        setRoomForm(blankRoom);
        setRoomFormOpen(true);
    }

    function startEditingRoom(room) {
        setError('');
        setEditingRoomId(room.id);
        setRoomForm({
            roomType: room.room_type || '',
            price: String(room.price ?? ''),
            capacity: String(room.capacity ?? ''),
            beds: String(room.beds ?? ''),
            availability: Boolean(room.availability)
        });
        setRoomFormOpen(true);
    }

    function closeRoomForm() {
        setRoomFormOpen(false);
        setEditingRoomId(null);
        setRoomForm(blankRoom);
        setError('');
    }

    async function saveRoom(event) {
        event.preventDefault();
        setSaving(true);
        setError('');
        const values = {
            hotelId: id,
            roomType: roomForm.roomType.trim(),
            price: Number(roomForm.price),
            capacity: Number(roomForm.capacity),
            beds: Number(roomForm.beds),
            availability: roomForm.availability
        };
        try {
            if (editingRoomId) {
                await api.editRoom(editingRoomId, values);
            } else {
                await api.addRoom(values);
            }
            await refresh();
            closeRoomForm();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteRoom(roomId) {
        setError('');
        try {
            await api.deleteRoom(roomId);
            await refresh();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    function updateRoomForm(event) {
        const { name, value } = event.target;
        setRoomForm(current => ({
            ...current,
            [name]: name === 'availability' ? value === 'true' : value
        }));
    }

    return <section className="hotelbook-page-layout owner-page-layout">
        <div className="page-heading-group">
            <div>
                <h1>Manage rooms</h1>
            </div>
            <Link className="navigation-back-link" to="/owner/hotels">← My Hotels</Link>
        </div>

        {error && <p className="form-error-message">{error}</p>}

        {hotel && <div className="hotel-room-manager">
            <div className="page-section-heading">
                <div>
                    <h2>Room types</h2>
                </div>
                {!roomFormOpen && <button type="button" className="owner-add-room-button" onClick={startAddingRoom}>＋ Add Room</button>}
            </div>

            {roomFormOpen && <form className="owner-hotel-form room-editor-form" onSubmit={saveRoom}>
                <h3>{editingRoomId ? 'Edit room' : 'Add a room'}</h3>
                <div className="form-field-layout">
                    <label>Room type<input name="roomType" required value={roomForm.roomType} onChange={updateRoomForm} placeholder="e.g. Deluxe King Room" /></label>
                    <label>Price per night (₹)<input name="price" type="number" min="1" step="0.01" required value={roomForm.price} onChange={updateRoomForm} placeholder="2500" /></label>
                    <label>Guest capacity<input name="capacity" type="number" min="1" max="255" required value={roomForm.capacity} onChange={updateRoomForm} placeholder="2" /></label>
                    <label>Number of beds<input name="beds" type="number" min="1" max="255" required value={roomForm.beds} onChange={updateRoomForm} placeholder="1" /></label>
                    <label>Availability<select name="availability" value={String(roomForm.availability)} onChange={updateRoomForm}><option value="true">Available</option><option value="false">Unavailable</option></select></label>
                </div>
                <div className="room-editor-actions">
                    <button className="owner-save-hotel-button" disabled={saving}>{saving ? 'Saving…' : editingRoomId ? 'Save Changes' : 'Add Room'}</button>
                    <button type="button" className="profile-cancel-button" onClick={closeRoomForm}>Cancel</button>
                </div>
            </form>}

            {items.length ? items.map(room => <article className="managed-room-entry" key={room.id}>
                <div className="managed-room-symbol">⌂</div>
                <div className="managed-room-details">
                    <h3>{room.room_type}</h3>
                    <p className="supporting-copy">{room.beds} {room.beds === 1 ? 'bed' : 'beds'} · Up to {room.capacity} guests</p>
                </div>
                <strong className="nightly-price">₹{Number(room.price).toLocaleString('en-IN')} <small>/ night</small></strong>
                <span className="room-availability-status">{room.availability ? 'Available' : 'Unavailable'}</span>
                <div className="managed-room-actions">
                    <button className="room-edit-button" onClick={() => startEditingRoom(room)}>Edit</button>
                    <button className="room-delete-button" onClick={() => deleteRoom(room.id)}>Delete</button>
                </div>
            </article>) : <div className="empty-results-panel"><h3>No rooms added yet.</h3></div>}
        </div>}
    </section>;
}
