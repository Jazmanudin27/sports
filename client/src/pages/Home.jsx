import React, { useEffect, useState } from 'react';
import { api, errMsg } from '../lib.jsx';

// Komponen Bergaya Alfagift Mobile
import AlfagiftHeader from '../components/home/AlfagiftHeader.jsx';
import AlfagiftMemberCard from '../components/home/AlfagiftMemberCard.jsx';
import AlfagiftPromoBanner from '../components/home/AlfagiftPromoBanner.jsx';
import AlfagiftCategoryGrid from '../components/home/AlfagiftCategoryGrid.jsx';
import BookingHistorySection from '../components/home/BookingHistorySection.jsx';
import AlfagiftStickyToast from '../components/home/AlfagiftStickyToast.jsx';

/**
 * Halaman Utama (Beranda) — Versi Alfagift Mobile Pro
 * - Default Warna: Biru Royal (Dapat diubah bebas lewat tombol 🎨 Palette)
 * - Header Lokasi, Chat, Notifikasi & Setting Tema
 * - Search Bar dengan Barcode & Heart Favorite
 * - Kartu Member Loyalitas (Poin, Voucher, Jam Main, Rating)
 * - Banner Promo Cashback Geser
 * - Grid 10 Kategori Olahraga & Layanan (5x2)
 * - Rekomendasi Lapangan Terdekat
 * - Sticky Bottom Offer Toast
 */
export function Home() {
  const [venues, setVenues] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Bandung');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [venuesRes, bookingsRes, citiesRes] = await Promise.allSettled([
          api.get('/venues'),
          api.get('/bookings/me'),
          api.get('/cities'),
        ]);

        if (isMounted) {
          if (venuesRes.status === 'fulfilled') setVenues(venuesRes.value.data || []);
          if (bookingsRes.status === 'fulfilled') setMyBookings(bookingsRes.value.data || []);
          if (citiesRes.status === 'fulfilled') setCities(citiesRes.value.data || []);
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

  return (
    <div className="alfa-mobile-frame">
      {/* 1. Header Alfagift: Lokasi, Notif, Palette Tema, Search Bar, Barcode & Wishlist */}
      <AlfagiftHeader 
        selectedCity={selectedCity} 
        onSelectCity={setSelectedCity} 
        cities={cities}
      />

      {/* Konten Utama */}
      <div className="alfa-body-content">
        {/* 2. Kartu Member Loyalitas (Poin, Voucher, Alert & Barcode) */}
        <AlfagiftMemberCard 
          userBookingsCount={myBookings.length}
        />

        {/* 3. Hero Promo Banner (Cashback, Diskon, Dot Carousel) */}
        <AlfagiftPromoBanner />

        {/* 4. Grid 10 Kategori Olahraga & Menu (5 Kolom x 2 Baris) */}
        <AlfagiftCategoryGrid />

        {/* 5. Rekomendasi Lapang Terdekat */}
        {loading ? (
          <div className="spinner" style={{ margin: '30px auto' }} />
        ) : (
          <BookingHistorySection 
            bookings={myBookings} 
            venues={venues} 
          />
        )}
      </div>

      {/* 6. Banner Sticky Melayang di Atas Navigasi Bawah */}
      <AlfagiftStickyToast />
    </div>
  );
}

export default Home;
