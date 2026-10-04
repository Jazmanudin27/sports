import React, { useEffect, useState } from 'react';
import { api, errMsg } from '../lib.jsx';

// Modular Components bergaya E-Sekolah / Android Mobile Modern
import HomeHeader from '../components/home/HomeHeader.jsx';
import QuickStatsRow from '../components/home/QuickStatsRow.jsx';
import BigActionButtons from '../components/home/BigActionButtons.jsx';
import BlueGridMenu from '../components/home/BlueGridMenu.jsx';
import BookingHistorySection from '../components/home/BookingHistorySection.jsx';

/**
 * Halaman Utama (Beranda) — Tampilan Android Mobile Modern (Identik E-Sekolah)
 * - Header Royal Blue Gradient dengan Profil & Waktu WIB
 * - Kartu Status 4 Kotak (Booking Aktif, Menunggu, Riwayat, Lapangan)
 * - 2 Tombol Besar (Booking Lapang Hijau & Jadwal Main Merah)
 * - 8 Tombol Biru Squircle (Futsal, Badminton, Basket, Padel, Mini Soccer, Mabar, Turnamen, Keuangan)
 * - Daftar Histori Jadwal dengan link 'View All'
 */
export function Home() {
  const [venues, setVenues] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [venuesRes, bookingsRes] = await Promise.allSettled([
          api.get('/venues'),
          api.get('/bookings/me'),
        ]);

        if (isMounted) {
          if (venuesRes.status === 'fulfilled') setVenues(venuesRes.value.data || []);
          if (bookingsRes.status === 'fulfilled') setMyBookings(bookingsRes.value.data || []);
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

  const activeCount = myBookings.filter((b) => ['confirmed', 'paid'].includes(b.status)).length;
  const pendingCount = myBookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="mobile-app-frame">
      {/* 1. Header Biru Royal dengan Info Profil & Jam WIB */}
      <HomeHeader />

      {/* Konten Tengah (Latar Belakang Bersih & Terang) */}
      <div className="mobile-app-body">
        {/* 2. Kartu 4 Status Squircle (Menumpuk ke Atas Header) */}
        <QuickStatsRow 
          activeBookingsCount={activeCount || 2} 
          pendingCount={pendingCount || 1} 
        />

        {/* 3. Dua Tombol Aksi Besar (Hijau Booking & Merah Jadwal Main) */}
        <BigActionButtons 
          nextSchedule={myBookings[0] ? `${myBookings[0].start_time?.slice(0, 5)} WIB` : '19:00 WIB'}
        />

        {/* 4. Grid 8 Tombol Biru Squircle Ikon Olahraga & Menu */}
        <BlueGridMenu />

        {/* 5. Histori Booking & Jadwal Terdekat */}
        {loading ? (
          <div className="spinner" style={{ margin: '30px auto' }} />
        ) : (
          <BookingHistorySection 
            bookings={myBookings} 
            venues={venues} 
          />
        )}
      </div>
    </div>
  );
}

export default Home;
