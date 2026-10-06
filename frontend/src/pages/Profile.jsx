import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    api.getProfile().then(setUser).catch((requestError) => setError(requestError.message));
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setError('');
    try {
      await api.updateProfile({ name: user.name, phone: user.phone });
      localStorage.setItem('hotelbook_user', JSON.stringify({ ...JSON.parse(localStorage.getItem('hotelbook_user') || '{}'), ...user }));
      setEditing(false);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return <section className="hotelbook-page-layout profile-page"><div className="page-heading-group"><h1>Profile</h1></div><form className="user-profile-panel" onSubmit={saveProfile}><div className="profile-initial-avatar">{user.name?.slice(0, 1) || 'H'}</div><div className="profile-form-fields"><label>Name<input required disabled={!editing} value={user.name} onChange={e=>setUser({...user,name:e.target.value})}/></label><label>Email<input disabled type="email" value={user.email} readOnly/></label><label>Phone<input disabled={!editing} value={user.phone||''} onChange={e=>setUser({...user,phone:e.target.value})}/></label></div>{error&&<p className="form-error-message">{error}</p>}{saved&&<p className="form-success-message">✓ Profile changes saved.</p>}<div className="profile-form-actions">{editing?<><button className="profile-save-button">Save Changes</button><button type="button" className="profile-cancel-button" onClick={()=>{setEditing(false);api.getProfile().then(setUser)}}>Cancel</button></>:<button type="button" className="profile-edit-button" onClick={()=>{setEditing(true);setSaved(false)}}>Edit Profile</button>}</div></form></section>
}
