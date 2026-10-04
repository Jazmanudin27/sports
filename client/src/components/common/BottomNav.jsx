import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * BottomNav Component (Versi Android Mobile)
 * Navigasi bawah khas aplikasi Android, aktif di layar smartphone / mobile.
 */
export function BottomNav() {
  const { user } = useApp();
  const isStaff = user && user.role !== 'member';

  return (
    <nav className="mobile-bottom-nav" id="mobile-bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="icon">🏠</span>
        <span className="label">Beranda</span>
      </NavLink>

      <NavLink to="/venues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="icon">🔍</span>
        <span className="label">Cari Lapang</span>
      </NavLink>

      <NavLink to="/my-bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="icon">🎟️</span>
        <span className="label">Booking</span>
      </NavLink>

      {isStaff ? (
        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">⚙️</span>
          <span className="label">Admin</span>
        </NavLink>
      ) : (
        <NavLink to={user ? "/my-bookings" : "/login"} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">👤</span>
          <span className="label">{user ? 'Akun' : 'Masuk'}</span>
        </NavLink>
      )}
    </nav>
  );
}
export default BottomNav;
