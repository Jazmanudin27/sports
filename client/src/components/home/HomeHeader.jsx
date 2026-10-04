import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * Header App Bar bergaya E-Sekolah / Android Mobile Pro:
 * - Top Row: Logo + Badges 'PRO' + Icon Notifikasi (badge red) + Icon Keluar / Admin
 * - User Row: Avatar Squircle + Dot Online hijau + Greeting dinamis + Nama Lengkap + Date & Time WIB Pill
 */
export function HomeHeader({ onSelectCity, selectedCity, cities = [] }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  // Waktu real-time dinamis (WIB)
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [greeting, setGreeting] = useState('Selamat Siang');
  const [greetingIcon, setGreetingIcon] = useState('☀️');
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();

      // Sapaan waktu
      if (hours >= 4 && hours < 11) {
        setGreeting('Selamat Pagi');
        setGreetingIcon('🌅');
      } else if (hours >= 11 && hours < 15) {
        setGreeting('Selamat Siang');
        setGreetingIcon('☀️');
      } else if (hours >= 15 && hours < 18) {
        setGreeting('Selamat Sore');
        setGreetingIcon('🌤️');
      } else {
        setGreeting('Selamat Malam');
        setGreetingIcon('🌙');
      }

      // Format: Minggu, 04 Okt 2026 • 11.20 WIB
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

      const dayName = dayNames[now.getDay()];
      const day = String(now.getDate()).padStart(2, '0');
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');

      setCurrentDateTime(`${dayName}, ${day} ${month} ${year} • ${hh}.${mm} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Inisial avatar (contoh: AI atau SP)
  const getInitials = (name) => {
    if (!name) return 'SP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="esekolah-header-wrapper">
      {/* 1. Baris Atas: Logo App + PRO pill + Tombol Notif & Logout */}
      <div className="esekolah-top-bar">
        <div className="app-brand-badge">
          <span className="brand-icon">🏟️</span>
          <span className="brand-name">ArenaKu</span>
          <span className="pro-badge-pill">PRO</span>
        </div>

        <div className="top-action-buttons">
          <button 
            type="button" 
            className="action-icon-circle notif-btn" 
            onClick={() => setShowNotif(!showNotif)}
            aria-label="Pemberitahuan"
          >
            <span className="icon-emoji">🔔</span>
            <span className="badge-count-red">2</span>
          </button>

          {user ? (
            <button 
              type="button" 
              className="action-icon-circle exit-btn" 
              onClick={() => { logout(); navigate('/login'); }}
              title="Keluar"
              aria-label="Logout"
            >
              <span className="icon-emoji">↪</span>
            </button>
          ) : (
            <Link to="/login" className="action-icon-circle exit-btn" title="Masuk">
              <span className="icon-emoji">🔑</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Profil User & Tanggal */}
      <div className="user-profile-section">
        {/* Avatar Squircle dengan Online Green Dot */}
        <div className="avatar-squircle">
          <span className="avatar-initials">
            {getInitials(user?.name || 'Member Arena')}
          </span>
          <span className="online-indicator-dot" />
        </div>

        {/* Teks Sapaan, Nama & Waktu */}
        <div className="user-text-info">
          <div className="greeting-row">
            <span className="greeting-icon">{greetingIcon}</span>
            <span className="greeting-text">{greeting},</span>
          </div>

          <h2 className="user-fullname">
            {user?.name || 'Pecinta Olahraga'}
          </h2>

          <div className="date-time-pill">
            <span className="pill-icon">📅</span>
            <span className="pill-text">{currentDateTime || 'Memuat waktu...'}</span>
          </div>
        </div>
      </div>

      {/* Dropdown Notifikasi */}
      {showNotif && (
        <div className="notif-popup-card" onClick={(e) => e.stopPropagation()}>
          <div className="notif-popup-header">
            <b>Pemberitahuan Masuk</b>
            <button type="button" onClick={() => setShowNotif(false)}>✕</button>
          </div>
          <div className="notif-popup-list">
            <div className="notif-popup-item">
              <span>⚽</span>
              <div>
                <b>Slot Main Malam Ini</b>
                <p>Ada 3 lapangan futsal kosong jam 19.00 - 21.00 WIB.</p>
              </div>
            </div>
            <div className="notif-popup-item">
              <span>🎉</span>
              <div>
                <b>Diskon 25% Weekend</b>
                <p>Booking badminton di Lidya Sport lebih hemat hari ini.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default HomeHeader;
