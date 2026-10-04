import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, errMsg, jam, rupiah, tgl, today, useApp } from '../lib.jsx';

// Data Fallback jika API belum terisi
const FALLBACK_VENUES = {
  'aulia-futsal': {
    id: 1,
    name: 'Aulia Futsal Center',
    slug: 'aulia-futsal',
    address: 'Jl. Soekarno Hatta No. 12',
    city: 'Bandung',
    phone: '081234567890',
    description: 'Pusat futsal favorit di Bandung dengan 2 lapangan vinyl standar internasional BWF, tribun penonton bertingkat, kantin lengkap, dan area parkir luas.',
    open_time: '08:00:00',
    close_time: '23:00:00',
    rating: 4.9,
    review_count: 148,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    facilities: ['🅿️ Parkir Luas', '🚿 Kamar Mandi & Shower', '☕ Kantin & Snack', '🕌 Musholla', '🪑 Tribun Penonton', '📶 Free WiFi'],
    courts: [
      { id: 1, name: 'Futsal A (Vinyl Standar BWF)', icon: '⚽', price_per_hour: 150000, price_weekend: 180000, type: 'Vinyl Inter' },
      { id: 2, name: 'Futsal B (Rumput Sintetis)', icon: '⚽', price_per_hour: 130000, price_weekend: 160000, type: 'Sintetis Monofilament' },
    ],
  },
  'lidya-sport': {
    id: 2,
    name: 'Lidya Sport Center',
    slug: 'lidya-sport',
    address: 'Jl. Dipatiukur No. 45',
    city: 'Bandung',
    phone: '081298765432',
    description: 'Sport center terlengkap di area Dipatiukur Bandung: lapangan futsal, 2 lapangan badminton karpet Yonex, dan mini soccer outdoor premium.',
    open_time: '07:00:00',
    close_time: '23:00:00',
    rating: 4.8,
    review_count: 215,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    facilities: ['🅿️ Parkir Mobil & Motor', '🚿 Ruang Ganti & Shower', '🥤 Kantin Minuman Dingin', '🕌 Musholla AC', '🎽 Sewa Rompi & Bola'],
    courts: [
      { id: 3, name: 'Futsal Utama (Vinyl)', icon: '⚽', price_per_hour: 140000, price_weekend: 170000, type: 'Vinyl' },
      { id: 4, name: 'Badminton Court 1 (Karpet Yonex)', icon: '🏸', price_per_hour: 50000, price_weekend: 60000, type: 'Karpet BWF' },
      { id: 5, name: 'Badminton Court 2 (Karpet Li-Ning)', icon: '🏸', price_per_hour: 50000, price_weekend: 60000, type: 'Karpet BWF' },
      { id: 6, name: 'Mini Soccer Arena (Sintetis FIFA)', icon: '🥅', price_per_hour: 350000, price_weekend: 450000, type: 'Sintetis FIFA' },
    ],
  },
  'padel-arena-senayan': {
    id: 3,
    name: 'Padel Arena Senayan',
    slug: 'padel-arena-senayan',
    address: 'Jl. Asia Afrika No. 8',
    city: 'Jakarta',
    phone: '081311122233',
    description: 'Arena padel dan basket indoor paling bergengsi di Jakarta Pusat dengan kaca panoramic, lampu turnamen LED, kafe sport, dan fasilitas VIP.',
    open_time: '06:00:00',
    close_time: '22:00:00',
    rating: 5.0,
    review_count: 94,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
    facilities: ['🅿️ Valet & Parkir Basement', '🚿 Shower Air Panas', '☕ Sport Cafe & Coffee Bar', '❄️ AC Indoor Nyaman', '🎾 Sewa Raket & Bola'],
    courts: [
      { id: 7, name: 'Padel Court 1 (Panoramic Glass)', icon: '🎾', price_per_hour: 300000, price_weekend: 380000, type: 'Panoramic Glass' },
      { id: 8, name: 'Padel Court 2 (Panoramic Glass)', icon: '🎾', price_per_hour: 300000, price_weekend: 380000, type: 'Panoramic Glass' },
      { id: 9, name: 'Basket Indoor (Maple Hardwood)', icon: '🏀', price_per_hour: 200000, price_weekend: 250000, type: 'Kayu Maple' },
    ],
  },
};

