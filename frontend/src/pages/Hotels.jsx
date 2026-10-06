import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import HotelCard from '../components/HotelCard.jsx';

export default function Hotels(){
  const [params]=useSearchParams();
  const [term,setTerm]=useState(params.get('location')||'');
  const [hotels,setHotels]=useState([]);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  useEffect(()=>{api.getHotels().then(data=>setHotels(data.hotels||[])).catch(requestError=>setError(requestError.message))},[]);
  const shown=useMemo(()=>hotels.filter(h=>`${h.name} ${h.location}`.toLowerCase().includes(term.toLowerCase())),[hotels,term]);
  async function saveToWishlist(hotelId){setError('');setNotice('');try{await api.addWishlist(hotelId);setNotice('Hotel saved to your wishlist.')}catch(requestError){setError(requestError.message)}}
  return <section className="hotelbook-page-layout"><div className="page-heading-group"><h1>Find Hotels</h1></div><form className="hotel-search-filter-panel" onSubmit={e=>e.preventDefault()}><label>Location<input value={term} onChange={e=>setTerm(e.target.value)} placeholder="City or hotel name"/></label><label>Check-in<input type="date"/></label><label>Check-out<input type="date"/></label><label>Guests<input type="number" min="1" defaultValue="2"/></label><button className="hotel-search-button">Search</button></form>{error&&<p className="form-error-message">{error}</p>}{notice&&<p className="form-success-message">{notice}</p>}{shown.length?<div className="hotel-card-grid">{shown.map(h=><HotelCard key={h.id} hotel={h} onSave={saveToWishlist}/>)}</div>:!error&&<div className="empty-results-panel"><h3>No hotels found</h3></div>}</section>
}
