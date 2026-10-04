import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, errMsg, rupiah, jam } from '../lib.jsx';

// Komponen Alfagift untuk Menu Lapangan
import AlfagiftVenuesHeader from '../components/venues/AlfagiftVenuesHeader.jsx';
import AlfagiftRecomCarousel from '../components/venues/AlfagiftRecomCarousel.jsx';
import AlfagiftSportCategories from '../components/venues/AlfagiftSportCategories.jsx';
import VenueCardAndroid from '../components/home/VenueCardAndroid.jsx';

// Data Rekomendasi Lapangan Default (High Quality Fallback)
const DEFAULT_RECOMMENDED_COURTS = [
  {
    id: 101,
    name: 'Futsal Vinyl A (Standard BWF)',
    venueName: 'Aulia Futsal Center • Bandung',
    venueSlug: 'aulia-futsal',
    sportName: 'Futsal',
    specBadge: '⚽ Vinyl Standar',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 102,
    name: 'Badminton Court 1 (Karpet Yonex)',
    venueName: 'Lidya Sport Center • Bandung',
    venueSlug: 'lidya-sport',
    sportName: 'Badminton',
    specBadge: '🏸 Karpet BWF',
    price: 60000,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 103,
    name: 'Padel Court 1 (Panoramic Glass)',
    venueName: 'Padel Arena Senayan • Jakarta',
    venueSlug: 'padel-arena-senayan',
    sportName: 'Padel',
    specBadge: '🎾 Panoramic Glass',
    price: 300000,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 104,
    name: 'Mini Soccer (Rumput Sintetis FIFA)',
    venueName: 'Lidya Sport Center • Bandung',
    venueSlug: 'lidya-sport',
    sportName: 'Mini Soccer',
    specBadge: '🥅 Sintetis FIFA',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 105,
    name: 'Basket Indoor (Hardwood Maple)',
    venueName: 'Padel Arena Senayan • Jakarta',
    venueSlug: 'padel-arena-senayan',
    sportName: 'Basket',
    specBadge: '🏀 Kayu Parket',
    price: 200000,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80',
  },
];

// Data Venue Default jika API belum siap
const DEFAULT_VENUES = [
  {
    id: 1,
    name: 'Aulia Futsal Center',
    slug: 'aulia-futsal',
    address: 'Jl. Soekarno Hatta No. 12',
    city: 'Bandung',
    phone: '081234567890',
    description: 'Lapangan futsal vinyl standar internasional dengan tribun penonton dan kantin.',
    open_time: '08:00',
    close_time: '23:00',
    sports: 'Futsal',
    court_count: 2,
    min_price: 130000,
    max_price: 180000,
  },
  {
    id: 2,
    name: 'Lidya Sport Center',
    slug: 'lidya-sport',
    address: 'Jl. Dipatiukur No. 45',
    city: 'Bandung',
    phone: '081298765432',
    description: 'Sport center lengkap: futsal, badminton, dan mini soccer rumput sintetis.',
    open_time: '07:00',
    close_time: '23:00',
    sports: 'Futsal, Badminton, Mini Soccer',
    court_count: 4,
    min_price: 50000,
    max_price: 450000,
  },
  {
    id: 3,
    name: 'Padel Arena Senayan',
    slug: 'padel-arena-senayan',
    address: 'Jl. Asia Afrika No. 8',
    city: 'Jakarta',
    phone: '081311122233',
    description: 'Lapangan padel & basket indoor premium dengan AC & shower air panas.',
    open_time: '06:00',
    close_time: '22:00',
    sports: 'Padel, Basket',
    court_count: 3,
    min_price: 200000,
    max_price: 380000,
  },
];

/**
 * Halaman Menu Lapangan (Daftar Lapangan)
 * Bergaya Alfagift Mobile dengan nuansa Biru Royal:
 * 1. Header Biru: Judul "Daftar Lapangan", Search, Keranjang/Jadwal
 * 2. Subheader Tabs: 📋 Lapangan Populer & ❤️ Lapangan Favorit
 * 3. Section "Rekomendasi Untuk Kamu" (Horizontal Scroll Cards + Tombol "+ Booking")
 * 4. Section "Pilih Berdasarkan Kategori" (Grid 4 Kolom)
 * 5. Section "Semua Lapangan & Sport Center" (Filter Chip & Kartu Venue)
 */
