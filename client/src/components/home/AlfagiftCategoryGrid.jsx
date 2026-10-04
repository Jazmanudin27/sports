import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AlfagiftCategoryGrid Component (10 Ikon Menu Khas Alfagift)
 * Grid 5 kolom x 2 baris dengan lingkaran ikon & label badge kecil di pojok.
 */
export function AlfagiftCategoryGrid() {
  const categories = [
    // Baris 1
    { id: 'futsal', label: 'Futsal', icon: '⚽', badge: 'Promo', to: '/venues?sport_id=1' },
    { id: 'badminton', label: 'Badminton', icon: '🏸', badge: 'Live', to: '/venues?sport_id=2' },
    { id: 'basket', label: 'Basket', icon: '🏀', badge: null, to: '/venues?sport_id=3' },
    { id: 'padel', label: 'Padel', icon: '🎾', badge: 'Hot', to: '/venues?sport_id=4' },
    { id: 'minisoccer', label: 'Mini Soccer', icon: '🥅', badge: null, to: '/venues?sport_id=5' },

    // Baris 2
    { id: 'mabar', label: 'Main Bareng', icon: '🤝', badge: null, to: '/venues' },
    { id: 'turnamen', label: 'Turnamen', icon: '🏆', badge: null, to: '/venues' },
    { id: 'sewaalat', label: 'Sewa Alat', icon: '🎽', badge: null, to: '/venues' },
    { id: 'kantin', label: 'Kantin & Minum', icon: '🥤', badge: null, to: '/venues' },
    { id: 'vip', label: 'Member VIP', icon: '👑', badge: 'Poin', to: '/my-bookings' },
  ];

  return (
    <div className="alfa-categories-section">
      <div className="alfa-grid-5x2">
        {categories.map((c) => (
          <Link key={c.id} to={c.to} className="alfa-cat-tile" id={`cat-${c.id}`}>
            <div className="alfa-cat-icon-circle">
              {c.badge && (
                <span className={`alfa-cat-badge ${c.badge.toLowerCase()}`}>
                  {c.badge}
                </span>
              )}
              <span className="cat-emoji">{c.icon}</span>
            </div>
            <span className="alfa-cat-label">{c.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
export default AlfagiftCategoryGrid;
