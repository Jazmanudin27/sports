import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import './index.css';
import { AppProvider, useApp } from './lib.jsx';
import { AuthPage, Footer, Home, MyBookings, Navbar, VenueDetail, Venues } from './pages/Public.jsx';
import { AdminLayout, Bookings, Companies, Courts, Dashboard, Finance, Users } from './pages/Admin.jsx';

const PublicLayout = () => (<><Navbar /><Outlet /><Footer /></>);

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
