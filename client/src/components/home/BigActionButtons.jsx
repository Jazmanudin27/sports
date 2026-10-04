import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BigActionButtons Component (Gaya 2 Tombol Besar Hijau & Merah E-Sekolah)
 * - Tombol Hijau: "Booking Lapang" (Cek Slot Kosong)
 * - Tombol Merah: "Jadwal Main" (Tiket Main Hari Ini)
 */
export function BigActionButtons({ nextSchedule = '19:00 WIB' }) {
  return (
    <div className="dual-big-buttons-grid">
      {/* Tombol Hijau: Booking Lapangan */}
      <Link to="/venues" className="big-action-card card-green">
        <div className="big-icon-bubble">
          <span>🏟️</span>
        </div>
        <div className="big-action-text">
          <h4 className="action-title">Booking Lapang</h4>
          <span className="action-subtitle">Cek Slot Kosong</span>
        </div>
      </Link>

      {/* Tombol Merah: Jadwal Main */}
      <Link to="/my-bookings" className="big-action-card card-red">
        <div className="big-icon-bubble">
          <span>🎟️</span>
        </div>
        <div className="big-action-text">
          <h4 className="action-title">Jadwal Main</h4>
          <span className="action-subtitle">{nextSchedule ? `Malam • ${nextSchedule}` : 'Belum Ada Jadwal'}</span>
        </div>
      </Link>
    </div>
  );
}
export default BigActionButtons;
