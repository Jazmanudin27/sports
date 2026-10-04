import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * BottomNav Component (Floating Curved Capsule E-Sekolah Style)
 * Bar navigasi bawah mengambang dengan Tombol Tengah Menonjol (Center FAB).
 */
export function BottomNav() {
  const { user } = useApp();
  const isStaff = user && user.role !== 'member';

  return (
    <div className="bottom-nav-floating-container">
      <nav className="bottom-nav-capsule">
        {/* 1. Beranda */}
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `capsule-tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="tab-icon">🏠</span>
          <span className="tab-label">Beranda</span>
        </NavLink>

        {/* 2. Cari / Lapangan */}
        <NavLink 
          to="/venues" 
          className={({ isActive }) => `capsule-tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="tab-icon">🔍</span>
          <span className="tab-label">Cari Lapang</span>
        </NavLink>

        {/* 3. CENTER FLOATING BUTTON (FAB) */}
        <div className="center-fab-wrapper">
          <NavLink to="/venues" className="center-fab-circle" title="Booking Instan">
            <span className="fab-icon">⚡</span>
          </NavLink>
        </div>

        {/* 4. Histori / Booking */}
        <NavLink 
          to="/my-bookings" 
          className={({ isActive }) => `capsule-tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="tab-icon">🎟️</span>
          <span className="tab-label">Histori</span>
        </NavLink>

        {/* 5. Profile / Admin */}
        {isStaff ? (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `capsule-tab-item ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon">⚙️</span>
            <span className="tab-label">Admin</span>
          </NavLink>
        ) : (
          <NavLink 
            to={user ? "/my-bookings" : "/login"} 
            className={({ isActive }) => `capsule-tab-item ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-label">Profile</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}
export default BottomNav;
