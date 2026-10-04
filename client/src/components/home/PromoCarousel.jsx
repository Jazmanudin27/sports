import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BANNERS = [
  {
    id: 1,
    tag: 'PROMO SPESIAL',
    title: 'Diskon 25% Main Weekend',
    desc: 'Booking lapang futsal & badminton lebih hemat setiap hari Sabtu & Minggu!',
    cta: 'Klaim Promo',
    link: '/venues?sport_id=1',
    gradient: 'linear-gradient(135deg, hsl(165 85% 35%), hsl(222 47% 12%))',
    icon: '⚽',
  },
  {
    id: 2,
    tag: 'FLASH BOOKING',
    title: 'Slot Kosong Sore Ini',
    desc: 'Cek jadwal kosong mulai jam 17:00 dan amankan slotmu sekarang juga.',
    cta: 'Cek Jadwal',
    link: '/venues',
    gradient: 'linear-gradient(135deg, hsl(210 90% 40%), hsl(222 47% 12%))',
    icon: '⚡',
  },
  {
    id: 3,
    tag: 'EVENT KOMUNITAS',
    title: 'Turnamen Padel & Mini Soccer',
    desc: 'Kompetisi antar komunitas sport center berhadiah total jutaan rupiah.',
    cta: 'Daftar Sekarang',
    link: '/venues?sport_id=4',
    gradient: 'linear-gradient(135deg, hsl(84 85% 40%), hsl(222 47% 12%))',
    icon: '🏆',
  },
];

/**
 * PromoCarousel Component
 * Banner promo bergeser otomatis atau swipe khas aplikasi mobile.
 */
export function PromoCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeBanner = BANNERS[activeIdx];

  return (
    <div className="promo-carousel-container">
      <div 
        className="promo-banner-card"
        style={{ background: activeBanner.gradient }}
      >
        <div className="banner-badge">{activeBanner.tag}</div>
        <div className="banner-content">
          <div className="banner-texts">
            <h3>{activeBanner.title}</h3>
            <p>{activeBanner.desc}</p>
            <Link to={activeBanner.link} className="banner-cta-btn">
              {activeBanner.cta} →
            </Link>
          </div>
          <div className="banner-illustration">
            <span>{activeBanner.icon}</span>
          </div>
        </div>
      </div>

      {/* Indicator dots */}
      <div className="carousel-dots">
        {BANNERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`dot-pill ${i === activeIdx ? 'active' : ''}`}
            onClick={() => setActiveIdx(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
export default PromoCarousel;
