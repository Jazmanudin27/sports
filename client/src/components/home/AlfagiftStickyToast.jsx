import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AlfagiftStickyToast Component (Banner Sticky Melayang di Atas Bottom Nav)
 * Menampilkan penawaran flash sale / harga super khas Alfagift.
 */
export function AlfagiftStickyToast() {
  return (
    <div className="alfa-sticky-toast-container">
      <div className="alfa-sticky-toast-bar">
        <div className="toast-left-info">
          <span className="toast-fire-icon">🔥</span>
          <div className="toast-text-wrap">
            <b className="toast-headline">HARGA SUPER LAPANGAN!</b>
            <span className="toast-subtext">Diskon malam hingga 35% + Free 2 Air Mineral</span>
          </div>
        </div>

        <Link to="/venues" className="toast-action-btn">
          Lihat
        </Link>
      </div>
    </div>
  );
}
export default AlfagiftStickyToast;
