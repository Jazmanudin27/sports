import React from 'react';
import { Link } from 'react-router-dom';
import { rupiah } from '../../lib.jsx';

/**
 * AlfagiftRecomCarousel Component
 * Section "Rekomendasi Untuk Kamu" bergaya card produk Alfagift
 * - Foto Lapangan dengan Tag Kategori Lapangan
 * - Nama Lapangan & Sport Center
 * - Harga / jam & Badge Booking Instan
 * - Tombol "+ Booking" Biru Solid
 */
export function AlfagiftRecomCarousel({ 
  items = [], 
  favorites = [], 
  onToggleFavorite, 
  onSeeAll 
}) {
  return (
    <section className="alfa-recom-section">
      <div className="alfa-recom-header-row">
        <h2 className="alfa-recom-title">Rekomendasi Untuk Kamu</h2>
        <button 
          type="button" 
          className="alfa-see-all-link-btn"
          onClick={onSeeAll}
        >
          Lihat Semua
        </button>
      </div>

      <div className="alfa-recom-horizontal-scroll">
        {items.map((court) => {
          const isFav = favorites.includes(court.id);
          return (
            <div key={court.id} className="alfa-court-product-card">
              {/* Cover Gambar Lapangan */}
              <div className="alfa-court-card-media">
                <img 
                  src={court.image} 
                  alt={court.name} 
                  className="alfa-court-img"
                  loading="lazy"
                />
                
                {/* Tombol Favorit ❤️ */}
                <button
                  type="button"
                  className={`alfa-card-fav-btn ${isFav ? 'is-fav' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(court.id);
                  }}
                  title={isFav ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                >
                  {isFav ? '❤️' : '🤍'}
                </button>

                {/* Badge Tipe Lapang di Bawah Foto (seperti label Air Mineral / Susu di Alfagift) */}
                <span className="alfa-court-spec-badge">
                  {court.specBadge || court.sportName}
                </span>
              </div>

              {/* Konten & Nama Lapangan */}
              <div className="alfa-court-card-body">
                <Link to={`/venue/${court.venueSlug}`} className="alfa-court-title-link">
                  <h3 className="alfa-court-name" title={court.name}>
                    {court.name}
                  </h3>
                </Link>
                
                <p className="alfa-court-venue-sub" title={court.venueName}>
                  {court.venueName}
                </p>

                {/* Harga Sewa */}
                <div className="alfa-court-price-box">
                  <span className="alfa-court-price-val">
                    {rupiah(court.price)}
                  </span>
                  <small className="alfa-court-price-unit">/jam</small>
                </div>

                {/* Tag Booking Instan dengan Petir */}
                <div className="alfa-instant-badge">
                  <span className="flash-icon">⚡</span>
                  <span>Booking Instan</span>
                </div>

                {/* Tombol "+ Booking" Biru (mirip "+ Keranjang") */}
                <Link 
                  to={`/venue/${court.venueSlug}?court_id=${court.id}`} 
                  className="alfa-btn-add-booking"
                >
                  + Booking
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AlfagiftRecomCarousel;
