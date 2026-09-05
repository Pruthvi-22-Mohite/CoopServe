import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { ProviderLayout } from './components/layout/ProviderLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { ServicesDirectory } from './pages/customer/ServicesDirectory';
import { ProvidersDirectory } from './pages/customer/ProvidersDirectory';
import { ProviderDetail } from './pages/customer/ProviderDetail';
import { CustomerBookings } from './pages/customer/CustomerBookings';
import { CustomerBookingDetail } from './pages/customer/CustomerBookingDetail';
import { CustomerProfile } from './pages/customer/CustomerProfile';
import { CustomerNotifications } from './pages/customer/CustomerNotifications';

// Provider Pages
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderJobs } from './pages/provider/ProviderJobs';
import { ProviderEarnings } from './pages/provider/ProviderEarnings';
import { ProviderAvailability } from './pages/provider/ProviderAvailability';
import { ProviderWorkHistory } from './pages/provider/ProviderWorkHistory';
import { ProviderReviews } from './pages/provider/ProviderReviews';
import { ProviderCooperative } from './pages/provider/ProviderCooperative';
import { ProviderProfile } from './pages/provider/ProviderProfile';
import { ProviderNotifications } from './pages/provider/ProviderNotifications';

// Admin Pages (Phase 7)
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProviders } from './pages/admin/AdminProviders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminMatchingInspector } from './pages/admin/AdminMatchingInspector';
import { AdminEarningsAnalytics } from './pages/admin/AdminEarningsAnalytics';
import { AdminLeakageRisk } from './pages/admin/AdminLeakageRisk';
import { AdminAIInsights } from './pages/admin/AdminAIInsights';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminNotifications } from './pages/admin/AdminNotifications';

// Shared
import { CooperativeHub } from './pages/cooperative/CooperativeHub';
import { NotFound } from './pages/NotFound';
import { LoadingState } from './components/common/LoadingState';

export const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState fullScreen message="Loading CoopServe platform..." />;
  }

  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SERVICE_PROVIDER': return '/provider/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      case 'CUSTOMER':
      default: return '/customer/dashboard';
    }
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="services" element={<ServicesDirectory />} />
        <Route path="providers" element={<ProvidersDirectory />} />
        <Route path="provider/:id" element={<ProviderDetail />} />
        <Route path="bookings" element={<CustomerBookings />} />
        <Route path="booking/:id" element={<CustomerBookingDetail />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="notifications" element={<CustomerNotifications />} />
      </Route>

      {/* Provider Routes */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute allowedRoles={['SERVICE_PROVIDER']}>
            <ProviderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="jobs" element={<ProviderJobs />} />
        <Route path="jobs/:id" element={<ProviderJobs />} />
        <Route path="earnings" element={<ProviderEarnings />} />
        <Route path="availability" element={<ProviderAvailability />} />
        <Route path="history" element={<ProviderWorkHistory />} />
        <Route path="reviews" element={<ProviderReviews />} />
        <Route path="cooperative" element={<ProviderCooperative />} />
        <Route path="profile" element={<ProviderProfile />} />
        <Route path="notifications" element={<ProviderNotifications />} />
      </Route>

      {/* Admin Routes (Phase 7) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="providers" element={<AdminProviders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="services" element={<ServicesDirectory />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="matching" element={<AdminMatchingInspector />} />
        <Route path="earnings" element={<AdminEarningsAnalytics />} />
        <Route path="cooperative" element={<CooperativeHub />} />
        <Route path="ai-insights" element={<AdminAIInsights />} />
        <Route path="reports" element={<AdminLeakageRisk />} />
        <Route path="leakage-risk" element={<AdminLeakageRisk />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Cooperative Community Portal */}
      <Route
        path="/cooperative"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN']}>
            {user?.role === 'SERVICE_PROVIDER' ? (
              <ProviderLayout />
            ) : user?.role === 'ADMIN' ? (
              <AdminLayout />
            ) : (
              <CustomerLayout />
            )}
          </ProtectedRoute>
        }
      >
        <Route index element={<CooperativeHub />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
