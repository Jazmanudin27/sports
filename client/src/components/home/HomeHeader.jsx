import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * HomeHeader Component (App Bar Android)
 * Menampilkan baris status atas: lokasi aktif, sapaan user, notifikasi & profil.
 */
export function HomeHeader({ selectedCity, onSelectCity, cities = [] }) {
  const { user } = useApp();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  return (
    <div className="home-header-android">
      <div className="header-top-row">
        {/* Lokasi Selector */}
        <div className="location-selector" onClick={() => setShowLocationModal(true)}>
          <span className="location-pin">📍</span>
          <div className="location-info">
            <span className="location-subtitle">Lokasi Olahraga</span>
            <div className="location-current">
              <b>{selectedCity || 'Semua Kota'}</b>
              <span className="arrow-down">▾</span>
            </div>
          </div>
        </div>

        {/* Action icons: Notifikasi & Avatar */}
        <div className="header-actions">
          <button 
            type="button" 
            className="icon-circle-btn" 
            onClick={() => setShowNotif(!showNotif)}
            title="Pemberitahuan"
          >
            <span>🔔</span>
            <span className="unread-dot" />
          </button>

          {user ? (
            <Link to="/my-bookings" className="user-avatar-btn" title="Akun Saya">
              <span>{user.name.charAt(0).toUpperCase()}</span>
            </Link>
          ) : (
            <Link to="/login" className="login-pill-btn">
              Masuk
            </Link>
          )}
        </div>
      </div>

      {/* Sapaan Pengguna */}
      <div className="header-greeting">
        <h2>
          {user ? `Halo, ${user.name.split(' ')[0]} 👋` : 'Mau main apa hari ini? ⚽'}
        </h2>
        <p className="muted">
          Cari lapangan kosong & booking instan di sekitarmu
        </p>
      </div>

      {/* Pop-up Ganti Kota */}
      {showLocationModal && (
        <div className="modal-backdrop" onClick={() => setShowLocationModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sheet-header">
              <h3>Pilih Kota Kamu</h3>
              <button className="close-btn" onClick={() => setShowLocationModal(false)}>✕</button>
            </div>
            <div className="city-options-list">
              <button 
                className={`city-item ${!selectedCity ? 'active' : ''}`}
                onClick={() => { onSelectCity(''); setShowLocationModal(false); }}
              >
                <span>🌐 Semua Kota</span>
                {!selectedCity && <span className="check">✓</span>}
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  className={`city-item ${selectedCity === city ? 'active' : ''}`}
                  onClick={() => { onSelectCity(city); setShowLocationModal(false); }}
                >
                  <span>📍 {city}</span>
                  {selectedCity === city && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Notifikasi Ringkas */}
      {showNotif && (
        <div className="notif-dropdown card" onClick={(e) => e.stopPropagation()}>
          <div className="notif-header">
            <b>Pemberitahuan</b>
            <button className="btn-sm" onClick={() => setShowNotif(false)}>Tutup</button>
          </div>
          <div className="notif-body">
            <div className="notif-item">
              <span className="notif-icon">🎉</span>
              <div>
                <p><b>Diskon Weekend 20%</b></p>
                <small className="muted">Nikmati potongan sewa lapang futsal & badminton setiap Sabtu-Minggu!</small>
              </div>
            </div>
            <div className="notif-item">
              <span className="notif-icon">⚽</span>
              <div>
                <p><b>Slot Sore Tersedia</b></p>
                <small className="muted">Beberapa slot prima jam 18:00–21:00 masih terbuka hari ini.</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default HomeHeader;
