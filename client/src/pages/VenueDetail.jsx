import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, errMsg, jam, rupiah, tgl, today, useApp } from '../lib.jsx';

/**
 * Halaman Detail Venue & Booking Slot Per Jam
 */
export function VenueDetail() {
  const { slug } = useParams();
  const { user, toast } = useApp();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [courtId, setCourtId] = useState(null);
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => today(i)), []);
  const court = venue?.courts.find((c) => c.id === courtId);

  useEffect(() => {
    api.get(`/venues/${slug}`).then((r) => {
      setVenue(r.data);
      if (r.data.courts?.length) setCourtId(r.data.courts[0].id);
    });
  }, [slug]);

  const loadSlots = () => {
    if (venue) {
      api.get(`/venues/${venue.id}/availability`, { params: { date } })
        .then((r) => setSlots(r.data || []));
    }
  };

  useEffect(() => {
    loadSlots();
    setSelected([]);
  }, [venue, date, courtId]);

  // Pilih slot berurutan (jam berturut-turut)
  const toggleSlot = (hr) => {
    if (!selected.length) return setSelected([hr]);
    const min = Math.min(...selected);
    const max = Math.max(...selected);
    if (selected.includes(hr)) {
      return setSelected(hr === min || hr === max ? selected.filter((h) => h !== hr) : [hr]);
    }
    if (hr === max + 1 || hr === min - 1) return setSelected([...selected, hr]);
    setSelected([hr]);
  };

  const weekend = [0, 6].includes(new Date(`${date}T00:00:00`).getDay());
  const price = court ? (weekend ? court.price_weekend : court.price_per_hour) : 0;

  const bookNow = async () => {
    if (!user) return navigate('/login', { state: { from: `/venue/${slug}` } });
    if (!selected.length) return;

    setSaving(true);
    try {
      const r = await api.post('/bookings', {
        court_id: courtId,
        date,
        start_hour: Math.min(...selected),
        duration: selected.length,
      });
      toast(`Booking ${r.data.code} berhasil! Menunggu konfirmasi admin.`);
      navigate('/my-bookings');
    } catch (e) {
      toast(errMsg(e), 'error');
      loadSlots();
    } finally {
      setSaving(false);
    }
  };

  if (!venue) return <div className="spinner" />;

  return (
    <main className="container mt" style={{ paddingBottom: 60 }}>
      {/* Header Info Venue */}
      <div className="card venue-detail-header-card" style={{ marginBottom: 20 }}>
        <div className="row between">
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>{venue.name}</h1>
            <p className="muted" style={{ marginTop: 4 }}>
              📍 {venue.address}, {venue.city} · 🕒 {jam(venue.open_time)}–{jam(venue.close_time)} · 📞 {venue.phone}
            </p>
          </div>
        </div>
        {venue.description && <p style={{ marginTop: 12 }}>{venue.description}</p>}
      </div>

      <div className="booking-layout">
        <div className="grid">
          {/* 1. Lapangan */}
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>1. Pilih Lapangan</h3>
            <div className="court-tabs">
              {venue.courts.map((c) => (
                <button
                  key={c.id}
                  id={`court-${c.id}`}
                  className={`court-tab ${c.id === courtId ? 'active' : ''}`}
                  onClick={() => setCourtId(c.id)}
                >
                  <b>{c.icon} {c.name}</b>
                  <br />
                  <small className="muted">{rupiah(c.price_per_hour)}/jam</small>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Tanggal */}
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>2. Pilih Tanggal</h3>
            <div className="date-strip">
              {dates.map((d) => (
                <button
                  key={d}
                  id={`date-${d}`}
                  className={`date-item ${d === date ? 'active' : ''}`}
                  onClick={() => setDate(d)}
                >
                  <small>{tgl(d, { weekday: 'short' })}</small>
                  <b>{tgl(d, { day: 'numeric' })}</b>
                  <small>{tgl(d, { month: 'short' })}</small>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Slot Jam */}
          <div className="card">
            <div className="row between" style={{ marginBottom: 14 }}>
              <h3>3. Pilih Jam</h3>
              <div className="legend">
                <span><i style={{ background: 'hsl(165 70% 45% / .3)' }} />Kosong</span>
                <span><i style={{ background: 'hsl(350 70% 55% / .3)' }} />Terisi</span>
                <span><i style={{ background: 'var(--grad)' }} />Dipilih</span>
              </div>
            </div>
            <div className="slots">
              {slots.map((s) => {
                const booked = s.bookedCourts?.includes(courtId);
                const cls = booked ? 'booked' : s.past ? 'past' : selected.includes(s.hour) ? 'selected' : '';
                return (
                  <button
                    key={s.hour}
                    id={`slot-${s.hour}`}
                    className={`slot ${cls}`}
                    disabled={booked || s.past}
                    onClick={() => toggleSlot(s.hour)}
                  >
                    {jam(s.start)}
                    <small>{booked ? 'Terisi' : s.past ? 'Lewat' : 'Kosong'}</small>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ringkasan & CTA */}
        <aside className="card sticky">
          <h3>Ringkasan Booking</h3>
          {selected.length ? (
            <div className="grid" style={{ gap: 10, marginTop: 16 }}>
              <div className="row between">
                <span className="muted">Lapangan</span>
                <b>{court?.name}</b>
              </div>
              <div className="row between">
                <span className="muted">Tanggal</span>
                <b>{tgl(date)}</b>
              </div>
              <div className="row between">
                <span className="muted">Jam Main</span>
                <b>
                  {String(Math.min(...selected)).padStart(2, '0')}:00 – {String(Math.max(...selected) + 1).padStart(2, '0')}:00
                </b>
              </div>
              <div className="row between">
                <span className="muted">Durasi</span>
                <b>{selected.length} jam × {rupiah(price)}</b>
              </div>
              <hr style={{ borderColor: 'var(--border)' }} />
              <div className="row between">
                <span>Total Biaya</span>
                <span className="price grad-text" style={{ fontSize: '1.4rem' }}>
                  {rupiah(price * selected.length)}
                </span>
              </div>
              <button
                className="btn btn-primary btn-lg"
                id="btn-book"
                disabled={saving}
                onClick={bookNow}
              >
                {saving ? 'Memproses...' : user ? 'Booking Sekarang' : 'Masuk untuk Booking'}
              </button>
              <small className="muted">Status booking awal adalah pending konfirmasi pengelola.</small>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 12 }}>
              Pilih slot jam yang tersedia. Anda bisa memilih beberapa jam berurutan.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
export default VenueDetail;
