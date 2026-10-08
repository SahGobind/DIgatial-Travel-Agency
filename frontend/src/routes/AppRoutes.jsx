import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import ServicesPage from '../pages/ServicesPage';
import DestinationsPage from '../pages/DestinationsPage';
import ContactPage from '../pages/ContactPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import NotFoundPage from '../pages/NotFoundPage';
import CustomerDashboardPage from '../pages/CustomerDashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Service Pages & Sub-routes
import TicketRequestPage from '../pages/services/TicketRequestPage';
import VisaApplicationPage from '../pages/services/VisaApplicationPage';
import HotelBookingPage from '../pages/services/HotelBookingPage';

// Invoice & Payment Pages
import InvoiceListPage from '../pages/invoices/InvoiceListPage';
import InvoiceDetailPage from '../pages/invoices/InvoiceDetailPage';
import PaymentPage from '../pages/payments/PaymentPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Protected Standalone Dashboard Portals */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CustomerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Public Pages with PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/tickets" element={<TicketRequestPage />} />
        <Route path="/services/visa" element={<VisaApplicationPage />} />
        <Route path="/services/hotels" element={<HotelBookingPage />} />
        <Route path="/invoices" element={<InvoiceListPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/payments" element={<PaymentPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

