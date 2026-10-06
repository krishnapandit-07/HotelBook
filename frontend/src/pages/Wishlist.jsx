import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import HotelCard from '../components/HotelCard.jsx';

export default function Wishlist(){
  const [saved,setSaved]=useState([]);
  const [error,setError]=useState('');
  useEffect(()=>{api.getWishlist().then(data=>setSaved(data.hotels||[])).catch(requestError=>setError(requestError.message))},[]);
  async function removeHotel(id){try{await api.removeWishlist(id);setSaved(current=>current.filter(hotel=>hotel.id!==id))}catch(requestError){setError(requestError.message)}}
  return <section className="hotelbook-page-layout wishlist-page"><div className="page-heading-group"><h1>My Wishlist</h1><span className="wishlist-saved-count">♡ &nbsp;{saved.length} saved</span></div>{error&&<p className="form-error-message">{error}</p>}{saved.length?<div className="hotel-card-grid">{saved.map(h=><HotelCard key={h.id} hotel={h} onRemove={removeHotel}/>)}</div>:!error&&<div className="empty-results-panel"><h3>Your wishlist is empty.</h3><Link to="/hotels" className="wishlist-discover-hotels-link">Discover stays</Link></div>}</section>
}
