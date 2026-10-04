import React from 'react';

/**
 * AlfagiftSportCategories Component
 * Section "Pilih Berdasarkan Kategori" ala Alfagift
 * - Grid Kategori Olahraga 4 kolom
 * - Icon bergaya ilustrasi menarik & badge nama kategori
 * - Filter interaktif
 */
export function AlfagiftSportCategories({ 
  selectedSportId = null, 
  onSelectSport, 
  onSeeAll 
}) {
  const categories = [
    { id: 1, name: 'Futsal', icon: '⚽', bg: '#eff6ff', tag: 'Vinyl & Sintetis' },
    { id: 2, name: 'Badminton', icon: '🏸', bg: '#ecfdf5', tag: 'Karpet BWF' },
    { id: 3, name: 'Basket', icon: '🏀', bg: '#fff7ed', tag: 'Hardwood' },
    { id: 4, name: 'Padel', icon: '🎾', bg: '#faf5ff', tag: 'Panoramic' },
    { id: 5, name: 'Mini Soccer', icon: '🥅', bg: '#f0fdf4', tag: 'Rumput FIFA' },
    { id: 6, name: 'Voli Indoor', icon: '🏐', bg: '#fef2f2', tag: 'Matras Inter' },
    { id: 7, name: 'Tenis Lapangan', icon: '🎾', bg: '#fdf4ff', tag: 'Flexi Pave' },
    { id: 8, name: 'Tenis Meja', icon: '🏓', bg: '#f8fafc', tag: 'Donic Board' },
  ];

  return (
    <section className="alfa-categories-browser-section">
      <div className="alfa-recom-header-row">
        <h2 className="alfa-recom-title">Pilih Berdasarkan Kategori</h2>
        <button 
          type="button" 
          className="alfa-see-all-link-btn"
          onClick={onSeeAll}
        >
          Lihat Semua
        </button>
      </div>

      <div className="alfa-categories-card-grid">
        {categories.map((cat) => {
          const isSelected = selectedSportId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`alfa-category-tile-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectSport(isSelected ? null : cat.id)}
            >
              <div 
                className="alfa-category-icon-box"
                style={{ backgroundColor: cat.bg }}
              >
                <span className="cat-icon-emoji">{cat.icon}</span>
              </div>
              <span className="alfa-category-name">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default AlfagiftSportCategories;
