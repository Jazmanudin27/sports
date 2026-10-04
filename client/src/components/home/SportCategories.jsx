import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SportCategories Component
 * Pilihan jenis olahraga dengan ikon dan status aktif, gaya scroll horizontal Android.
 */
export function SportCategories({ sports = [], activeSportId = null, onSelectSport }) {
  return (
    <div className="sport-categories-section">
      <div className="categories-scroll-row">
        <button
          type="button"
          className={`sport-chip-android ${!activeSportId ? 'active' : ''}`}
          onClick={() => onSelectSport && onSelectSport(null)}
        >
          <span className="sport-emoji">🔥</span>
          <span className="sport-name">Semua</span>
        </button>

        {sports.map((s) => {
          const isActive = activeSportId == s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`sport-chip-android ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSport && onSelectSport(s.id)}
              id={`cat-sport-${s.id}`}
            >
              <span className="sport-emoji">{s.icon}</span>
              <span className="sport-name">{s.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default SportCategories;
