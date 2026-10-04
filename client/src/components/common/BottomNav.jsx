import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * BottomNav Component (5 Tab Alfagift Style)
 * - Beranda
 * - Lapangan
 * - Promo
 * - Pesanan / Booking
 * - Akun / Profile
 */
export function BottomNav() {
  const { user, openThemeModal } = useApp();
  const isStaff = user && user.role !== 'member';

  return (
    <div className="alfa-bottom-nav-container">
      <nav className="alfa-bottom-nav-bar">
        {/* 1. Beranda */}
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `alfa-tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="tab-glyph">🏠</span>
          <span className="tab-text">Beranda</span>
        </NavLink>

        {/* 2. Lapangan (Belanja) */}
        <NavLink 
          to="/venues" 
          className={({ isActive }) => `alfa-tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="tab-glyph">🏟️</span>
          <span className="tab-text">Lapangan</span>
        </NavLink>

        {/* 3. Promo */}
        <NavLink 
          to="/venues?promo=true" 
          className={({ isActive }) => `alfa-tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="tab-glyph">🏷️</span>
          <span className="tab-text">Promo</span>
        </NavLink>

        {/* 4. Pesanan / Booking */}
        <NavLink 
          to="/my-bookings" 
          className={({ isActive }) => `alfa-tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="tab-glyph">📋</span>
          <span className="tab-text">Pesanan</span>
        </NavLink>

        {/* 5. Akun */}
        {isStaff ? (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `alfa-tab-item ${isActive ? 'active' : ''}`}
          >
            <span className="tab-glyph">⚙️</span>
            <span className="tab-text">Admin</span>
          </NavLink>
        ) : (
          <NavLink 
            to={user ? "/my-bookings" : "/login"} 
            className={({ isActive }) => `alfa-tab-item ${isActive ? 'active' : ''}`}
          >
            <span className="tab-glyph">👤</span>
            <span className="tab-text">Akun</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}
export default BottomNav;
