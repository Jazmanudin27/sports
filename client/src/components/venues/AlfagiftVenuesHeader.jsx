import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * AlfagiftVenuesHeader Component
 * Header biru untuk menu "Daftar Lapangan" ala Alfagift
 * - Title: Daftar Lapangan
 * - Search bar toggle / Cari langsung
 * - Booking Cart / Status Icon
 * - Subheader Tabs: 📋 Lapangan Populer & ❤️ Lapangan Favorit
 */
export function AlfagiftVenuesHeader({ 
  activeTab = 'popular', 
  onTabChange, 
  searchQuery = '', 
  onSearchChange,
  favoriteCount = 0
}) {
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const { user } = useApp();

  return (
    <div className="alfa-venues-header-wrapper">
      {/* 1. Top Bar Biru Royal */}
      <header className="alfa-venues-topbar">
        <div className="alfa-venues-topbar-left">
          <button 
            type="button" 
            className="alfa-back-btn" 
            onClick={() => navigate('/')}
            title="Kembali ke Beranda"
          >
            ←
          </button>
          <h1 className="alfa-venues-page-title">Daftar Lapangan</h1>
        </div>

        <div className="alfa-venues-topbar-right">
          <button 
            type="button" 
            className={`alfa-icon-action-btn ${showSearch ? 'active' : ''}`}
            onClick={() => setShowSearch(!showSearch)}
            title="Cari Lapangan"
          >
            🔍
          </button>
          
          <Link 
            to={user ? "/my-bookings" : "/login"} 
            className="alfa-icon-action-btn alfa-cart-btn"
            title="Jadwal & Booking Saya"
          >
            🛍️
            <span className="alfa-cart-badge">
              {user ? '✓' : '0'}
            </span>
          </Link>
        </div>
      </header>

      {/* 2. Interactive Search Box (Bisa Ditoggle) */}
      {showSearch && (
        <div className="alfa-venues-search-bar animate-fade">
          <div className="alfa-venues-search-inner">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Cari lapangan vinyl, badminton, futsal..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => onSearchChange('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Subheader Tabs (Putih dengan Garis Bawah Biru Aktif) */}
      <nav className="alfa-venues-subtabs">
        <button
          type="button"
          className={`alfa-subtab-btn ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => onTabChange('popular')}
        >
          <span className="subtab-icon">📋</span>
          <span className="subtab-label">Lapangan Populer</span>
          {activeTab === 'popular' && <div className="subtab-active-indicator" />}
        </button>

        <button
          type="button"
          className={`alfa-subtab-btn ${activeTab === 'favorite' ? 'active' : ''}`}
          onClick={() => onTabChange('favorite')}
        >
          <span className="subtab-icon">❤️</span>
          <span className="subtab-label">Lapangan Favorit {favoriteCount > 0 ? `(${favoriteCount})` : ''}</span>
          {activeTab === 'favorite' && <div className="subtab-active-indicator" />}
        </button>
      </nav>
    </div>
  );
}

export default AlfagiftVenuesHeader;
