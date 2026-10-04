import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BANNERS = [
  {
    id: 1,
    badge: 'CASHBACK LAGI!',
    headline: 'CASHBACK RP 15.000',
    subline: 'Sewa Lapang Futsal & Badminton • Periode Oktober 2026',
    checks: ['Anti Ribet', 'Jadwal Real-Time', 'Voucher ArenaKu'],
    bg: 'linear-gradient(135deg, #e11d48 0%, #be123c 60%, #881337 100%)',
    icon: '⚽',
  },
  {
    id: 2,
    badge: 'MABAR SERU!',
    headline: 'DISKON HINGGA 30%',
    subline: 'Main Padel & Mini Soccer Komunitas Akhir Pekan',
    checks: ['Slot Prime Time', 'Minuman Gratis', 'Wasit Standar'],
    bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)',
    icon: '🎾',
  },
  {
    id: 3,
    badge: 'TURNAMEN AKHIR TAHUN',
    headline: 'HADIAH TOTAL 10 JUTA',
    subline: 'Pendaftaran Futsal & Badminton Cup 2026 Dibuka',
    checks: ['Semua Kategori', 'Sertifikat Resmi', 'Live Streaming'],
    bg: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #4c1d95 100%)',
    icon: '🏆',
  },
];

/**
 * AlfagiftPromoBanner Component
 * Banner promosi besar dengan gaya kartu Alfagift, dot pagination, dan teks cashback.
 */
export function AlfagiftPromoBanner() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const cur = BANNERS[activeIdx];

  return (
    <div className="alfa-promo-banner-section">
      <Link to="/venues" className="alfa-promo-slide-card" style={{ background: cur.bg }}>
        <div className="alfa-promo-left-texts">
          <span className="alfa-promo-top-tag">{cur.badge}</span>
          <h2 className="alfa-promo-headline">{cur.headline}</h2>
          <p className="alfa-promo-subline">{cur.subline}</p>
          <div className="alfa-promo-bullets">
            {cur.checks.map((item, i) => (
              <span key={i} className="alfa-bullet-item">
                <span className="green-check">✓</span> {item}
              </span>
            ))}
          </div>
        </div>

        <div className="alfa-promo-right-graphics">
          <span className="big-promo-emoji">{cur.icon}</span>
        </div>
      </Link>

      {/* Pagination Dots & Link 'Lihat Semua Promo' */}
      <div className="alfa-banner-controls-row">
        <div className="alfa-dots-strip">
          {BANNERS.map((b, i) => (
            <span
              key={b.id}
              className={`alfa-dot ${i === activeIdx ? 'active' : ''}`}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>

        <Link to="/venues" className="alfa-see-all-promo-link">
          Lihat Semua Promo →
        </Link>
      </div>
    </div>
  );
}
export default AlfagiftPromoBanner;
