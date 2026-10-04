import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errMsg } from '../lib.jsx';

// Modular Components
import HomeHeader from '../components/home/HomeHeader.jsx';
import HomeSearchBar from '../components/home/HomeSearchBar.jsx';
import PromoCarousel from '../components/home/PromoCarousel.jsx';
import QuickActionGrid from '../components/home/QuickActionGrid.jsx';
import SportCategories from '../components/home/SportCategories.jsx';
import FlashBookingCard from '../components/home/FlashBookingCard.jsx';
import VenueCardAndroid from '../components/home/VenueCardAndroid.jsx';

/**
 * Halaman Beranda (Home Page) — Versi Android / Mobile-First
 * Struktur rapi dan modular agar memudahkan tim programmer untuk maintenance & penambahan fitur.
 */
export function Home() {
  const navigate = useNavigate();

  // State
  const [sports, setSports] = useState([]);
  const [venues, setVenues] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Fetch data awal: Sports, Venues, Cities
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [sportsRes, venuesRes, citiesRes] = await Promise.all([
          api.get('/sports'),
          api.get('/venues'),
          api.get('/cities'),
        ]);

        if (isMounted) {
          setSports(sportsRes.data || []);
          setVenues(venuesRes.data || []);
          setCities(citiesRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching home data:', errMsg(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, []);

  // 2. Filter Venue berdasarkan Kota & Olahraga yang dipilih di Beranda
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      // Filter Kota
      if (selectedCity && venue.city !== selectedCity) return false;

      // Filter Olahraga
      if (selectedSport) {
        const sportObj = sports.find((s) => s.id === selectedSport);
        if (sportObj && !venue.sports?.includes(sportObj.name)) return false;
      }

      // Filter Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = venue.name?.toLowerCase().includes(q);
        const matchAddress = venue.address?.toLowerCase().includes(q);
        const matchSports = venue.sports?.toLowerCase().includes(q);
        if (!matchName && !matchAddress && !matchSports) return false;
      }

      return true;
    });
  }, [venues, selectedCity, selectedSport, searchQuery, sports]);

  // Handler Submit Search
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/venues?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="android-home-wrapper">
      {/* 1. App Bar Atas (Lokasi, Profil/Login, Notifikasi, Sapaan) */}
      <HomeHeader 
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        cities={cities}
      />

      {/* 2. Search Bar Mengambang */}
      <HomeSearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={handleSearchSubmit}
      />

      {/* 3. Promo & Event Carousel (Banner Geser) */}
      <PromoCarousel />

      {/* 4. Fitur Cepat (Sewa, Mabar, Turnamen, Promo) */}
      <QuickActionGrid />

      {/* 5. Flash Booking Widget (Slot Kosong Hari Ini) */}
      <FlashBookingCard venueCount={filteredVenues.length} />

      {/* 6. Kategori Olahraga (Futsal, Badminton, Basket, Padel, dll) */}
      <section className="home-section-block">
        <div className="section-title-row">
          <div>
            <h3 className="section-title">Pilih Olahraga</h3>
            <p className="section-subtitle">Temukan fasilitas sesuai cabang favoritmu</p>
          </div>
          {selectedSport && (
            <button 
              type="button" 
              className="reset-filter-link"
              onClick={() => setSelectedSport(null)}
            >
              Reset ✕
            </button>
          )}
        </div>

        <SportCategories 
          sports={sports} 
          activeSportId={selectedSport}
          onSelectSport={setSelectedSport}
        />
      </section>

      {/* 7. Rekomendasi Venue Lapangan */}
      <section className="home-section-block">
        <div className="section-title-row">
          <div>
            <h3 className="section-title">
              {selectedCity ? `Venue di ${selectedCity}` : 'Rekomendasi Venue'}
            </h3>
            <p className="section-subtitle">Tersedia {filteredVenues.length} venue pilihan</p>
          </div>
          <Link to="/venues" className="see-all-link">
            Lihat Semua →
          </Link>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="spinner" />
        ) : filteredVenues.length > 0 ? (
          <div className="android-venue-list">
            {filteredVenues.map((venue) => (
              <VenueCardAndroid key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="card empty-android">
            <span className="empty-icon">🏟️</span>
            <h4>Tidak ada venue ditemukan</h4>
            <p className="muted">Coba ganti pilihan kota atau reset filter kategori olahraga.</p>
            <button 
              type="button" 
              className="btn btn-sm btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => { setSelectedCity(''); setSelectedSport(null); setSearchQuery(''); }}
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>

      {/* 8. Banner Ajakan Jadi Mitra Lapang */}
      <section className="home-partner-cta card">
        <div className="partner-content">
          <span className="badge-pill">💼 Pemilik Lapangan?</span>
          <h4>Kelola Sport Center Lebih Praktis</h4>
          <p className="muted">
            Catat keuangan, kelola jadwal sewa per jam, dan pantau booking secara real-time.
          </p>
          <Link to="/login" className="btn btn-sm btn-primary" style={{ marginTop: 12, display: 'inline-flex' }}>
            Masuk Sebagai Pengelola
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
