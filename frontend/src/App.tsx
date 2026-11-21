import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AccountLayout } from './layouts/AccountLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { HomePage } from './pages/HomePage';
import { AllBooksPage } from './pages/AllBooksPage';
import { CategoryBooksPage } from './pages/CategoryBooksPage';
import { BookDetailsPage } from './pages/BookDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage';
import { CustomerEbooksPage } from './pages/customer/CustomerEbooksPage';
import { CustomerAddressesPage } from './pages/customer/CustomerAddressesPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminHomepagePage } from './pages/admin/AdminHomepagePage';

import { ProtectedRoute } from './routes/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<AllBooksPage />} />
        <Route path="/categories/:slug" element={<CategoryBooksPage />} />
        <Route path="/category/:slug" element={<CategoryBooksPage />} />
        <Route path="/books/:slug" element={<BookDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:id"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Account Dashboard */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerOrdersPage />} />
          <Route path="orders" element={<CustomerOrdersPage />} />
          <Route path="ebooks" element={<CustomerEbooksPage />} />
          <Route path="addresses" element={<CustomerAddressesPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
        </Route>
      </Route>

      {/* Admin Panel Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="books" element={<AdminBooksPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="homepage" element={<AdminHomepagePage />} />
      </Route>
    </Routes>
  );
};

export default App;