export function Venues() {
  const [params, setParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('popular'); // 'popular' | 'favorite'
  const [searchQuery, setSearchQuery] = useState(params.get('q') || '');
  const [selectedSportId, setSelectedSportId] = useState(params.get('sport_id') ? Number(params.get('sport_id')) : null);
  const [selectedCity, setSelectedCity] = useState(params.get('city') || '');
  
  // Data State
  const [sports, setSports] = useState([]);
  const [cities, setCities] = useState(['Bandung', 'Jakarta', 'Surabaya', 'Semarang']);
  const [venues, setVenues] = useState(null);
  const [loading, setLoading] = useState(true);

  // Favorit Lapangan (disimpan di localStorage)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('arenaku_favorite_courts');
      return saved ? JSON.parse(saved) : [101, 102];
    } catch {
      return [101, 102];
    }
  });

  const toggleFavorite = (courtId) => {
    setFavorites((prev) => {
      const updated = prev.includes(courtId)
        ? prev.filter((id) => id !== courtId)
        : [...prev, courtId];
      try {
        localStorage.setItem('arenaku_favorite_courts', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Fetch Sports, Cities, & Venues
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [sportsRes, citiesRes, venuesRes] = await Promise.allSettled([
          api.get('/sports'),
          api.get('/cities'),
          api.get('/venues', {
            params: {
              q: searchQuery || undefined,
              sport_id: selectedSportId || undefined,
              city: selectedCity || undefined,
            },
          }),
        ]);

        if (isMounted) {
          if (sportsRes.status === 'fulfilled' && sportsRes.value.data?.length) {
            setSports(sportsRes.value.data);
          }
          if (citiesRes.status === 'fulfilled' && citiesRes.value.data?.length) {
            setCities(citiesRes.value.data);
          }
          if (venuesRes.status === 'fulfilled' && venuesRes.value.data?.length) {
            setVenues(venuesRes.value.data);
          } else {
            // Gunakan default fallback jika belum ada data di server
            setVenues(DEFAULT_VENUES);
          }
        }
      } catch (err) {
        console.error('Error loading venues data:', errMsg(err));
        if (isMounted) setVenues(DEFAULT_VENUES);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [searchQuery, selectedSportId, selectedCity]);

  // Filter Venues berdasarkan input lokal
  const filteredVenues = useMemo(() => {
    const list = venues || DEFAULT_VENUES;
    return list.filter((v) => {
      const matchCity = !selectedCity || v.city.toLowerCase() === selectedCity.toLowerCase();
      const matchQuery = !searchQuery || 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.sports && v.sports.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCity && matchQuery;
    });
  }, [venues, selectedCity, searchQuery]);

  // Filter Favorit Courts
  const favoriteCourts = useMemo(() => {
    return DEFAULT_RECOMMENDED_COURTS.filter((c) => favorites.includes(c.id));
  }, [favorites]);

  const handleSportCategorySelect = (sportId) => {
    setSelectedSportId(sportId);
    const p = new URLSearchParams(params);
    sportId ? p.set('sport_id', sportId) : p.delete('sport_id');
    setParams(p);
  };

  return (
    <div className="alfa-mobile-frame alfa-venues-page-wrapper">
      {/* 1. Header Biru Royal Ala Alfagift */}
      <AlfagiftVenuesHeader 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoriteCount={favorites.length}
      />

      <div className="alfa-body-content alfa-venues-body">
        {/* TAB 1: LAPANGAN POPULER */}
        {activeTab === 'popular' && (
          <>
            {/* 2. Section Rekomendasi Untuk Kamu (Card Geser ala Alfagift) */}
            <AlfagiftRecomCarousel 
              items={DEFAULT_RECOMMENDED_COURTS}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSeeAll={() => {
                // Scroll langsung ke daftar semua venue di bawah
                const el = document.getElementById('all-venues-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 3. Section Pilih Berdasarkan Kategori (Grid 4 Kolom) */}
            <AlfagiftSportCategories 
              selectedSportId={selectedSportId}
              onSelectSport={handleSportCategorySelect}
              onSeeAll={() => setSelectedSportId(null)}
            />

            {/* 4. Section Daftar Semua Lapangan & Sport Center */}
            <section id="all-venues-section" className="alfa-all-venues-section">
              <div className="alfa-recom-header-row" style={{ marginBottom: 12 }}>
                <div>
                  <h2 className="alfa-recom-title">Semua Sport Center</h2>
                  <p className="alfa-section-sub">
                    Pilih venue untuk lihat jadwal jam kosong & booking langsung
                  </p>
                </div>
              </div>

              {/* Filter Chips: Kota */}
              <div className="alfa-filter-chips-strip">
                <button
                  type="button"
                  className={`alfa-filter-chip ${!selectedCity ? 'active' : ''}`}
                  onClick={() => setSelectedCity('')}
                >
                  📍 Semua Kota
                </button>
                {cities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`alfa-filter-chip ${selectedCity === c ? 'active' : ''}`}
                    onClick={() => setSelectedCity(selectedCity === c ? '' : c)}
                  >
                    📍 {c}
                  </button>
                ))}
              </div>

              {/* List Kartu Venue */}
              <div className="alfa-venues-listing-grid">
                {loading ? (
                  <div className="spinner" style={{ margin: '30px auto' }} />
                ) : filteredVenues.length > 0 ? (
                  filteredVenues.map((v) => (
                    <VenueCardAndroid key={v.id} venue={v} />
                  ))
                ) : (
                  <div className="alfa-empty-state-box">
                    <span className="empty-icon">🔍</span>
                    <h4>Tidak Ada Lapangan Ditemukan</h4>
                    <p className="muted">Coba ubah kata kunci pencarian atau ganti filter kota.</p>
                    <button
                      type="button"
                      className="alfa-btn-reset-filter"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedSportId(null);
                        setSelectedCity('');
                      }}
                    >
                      Reset Semua Filter
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* TAB 2: LAPANGAN FAVORIT */}
        {activeTab === 'favorite' && (
          <section className="alfa-favorites-view-section">
            <div className="alfa-recom-header-row">
              <h2 className="alfa-recom-title">Lapangan Favorit Saya</h2>
              <span className="alfa-section-sub">{favorites.length} Lapangan</span>
            </div>

            {favoriteCourts.length > 0 ? (
              <div className="alfa-fav-grid-cards">
                {favoriteCourts.map((court) => (
                  <div key={court.id} className="alfa-court-product-card fav-card-item">
                    <div className="alfa-court-card-media">
                      <img src={court.image} alt={court.name} className="alfa-court-img" />
                      <button
                        type="button"
                        className="alfa-card-fav-btn is-fav"
                        onClick={() => toggleFavorite(court.id)}
                        title="Hapus dari Favorit"
                      >
                        ❤️
                      </button>
                      <span className="alfa-court-spec-badge">{court.specBadge}</span>
                    </div>

                    <div className="alfa-court-card-body">
                      <Link to={`/venue/${court.venueSlug}`} className="alfa-court-title-link">
                        <h3 className="alfa-court-name">{court.name}</h3>
                      </Link>
                      <p className="alfa-court-venue-sub">{court.venueName}</p>

                      <div className="alfa-court-price-box">
                        <span className="alfa-court-price-val">{rupiah(court.price)}</span>
                        <small className="alfa-court-price-unit">/jam</small>
                      </div>

                      <div className="alfa-instant-badge">
                        <span className="flash-icon">⚡</span>
                        <span>Booking Instan</span>
                      </div>

                      <Link 
                        to={`/venue/${court.venueSlug}?court_id=${court.id}`} 
                        className="alfa-btn-add-booking"
                      >
                        + Booking
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alfa-empty-state-box">
                <span className="empty-icon">💔</span>
                <h4>Belum Ada Lapangan Favorit</h4>
                <p className="muted">
                  Klik icon ❤️ pada lapangan yang kamu sukai di tab "Lapangan Populer" agar mudah dicari kembali!
                </p>
                <button
                  type="button"
                  className="alfa-btn-reset-filter"
                  onClick={() => setActiveTab('popular')}
                >
                  Cari Lapangan Populer Sekarang
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Venues;
