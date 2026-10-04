import React from 'react';
import { Link } from 'react-router-dom';

/**
 * QuickStatsRow Component (Gaya 4 Kotak Squircle E-Sekolah)
 * Menampilkan 4 kartu status (Booking Aktif, Menunggu, Riwayat, Lapangan)
 */
export function QuickStatsRow({ activeBookingsCount = 2, pendingCount = 1 }) {
  const items = [
    {
      id: 'aktif',
      label: 'Booking',
      icon: '✅',
      bgClass: 'stat-green',
      badge: activeBookingsCount > 0 ? activeBookingsCount : null,
      to: '/my-bookings',
    },
    {
      id: 'pending',
      label: 'Menunggu',
      icon: '⏳',
      bgClass: 'stat-red',
      badge: pendingCount > 0 ? pendingCount : null,
      to: '/my-bookings',
    },
    {
      id: 'riwayat',
      label: 'Riwayat',
      icon: '📋',
      bgClass: 'stat-orange',
      badge: null,
      to: '/my-bookings',
    },
    {
      id: 'lapangan',
      label: 'Lapangan',
      icon: '🏟️',
      bgClass: 'stat-teal',
      badge: null,
      to: '/venues',
    },
  ];

  return (
    <div className="quick-stats-card-sheet">
      <div className="quick-stats-grid-4">
        {items.map((item) => (
          <Link key={item.id} to={item.to} className="stat-item-link">
            <div className={`stat-squircle-icon ${item.bgClass}`}>
              <span className="emoji-icon">{item.icon}</span>
              {item.badge !== null && (
                <span className="stat-badge-counter">{item.badge}</span>
              )}
            </div>
            <span className="stat-item-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
export default QuickStatsRow;
