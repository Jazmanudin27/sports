import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../lib.jsx';

/**
 * BlueGridMenu Component (Gaya 8 Tombol Biru E-Sekolah)
 * Grid 4x2 tombol squircle warna biru royal dengan ikon jelas dan teks rapi.
 */
export function BlueGridMenu() {
  const { user } = useApp();
  const isStaff = user && user.role !== 'member';

  const menuItems = [
    { id: 'futsal', label: 'Futsal', icon: '⚽', to: '/venues?sport_id=1' },
    { id: 'badminton', label: 'Badminton', icon: '🏸', to: '/venues?sport_id=2' },
    { id: 'basket', label: 'Basket', icon: '🏀', to: '/venues?sport_id=3' },
    { id: 'padel', label: 'Padel', icon: '🎾', to: '/venues?sport_id=4' },
    { id: 'minisoccer', label: 'Mini Soccer', icon: '🥅', to: '/venues?sport_id=5' },
    { id: 'mabar', label: 'Mabar', icon: '🤝', to: '/venues' },
    { id: 'turnamen', label: 'Turnamen', icon: '🏆', to: '/venues' },
    { 
      id: isStaff ? 'keuangan' : 'promo', 
      label: isStaff ? 'Keuangan' : 'Promo', 
      icon: isStaff ? '💰' : '🏷️', 
      to: isStaff ? '/admin/finance' : '/venues' 
    },
  ];

  return (
    <div className="blue-menu-grid-wrapper">
      <div className="blue-menu-grid-4">
        {menuItems.map((item) => (
          <Link key={item.id} to={item.to} className="blue-menu-item-link" id={`menu-${item.id}`}>
            <div className="blue-squircle-button">
              <span className="menu-icon-emoji">{item.icon}</span>
            </div>
            <span className="blue-menu-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
export default BlueGridMenu;
