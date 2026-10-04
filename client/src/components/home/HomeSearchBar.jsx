import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * HomeSearchBar Component
 * Search bar mengambang khas Android dengan tombol filter cepat.
 */
export function HomeSearchBar({ value, onChange, onSubmit }) {
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (onSubmit) onSubmit(e);
      else navigate(`/venues?q=${encodeURIComponent(value || '')}`);
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
    else navigate(`/venues?q=${encodeURIComponent(value || '')}`);
  };

  return (
    <div className="home-search-bar-wrap">
      <form className="home-search-bar" onSubmit={handleSearchClick}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Cari lapang futsal, badminton, padel..."
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          id="home-search-input"
        />
        {value && (
          <button 
            type="button" 
            className="clear-search-btn" 
            onClick={() => onChange && onChange('')}
          >
            ✕
          </button>
        )}
        <button type="submit" className="search-submit-btn" id="home-search-btn">
          Cari
        </button>
      </form>
    </div>
  );
}
export default HomeSearchBar;
