import React from 'react';
import { Link } from 'react-router-dom';
import { rupiah, jam } from '../../lib.jsx';

/**
 * VenueCardAndroid Component
 * Card venue yang dioptimasi untuk tampilan Android: padat info, rapi, dan responsif.
 */
export function VenueCardAndroid({ venue }) {
  if (!venue) return null;

  // Olahraga yang tersedia
  const sportsList = venue.sports ? venue.sports.split(', ') : [];

  return (
    <div className="venue-card-android card-hover">
      <Link to={`/venue/${venue.slug}`} className="card-link-wrapper">
        {/* Cover Thumbnail */}
        <div className="card-cover-media">
          <div className="media-overlay" />
          <div className="top-badges">
            <span className="badge-verified">✓ Terverifikasi</span>
            <span className="badge-status">Buka {jam(venue.open_time)} - {jam(venue.close_time)}</span>
          </div>

          <div className="sports-emojis">
            {sportsList.map((s, idx) => (
              <span key={idx} className="sport-pill-tag">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Card Details */}
        <div className="card-info-body">
          <div className="card-title-row">
            <h3 className="venue-title">{venue.name}</h3>
            <div className="rating-pill">
              <span>⭐</span>
              <b>4.9</b>
            </div>
          </div>

          <div className="venue-location-row muted">
            <span className="location-icon">📍</span>
            <span className="location-text">{venue.address}, {venue.city}</span>
          </div>

          <div className="card-court-stat muted">
            <span>🏟️ {venue.court_count} Lapangan Tersedia</span>
            <span>·</span>
            <span>⚡ Konfirmasi Cepat</span>
          </div>

          {/* Pricing & CTA */}
          <div className="card-bottom-bar">
            <div className="price-block">
              <span className="price-label">Mulai dari</span>
              <div className="price-amount">
                <b className="grad-text">{rupiah(venue.min_price)}</b>
                <small className="muted"> /jam</small>
              </div>
            </div>

            <span className="btn-select-slot">
              Pilih Jam →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
export default VenueCardAndroid;
