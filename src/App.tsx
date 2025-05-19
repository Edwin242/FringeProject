import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useEffect } from 'react';

import LoginPage from './pages/public/LoginPage';
import EventsPage from './pages/public/Events';
import AllEventsPage from './pages/public/allEvents';
import ContactPage from './pages/public/ContactPage';
import EventDetailPage from './pages/public/event-detail-page';
import PaymentPage from './pages/public/PaymentPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import DashboardContent from './components/dashboard/DashboardContent';
import EventsContent from './components/dashboard/EventsContent';
import VenuesContent from './components/dashboard/VenuesContent';
import BookingsContent from './components/dashboard/BookingsContent';
import SystemConfigContent from './components/dashboard/SystemConfigContent';

import { ThemeProvider } from './components/ui/ThemeProvider';

// 👇 This component handles Supabase redirect when it sends users to /#access_token...
function AuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = location.hash;

    // If there's an access_token in the URL hash, redirect to /reset-password
    if (hash.includes('access_token')) {
      navigate(`/reset-password${hash}`);
    }
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="fringe-admin-theme">
      <div className="min-h-screen bg-gray-950 text-white">
        <AuthRedirectHandler />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<EventsPage />} />
          <Route path="/events" element={<AllEventsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />}>
            <Route index element={<DashboardContent />} />
            <Route path="events" element={<EventsContent />} />
            <Route path="venues" element={<VenuesContent />} />
            <Route path="bookings" element={<BookingsContent />} />
            <Route
              path="ticket-types"
              element={<div className="p-6">Ticket Types Content</div>}
            />
            <Route
              path="reports"
              element={<div className="p-6">Reports Content</div>}
            />
            <Route path="system-config" element={<SystemConfigContent />} />
          </Route>
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
