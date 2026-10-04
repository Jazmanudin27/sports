import React from 'react';

/**
 * Footer Component
 */
export function Footer() {
  return (
    <footer>
      <div className="container row between">
        <span>© {new Date().getFullYear()} ArenaKu — Booking lapangan olahraga jadi mudah & cepat.</span>
        <span>⚽ 🏸 🏀 🎾 🥅</span>
      </div>
    </footer>
  );
}
export default Footer;
