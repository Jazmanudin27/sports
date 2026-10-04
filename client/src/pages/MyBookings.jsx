import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errMsg, jam, rupiah, tgl, today, useApp } from '../lib.jsx';

/**
 * Halaman Riwayat & Status Booking Member
 */
export function MyBookings() {
  const { toast } = useApp();
  const [rows, setRows] = useState(null);

  const loadData = () => {
    api.get('/bookings/me').then((r) => setRows(r.data || []));
  };

  useEffect(() => {
    loadData();
  }, []);

  const cancelBooking = async (id) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast('Booking berhasil dibatalkan.');
      loadData();
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  return (
    <main className="container mt" style={{ paddingBottom: 80 }}>
      <div className="section-title-row" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Booking <span className="grad-text">Saya</span></h1>
          <p className="muted">Pantau status jadwal main dan riwayat sewa lapangan Anda</p>
        </div>
      </div>

      {!rows ? (
        <div className="spinner" />
      ) : !rows.length ? (
        <div className="card empty">
          <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>Belum ada booking aktif.</p>
          <Link to="/venues" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', marginTop: 8 }}>
            Cari Lapangan Sekarang →
          </Link>
        </div>
      ) : (
        <div className="grid">
          {rows.map((b) => (
            <div key={b.id} className="card row between" style={{ alignItems: 'flex-start', gap: 14 }}>
              <div>
                <div className="row" style={{ gap: 8 }}>
                  <b>{b.icon} {b.venue_name} — {b.court_name}</b>
                  <span className={`badge ${b.status}`}>{b.status}</span>
                </div>
                <p className="muted" style={{ marginTop: 6, fontSize: '.9rem' }}>
                  📅 {tgl(b.date)} · 🕒 {jam(b.start_time)}–{jam(b.end_time)} · Kode: <b>{b.code}</b>
                </p>
                {b.venue_phone && (
                  <p className="muted" style={{ fontSize: '.8rem', marginTop: 4 }}>
                    📞 Kontak Venue: {b.venue_phone}
                  </p>
                )}
              </div>
              <div className="row" style={{ alignItems: 'center' }}>
                <span className="price">{rupiah(b.total_price)}</span>
                {['pending', 'confirmed'].includes(b.status) && b.date >= today() && (
                  <button
                    className="btn btn-sm btn-danger"
                    id={`cancel-${b.id}`}
                    onClick={() => cancelBooking(b.id)}
                  >
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
export default MyBookings;
