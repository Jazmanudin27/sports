import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, jam, rupiah } from '../lib.jsx';
import VenueCardAndroid from '../components/home/VenueCardAndroid.jsx';

/**
 * Halaman Cari Lapangan (Venues Directory)
 */
export function Venues() {
  const [params, setParams] = useSearchParams();
  const [sports, setSports] = useState([]);
  const [cities, setCities] = useState([]);
  const [venues, setVenues] = useState(null);
  const filters = Object.fromEntries(params);

  useEffect(() => {
    api.get('/sports').then((r) => setSports(r.data || []));
    api.get('/cities').then((r) => setCities(r.data || []));
  }, []);

  useEffect(() => {
    setVenues(null);
    api.get('/venues', { params: filters }).then((r) => setVenues(r.data || []));
  }, [params]);

  const set = (k, v) => {
    const p = new URLSearchParams(params);
    v ? p.set(k, v) : p.delete(k);
    setParams(p);
  };

  return (
    <main className="container mt" style={{ paddingBottom: 60 }}>
      <div className="section-title-row" style={{ marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Cari <span className="grad-text">Lapangan</span></h1>
          <p className="muted">Temukan sport center terdekat dengan jadwal yang cocok</p>
        </div>
      </div>

      <div className="row mt" style={{ gap: 10 }}>
        <input
          className="input"
          style={{ maxWidth: 320, flex: 1 }}
          id="filter-q"
          placeholder="Cari venue / nama jalan..."
          defaultValue={filters.q || ''}
          onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value)}
        />
        <select
          className="input"
          style={{ maxWidth: 180 }}
          id="filter-city"
          value={filters.city || ''}
          onChange={(e) => set('city', e.target.value)}
        >
          <option value="">Semua kota</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="chips mt" style={{ marginTop: 14 }}>
        <button
          className={`chip ${!filters.sport_id ? 'active' : ''}`}
          onClick={() => set('sport_id', '')}
        >
          Semua
        </button>
        {sports.map((s) => (
          <button
            key={s.id}
            id={`chip-sport-${s.id}`}
            className={`chip ${filters.sport_id == s.id ? 'active' : ''}`}
            onClick={() => set('sport_id', s.id)}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <div className="mt" style={{ marginTop: 20 }}>
        {!venues ? (
          <div className="spinner" />
        ) : venues.length ? (
          <div className="venue-grid">
            {venues.map((v) => (
              <VenueCardAndroid key={v.id} venue={v} />
            ))}
          </div>
        ) : (
          <div className="empty card">
            <p>Tidak ada venue yang cocok dengan pencarian Anda 😔</p>
            <button
              className="btn btn-sm btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => { setParams({}); }}
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
export default Venues;
