import React from 'react';
import { Link } from 'react-router-dom';

const ACTIONS = [
  { id: 'sewa', label: 'Sewa Lapang', icon: '🏟️', to: '/venues', badge: 'Populer' },
  { id: 'mabar', label: 'Main Bareng', icon: '🤝', to: '/venues', badge: 'Baru' },
  { id: 'turnamen', label: 'Turnamen', icon: '🏆', to: '/venues', badge: 'Event' },
  { id: 'promo', label: 'Voucher Hemat', icon: '🏷️', to: '/venues', badge: '25% Off' },
];

/**
 * QuickActionGrid Component
 * Baris menu cepat khas aplikasi Android untuk akses fitur utama.
 */
export function QuickActionGrid() {
  return (
    <div className="quick-action-grid">
      {ACTIONS.map((item) => (
        <Link key={item.id} to={item.to} className="action-tile" id={`quick-${item.id}`}>
          <div className="action-icon-circle">
            <span className="icon-emoji">{item.icon}</span>
            {item.badge && <span className="action-badge">{item.badge}</span>}
          </div>
          <span className="action-label">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
export default QuickActionGrid;
