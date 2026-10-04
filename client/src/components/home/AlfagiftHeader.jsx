import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * AlfagiftHeader Component (Gaya Alfagift Mobile)
 * - Baris Alamat / Lokasi Pengguna dengan Dropdown
 * - 3 Tombol Aksi Kanan (Chat 💬, Notif 🔔, dan Ganti Warna Tema 🎨)
 * - Baris Search Bar Putih dengan Tombol Scan Barcode & Favorite Love
 */
export function AlfagiftHeader({ selectedCity, onSelectCity, cities = [] }) {
  const { openThemeModal } = useApp();
  const navigate = useNavigate();
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchVal.trim()) {
      navigate(`/venues?q=${encodeURIComponent(searchVal)}`);
    }
  };

  return (
    <div className="alfagift-header-container">
      {/* 1. Baris Atas: Alamat & Aksi */}
      <div className="alfa-top-row">
        {/* Alamat / Lokasi Dropdown */}
        <div className="alfa-location-picker" onClick={() => setShowLocationSheet(true)}>
          <span className="alfa-location-caption">Lokasi main:</span>
          <div className="alfa-location-title-row">
            <span className="alfa-location-main-title">{selectedCity || 'Bandung'}</span>
            <span className="alfa-badge-pill">Utama</span>
            <span className="alfa-dropdown-caret">▾</span>
          </div>
          <p className="alfa-address-sub">Jl. Dipatiukur No. 45, Kota Bandung...</p>
        </div>

        {/* 3 Tombol Icon Atas */}
        <div className="alfa-action-icons-group">
          {/* Chat / Bantuan */}
          <button 
            type="button" 
            className="alfa-top-icon-btn" 
            title="Chat Bantuan"
            onClick={() => alert('Layanan bantuan WhatsApp Sport Center: 081234567890')}
          >
            <span>💬</span>
          </button>

          {/* Notifikasi dengan Badge */}
          <button 
            type="button" 
            className="alfa-top-icon-btn notif-btn" 
            title="Notifikasi Promo"
            onClick={() => alert('Ada promo cashback sewa lapang hari ini!')}
          >
            <span>🔔</span>
            <span className="alfa-notif-ping" />
          </button>

          {/* Tombol Pengaturan Warna Tema (Palette) */}
          <button 
            type="button" 
            className="alfa-top-icon-btn theme-btn" 
            title="Ganti Warna Tema"
            onClick={openThemeModal}
          >
            <span>🎨</span>
          </button>
        </div>
      </div>

      {/* 2. Baris Search Bar Mengambang dengan Tombol Scan & Love */}
      <div className="alfa-search-action-row">
        <form className="alfa-search-card" onSubmit={handleSearchSubmit}>
          <span className="search-magnifier">🔍</span>
          <input
            type="text"
            className="alfa-search-input"
            placeholder="Cari lapang futsal, badminton, basket..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>

        {/* Tombol Barcode / Scan */}
        <button 
          type="button" 
          className="alfa-tool-btn scan-btn" 
          title="Scan QR Lapangan"
          onClick={() => alert('Kamera Scan QR Lapangan Siap')}
        >
          <span>[+]</span>
        </button>

        {/* Tombol Favorit / Love */}
        <button 
          type="button" 
          className="alfa-tool-btn love-btn" 
          title="Lapangan Favorit"
          onClick={() => navigate('/venues')}
        >
          <span>❤️</span>
        </button>
      </div>

      {/* Bottom Sheet Modal Pemilih Kota */}
      {showLocationSheet && (
        <div className="modal-backdrop" onClick={() => setShowLocationSheet(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sheet-header">
              <h3>Pilih Kota Lapangan</h3>
              <button className="close-btn" onClick={() => setShowLocationSheet(false)}>✕</button>
            </div>
            <div className="city-options-list">
              <button 
                className={`city-item ${!selectedCity ? 'active' : ''}`}
                onClick={() => { onSelectCity(''); setShowLocationSheet(false); }}
              >
                <span>🌐 Semua Kota</span>
                {!selectedCity && <span className="check">✓</span>}
              </button>
              {cities.map((c) => (
                <button
                  key={c}
                  className={`city-item ${selectedCity === c ? 'active' : ''}`}
                  onClick={() => { onSelectCity(c); setShowLocationSheet(false); }}
                >
                  <span>📍 {c}</span>
                  {selectedCity === c && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AlfagiftHeader;