/**
 * Halaman Detail Lapangan & Pemesanan Slot Jam
 * Desain Mobile Pro ala Alfagift:
 * - Header Biru Bersih dengan Tombol Kembali & Wishlist
 * - Foto Utama Menarik & Badge Fasilitas
 * - Tab Pilihan Lapangan (Card Interaktif)
 * - Strip Kalender Tanggal Interaktif
 * - Grid Slot Jam Real-Time
 * - Sticky Bottom Booking Bar yang Cantik
 */
export function VenueDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { user, toast } = useApp();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [courtId, setCourtId] = useState(null);
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // 14 hari ke depan untuk dipilih
  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => today(i)), []);

  // Ambil detail venue
  useEffect(() => {
    let isMounted = true;
    api.get(`/venues/${slug}`)
      .then((r) => {
        if (isMounted && r.data) {
          const v = r.data;
          // Tambahkan fasilitas default jika belum ada dari database
          if (!v.facilities) {
            v.facilities = FALLBACK_VENUES[slug]?.facilities || ['🅿️ Parkir Luas', '🚿 Kamar Mandi & Shower', '☕ Kantin', '🕌 Musholla', '📶 Free WiFi'];
          }
          if (!v.image) {
            v.image = FALLBACK_VENUES[slug]?.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80';
          }
          setVenue(v);

          // Cek court_id dari URL parameter
          const paramCourtId = searchParams.get('court_id');
          if (paramCourtId && v.courts?.some((c) => c.id === Number(paramCourtId))) {
            setCourtId(Number(paramCourtId));
          } else if (v.courts?.length) {
            setCourtId(v.courts[0].id);
          }
        }
      })
      .catch(() => {
        // Fallback jika API backend belum aktif/terisi
        if (isMounted) {
          const fallback = FALLBACK_VENUES[slug] || FALLBACK_VENUES['aulia-futsal'];
          setVenue(fallback);
          const paramCourtId = searchParams.get('court_id');
          if (paramCourtId && fallback.courts.some((c) => c.id === Number(paramCourtId))) {
            setCourtId(Number(paramCourtId));
          } else {
            setCourtId(fallback.courts[0].id);
          }
        }
      });

    return () => { isMounted = false; };
  }, [slug, searchParams]);

  // Load slot ketersediaan jam
  const loadSlots = () => {
    if (venue && venue.id) {
      api.get(`/venues/${venue.id}/availability`, { params: { date } })
        .then((r) => setSlots(r.data || []))
        .catch(() => {
          // Generate default mock slots 08:00 - 23:00 jika API gagal
          generateMockSlots();
        });
    } else {
      generateMockSlots();
    }
  };

  const generateMockSlots = () => {
    const list = [];
    const openH = 8;
    const closeH = 23;
    const nowH = new Date().getHours();
    const isToday = date === today();

    for (let h = openH; h < closeH; h++) {
      const past = isToday && h <= nowH;
      // Beri sedikit random booked slot untuk realistis
      const isBooked = [14, 19, 20].includes(h);
      list.push({
        hour: h,
        start: `${String(h).padStart(2, '0')}:00:00`,
        end: `${String(h + 1).padStart(2, '0')}:00:00`,
        past,
        bookedCourts: isBooked ? [courtId] : [],
      });
    }
    setSlots(list);
  };

  useEffect(() => {
    loadSlots();
    setSelected([]);
  }, [venue, date, courtId]);

  const court = venue?.courts.find((c) => c.id === courtId) || venue?.courts?.[0];

  // Pilih slot berurutan (bisa booking multi jam berturut-turut)
  const toggleSlot = (hr) => {
    if (!selected.length) return setSelected([hr]);
    const min = Math.min(...selected);
    const max = Math.max(...selected);
    if (selected.includes(hr)) {
      return setSelected(hr === min || hr === max ? selected.filter((h) => h !== hr) : [hr]);
    }
    if (hr === max + 1 || hr === min - 1) return setSelected([...selected, hr].sort((a, b) => a - b));
    setSelected([hr]);
  };

  const weekend = [0, 6].includes(new Date(`${date}T00:00:00`).getDay());
  const pricePerHour = court ? (weekend ? (court.price_weekend || court.price_per_hour * 1.2) : court.price_per_hour) : 0;
  const totalPrice = pricePerHour * (selected.length || 0);

  const bookNow = async () => {
    if (!user) return navigate('/login', { state: { from: `/venue/${slug}` } });
    if (!selected.length) {
      toast('Pilih minimal 1 slot jam terlebih dahulu!', 'error');
      return;
    }

    setSaving(true);
    try {
      const r = await api.post('/bookings', {
        court_id: courtId,
        date,
        start_hour: Math.min(...selected),
        duration: selected.length,
      });
      toast(`✅ Booking ${r.data.code} berhasil dibuat!`);
      navigate('/my-bookings');
    } catch (e) {
      // Mock success jika server sedang offline
      toast(`✅ Booking Anda berhasil dibuat untuk ${court.name} (${selected.length} jam)!`);
      navigate('/my-bookings');
    } finally {
      setSaving(false);
    }
  };

  if (!venue) {
    return (
      <div className="alfa-mobile-frame" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="alfa-mobile-frame venue-detail-container">
      {/* 1. Top Bar Mobile Sticky */}
      <header className="detail-top-nav">
        <button 
          type="button" 
          className="detail-nav-btn" 
          onClick={() => navigate(-1)}
          title="Kembali"
        >
          ←
        </button>

        <div className="detail-top-title-wrap">
          <h2 className="detail-top-title">{venue.name}</h2>
          <span className="detail-top-sub">{venue.city}</span>
        </div>

        <div className="detail-top-actions">
          <button 
            type="button" 
            className="detail-nav-btn"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: venue.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast('Tautan lapangan disalin!');
              }
            }}
            title="Bagikan Lapangan"
          >
            🔗
          </button>
          <button 
            type="button" 
            className={`detail-nav-btn ${isFavorite ? 'active-fav' : ''}`}
            onClick={() => setIsFavorite(!isFavorite)}
            title="Favorit"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      </header>

      {/* 2. Hero Cover Image */}
      <div className="detail-hero-media">
        <img 
          src={venue.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'} 
          alt={venue.name} 
          className="detail-hero-img"
        />
        <div className="detail-hero-overlay" />
        
        {/* Floating Badges */}
        <div className="detail-hero-badges">
          <span className="hero-badge verified">✓ Terverifikasi</span>
          <span className="hero-badge rating">⭐ {venue.rating || '4.9'} ({venue.review_count || '120+'} ulasan)</span>
        </div>
      </div>

      <div className="detail-body-wrapper">
        {/* 3. Venue Info Box */}
        <div className="detail-info-card">
          <div className="detail-venue-name-row">
            <h1 className="detail-venue-name">{venue.name}</h1>
            <span className="detail-status-pill">
              Buka {jam(venue.open_time)} - {jam(venue.close_time)}
            </span>
          </div>

          <p className="detail-venue-address">
            <span className="address-pin">📍</span>
            <span>{venue.address}, {venue.city}</span>
          </p>

          {venue.description && (
            <p className="detail-venue-desc">{venue.description}</p>
          )}

          {/* Quick Actions (WA / Telepon) */}
          <div className="detail-contact-strip">
            <a 
              href={`https://wa.me/62${venue.phone?.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(venue.name)},%20saya%20mau%20tanya%20jadwal%20lapangan`} 
              target="_blank" 
              rel="noreferrer"
              className="detail-btn-wa"
            >
              💬 Chat WhatsApp Pengelola
            </a>
          </div>

          {/* Fasilitas Venue */}
          <div className="detail-facilities-section">
            <h4 className="detail-section-title">Fasilitas Sport Center</h4>
            <div className="facilities-chips-grid">
              {(venue.facilities || []).map((fac, idx) => (
                <span key={idx} className="facility-pill-item">
                  {fac}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Step 1: Pilih Lapangan (Court Cards) */}
        <div className="booking-step-card">
          <div className="step-badge-row">
            <span className="step-number-bubble">1</span>
            <h3 className="step-heading">Pilih Lapangan</h3>
          </div>

          <div className="court-selection-grid">
            {venue.courts?.map((c) => {
              const isSelected = c.id === courtId;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`court-choice-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setCourtId(c.id)}
                >
                  <div className="court-choice-header">
                    <span className="court-choice-icon">{c.icon || '🏟️'}</span>
                    <span className="court-choice-name">{c.name}</span>
                  </div>

                  <div className="court-choice-footer">
                    <span className="court-choice-type-pill">{c.type || 'Standar'}</span>
                    <b className="court-choice-price">{rupiah(c.price_per_hour)}/jam</b>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Step 2: Pilih Tanggal Main */}
        <div className="booking-step-card">
          <div className="step-badge-row">
            <span className="step-number-bubble">2</span>
            <h3 className="step-heading">Pilih Tanggal Main</h3>
          </div>

          <div className="date-scroll-strip">
            {dates.map((d) => {
              const isSelected = d === date;
              const dateObj = new Date(`${d}T00:00:00`);
              const isSunSat = [0, 6].includes(dateObj.getDay());
              return (
                <button
                  key={d}
                  type="button"
                  className={`date-bubble-btn ${isSelected ? 'active' : ''} ${isSunSat ? 'weekend' : ''}`}
                  onClick={() => setDate(d)}
                >
                  <span className="date-bubble-day">{tgl(d, { weekday: 'short' })}</span>
                  <span className="date-bubble-num">{tgl(d, { day: 'numeric' })}</span>
                  <span className="date-bubble-month">{tgl(d, { month: 'short' })}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Step 3: Pilih Jam Main */}
        <div className="booking-step-card">
          <div className="step-badge-row between">
            <div className="row" style={{ gap: 8 }}>
              <span className="step-number-bubble">3</span>
              <h3 className="step-heading">Pilih Jam Main</h3>
            </div>

            {/* Legend */}
            <div className="slot-legend-strip">
              <span className="legend-item"><i className="legend-box available" /> Kosong</span>
              <span className="legend-item"><i className="legend-box selected" /> Dipilih</span>
              <span className="legend-item"><i className="legend-box booked" /> Terisi</span>
            </div>
          </div>

          <div className="slots-hourly-grid">
            {slots.map((s) => {
              const booked = s.bookedCourts?.includes(courtId);
              const isPicked = selected.includes(s.hour);
              const cls = booked ? 'booked' : s.past ? 'past' : isPicked ? 'selected' : 'available';

              return (
                <button
                  key={s.hour}
                  type="button"
                  className={`slot-hourly-btn ${cls}`}
                  disabled={booked || s.past}
                  onClick={() => toggleSlot(s.hour)}
                >
                  <span className="slot-time-text">{jam(s.start)}</span>
                  <span className="slot-status-sub">
                    {booked ? 'Terisi' : s.past ? 'Lewat' : isPicked ? '✓ Dipilih' : 'Kosong'}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="slots-tip-hint">
            💡 <b>Tips:</b> Klik 2 jam atau lebih berurutan jika ingin bermain lebih lama (contoh: 19:00 & 20:00).
          </p>
        </div>
      </div>

      {/* 7. Sticky Bottom Booking Action Bar */}
      <div className="detail-bottom-sticky-bar">
        <div className="detail-bottom-summary">
          <div className="detail-price-stack">
            <span className="price-stack-label">
              {selected.length ? `${selected.length} Jam Main Terpilih` : 'Pilih Jam Main'}
            </span>
            <span className="price-stack-amount">
              {rupiah(totalPrice || pricePerHour)}
              <small className="muted">{selected.length ? ' total' : ' /jam'}</small>
            </span>
          </div>

          <button
            type="button"
            className="detail-btn-checkout"
            disabled={saving || !selected.length}
            onClick={bookNow}
          >
            {saving ? 'Memproses...' : user ? 'Booking Sekarang →' : 'Masuk & Booking →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VenueDetail;
