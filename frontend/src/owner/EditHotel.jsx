import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { HotelForm } from './AddHotel.jsx';

export default function EditHotel(){
  const {id}=useParams();
  const [hotel,setHotel]=useState(null);
  const [error,setError]=useState('');
  useEffect(()=>{api.getOwnerHotels().then(data=>{const match=(data.hotels||[]).find(item=>String(item.id)===id);if(match)setHotel(match);else setError('This hotel is not part of your account.')}).catch(requestError=>setError(requestError.message))},[id]);
  return <section className="hotelbook-page-layout owner-page-layout"><div className="page-heading-group"><h1>Edit hotel</h1><Link className="navigation-back-link" to="/owner/hotels">← My Hotels</Link></div>{hotel?<HotelForm button="Save Changes" initial={hotel} hotelId={id}/>:error?<p className="form-error-message">{error}</p>:<p className="supporting-copy">Loading…</p>}</section>
}
