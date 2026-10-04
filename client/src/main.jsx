import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import './index.css';
import { AppProvider, useApp } from './lib.jsx';

// Shared Components
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import BottomNav from './components/common/BottomNav.jsx';

// Public & Member Pages
import Home from './pages/Home.jsx';
import Venues from './pages/Venues.jsx';
import VenueDetail from './pages/VenueDetail.jsx';
import MyBookings from './pages/MyBookings.jsx';
import AuthPage from './pages/Auth.jsx';

// Admin Pages
import { AdminLayout, Bookings, Companies, Courts, Dashboard, Finance, Users } from './pages/Admin.jsx';

/**
 * Public Layout:
 * Memiliki Navbar atas (desktop), konten utama, Footer, dan Bottom Navigation Bar (Android Mobile).
 */
const PublicLayout = () => (
  <div className="app-shell-public">
    <Navbar />
    <div className="main-content-container">
      <Outlet />
    </div>
    <Footer />
    <BottomNav />
  </div>
);

function RequireAuth({ children }) {
  const { user, ready } = useApp();
  if (!ready) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venue/:slug" element={<VenueDetail />} />
            <Route path="/my-bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="courts" element={<Courts />} />
            <Route path="finance" element={<Finance />} />
            <Route path="users" element={<Users />} />
            <Route path="companies" element={<Companies />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
