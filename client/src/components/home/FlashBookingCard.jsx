import React from 'react';
import { Link } from 'react-router-dom';

/**
 * FlashBookingCard Component
 * Widget ringkas untuk booking cepat slot kosong hari ini.
 */
export function FlashBookingCard({ venueCount = 0 }) {
  return (
    <div className="flash-booking-banner">
      <div className="flash-icon-box">
        <span>⚡</span>
      </div>
      <div className="flash-texts">
        <h4>Jadwal Lapang Kosong Hari Ini</h4>
        <p className="muted">Ada {venueCount || 3} venue aktif siap dibooking untuk main malam ini.</p>
      </div>
      <Link to="/venues" className="flash-btn">
        Lihat Slot
      </Link>
    </div>
  );
}
export default FlashBookingCard;
