import React from 'react';
import { Link } from 'react-router-dom';
import { rupiah, jam } from '../../lib.jsx';

/**
 * BookingHistorySection Component (Gaya Histori E-Sekolah)
 * Menampilkan judul "Jadwal & Histori Booking" + "View All" beserta kartu-kartu putih rapi.
 */
export function BookingHistorySection({ bookings = [], venues = [] }) {
  // Jika ada riwayat booking user, tampilkan. Jika belum, tampilkan jadwal venue aktif rekomendasi.
  const hasBookings = bookings && bookings.length > 0;

  return (
    <div className="history-section-wrapper">
      <div className="history-section-header">
        <h3 className="history-title">
          {hasBookings ? 'Jadwal & Booking Saya' : 'Rekomendasi Lapang Terdekat'}
        </h3>
        <Link to={hasBookings ? '/my-bookings' : '/venues'} className="view-all-link">
          View All
        </Link>
      </div>

      <div className="history-list-cards">
        {hasBookings ? (
          bookings.slice(0, 4).map((b) => (
            <div key={b.id} className="history-card-item">
              <div className="history-card-left">
                <div className="history-sport-icon">
                  <span>{b.icon || '⚽'}</span>
                </div>
                <div className="history-details">
                  <h4 className="venue-name-bold">{b.venue_name}</h4>
                  <p className="court-and-date">
                    {b.court_name} • {b.date}
                  </p>
                  <span className="booking-time-badge">
                    🕒 {jam(b.start_time)} - {jam(b.end_time)} WIB
                  </span>
                </div>
              </div>

              <div className="history-card-right">
                <span className={`status-pill ${b.status}`}>
                  {b.status}
                </span>
                <span className="price-tag-sm">{rupiah(b.total_price)}</span>
              </div>
            </div>
          ))
        ) : (
          venues.slice(0, 3).map((v) => (
            <Link key={v.id} to={`/venue/${v.slug}`} className="history-card-item card-link">
              <div className="history-card-left">
                <div className="history-sport-icon">
                  <span>🏟️</span>
                </div>
                <div className="history-details">
                  <h4 className="venue-name-bold">{v.name}</h4>
                  <p className="court-and-date">
                    📍 {v.city} • {v.court_count} Lapangan
                  </p>
                  <span className="booking-time-badge">
                    🕒 Buka {jam(v.open_time)} - {jam(v.close_time)} WIB
                  </span>
                </div>
              </div>

              <div className="history-card-right">
                <span className="status-pill confirmed">Buka</span>
                <span className="price-tag-sm">{rupiah(v.min_price)}/jam</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
export default BookingHistorySection;
