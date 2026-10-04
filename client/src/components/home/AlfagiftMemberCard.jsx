import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * AlfagiftMemberCard Component (Kartu Loyalitas Member Alfagift)
 * - Header Hijau/Teal Gradasi: "Hai, Jazmanudin" + "👑 Member VIP >"
 * - 4 Kolom Stat: Poin, Voucher, Jam Main, Rating Star
 * - Alert Bar Kuning: "1 voucher segera kedaluwarsa"
 * - Footer Row: "Hubungkan E-Wallet" + "Barcode Member"
 */
export function AlfagiftMemberCard({ userBookingsCount = 0 }) {
  const { user } = useApp();
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Jazmanudin';

  return (
    <div className="alfa-member-card-wrapper">
      <div className="alfa-member-card">
        {/* 1. Header Kartu (Gradasi Teal) */}
        <div className="alfa-card-top-header">
          <div className="alfa-user-greet">
            <h3>Hai, {displayName}</h3>
          </div>
          <Link to="/my-bookings" className="alfa-tier-pill">
            <span className="tier-icon">👑</span>
            <span className="tier-name">Gold Member</span>
            <span className="tier-arrow">›</span>
          </Link>
        </div>

        {/* 2. Isi Kartu (4 Poin & Voucher) */}
        <div className="alfa-card-stats-body">
          {/* Stat 1: Poin */}
          <div className="alfa-stat-col">
            <div className="stat-val-row">
              <span className="stat-badge-coin">P</span>
              <b className="stat-number">11.297</b>
            </div>
            <span className="stat-subtext">Tukar Poin</span>
          </div>

          {/* Stat 2: Voucher */}
          <div className="alfa-stat-col">
            <div className="stat-val-row">
              <span className="stat-emoji-small">🎟️</span>
              <b className="stat-number">4</b>
            </div>
            <span className="stat-subtext">Voucher</span>
          </div>

          {/* Stat 3: Jam Main */}
          <div className="alfa-stat-col">
            <div className="stat-val-row">
              <span className="stat-emoji-small">🏟️</span>
              <b className="stat-number">{userBookingsCount || 8}</b>
            </div>
            <span className="stat-subtext">Jam Main</span>
          </div>

          {/* Stat 4: Rating Bintang */}
          <div className="alfa-stat-col">
            <div className="stat-val-row">
              <span className="stat-emoji-small">⭐</span>
              <b className="stat-number">4.9</b>
            </div>
            <span className="stat-subtext">Star</span>
          </div>
        </div>

        {/* 3. Alert Kuning (Voucher Expiring) */}
        <div className="alfa-alert-warning-bar">
          <span className="warning-dot">⚠️</span>
          <span><b>1 voucher sewa lapang</b> segera kedaluwarsa</span>
        </div>

        {/* 4. Footer Kartu (E-Wallet + Barcode Member) */}
        <div className="alfa-card-footer-row">
          <div className="alfa-wallet-link" onClick={() => alert('Saldo E-Wallet ArenaKu: Rp 250.000 (GoPay Terhubung)')}>
            <span className="wallet-icon">💳</span>
            <span className="wallet-label">Hubungkan GoPay / Saldo</span>
            <span className="wallet-chevron">›</span>
          </div>

          <button 
            type="button" 
            className="alfa-barcode-btn" 
            onClick={() => setShowBarcodeModal(true)}
          >
            <span className="barcode-bars">|||||||</span>
            <span className="barcode-title">Barcode Member</span>
          </button>
        </div>
      </div>

      {/* Modal Barcode Member */}
      {showBarcodeModal && (
        <div className="modal-backdrop" onClick={() => setShowBarcodeModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sheet-header">
              <h3>Kartu Digital Member</h3>
              <button className="close-btn" onClick={() => setShowBarcodeModal(false)}>✕</button>
            </div>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', letterSpacing: 4, fontFamily: 'monospace' }}>
                |||| | ||||| || ||||
              </div>
              <p style={{ marginTop: 8, fontWeight: 700, letterSpacing: 2 }}>
                ARK-{user?.id ? String(user.id).padStart(6, '0') : '998271'}
              </p>
              <p className="muted" style={{ fontSize: '.85rem', marginTop: 4 }}>
                Tunjukkan barcode ini ke kasir sport center saat check-in lapang.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AlfagiftMemberCard;
