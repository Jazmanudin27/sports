import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * Navbar Component (Desktop Header)
 */
export function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const isStaff = user && user.role !== 'member';

  return (
    <header className="nav">
      <div className="container">
        <Link to="/" className="logo" id="nav-logo">
          <span className="dot" />
          Arena<span className="grad-text">Ku</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>Beranda</NavLink>
          <NavLink to="/venues">Cari Lapangan</NavLink>
          {user && <NavLink to="/my-bookings">Booking Saya</NavLink>}
          {isStaff && (
            <Link to="/admin" className="btn btn-sm" id="nav-admin">
              ⚙️ Panel Admin
            </Link>
          )}
          {user ? (
            <button
              type="button"
              className="btn btn-sm"
              id="nav-logout"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Keluar
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="nav-login">
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
export default Navbar;
