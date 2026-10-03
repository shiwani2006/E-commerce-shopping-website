import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";

import CustomerLayout from "../components/layout/CustomerLayout";
import VendorLayout from "../components/layout/VendorLayout";
import AdminLayout from "../components/layout/AdminLayout";
import AdminSidebar from "../components/layout/AdminSidebar";

import CustomerDashboard from "../pages/customer/CustomerDashboard";
import Cart from "../pages/customer/Cart";
import Orders from "../pages/customer/Orders";
import Wishlist from "../pages/customer/Wishlist";
import CustomerProfile from "../pages/customer/CustomerProfile";
import Payments from "../pages/customer/Payments";
import Rewards from "../pages/customer/Rewards";
import Support from "../pages/customer/Support";
import AIssistant from "../pages/customer/AIAssistant";
import Checkout from "../pages/customer/Checkout";
import OrderSuccess from "../pages/customer/OrderSuccess";
import Products from "../pages/customer/Products";
import TrackOrder from "../pages/customer/TrackOrder";

import VendorDashboard from "../pages/vendor/VendorDashboard";
import VendorProducts from "../pages/vendor/VendorProducts";
import VendorOrders from "../pages/vendor/VendorOrders";
import VendorAnalytics from "../pages/vendor/VendorAnalytics";
import MyShop from "../pages/vendor/MyShop";
import AddProduct from "../pages/vendor/AddProduct";
import Earnings from "../pages/vendor/Earnings";
import EditProducts from "../pages/vendor/EditProducts";
import VendorReviews from "../pages/vendor/VendorReviews.jsx";
import VendorCoupons from "../pages/vendor/VendorCoupons";
import VendorMarketing from "../pages/vendor/VendorMarketing";
import VendorAIInsights from "../pages/vendor/VendorAIInsights.jsx";
import VendorSettings from "../pages/vendor/VendorSettings";

import AdminDashboard from "../pages/admin/AdminDashboard";
import Vendors from "../pages/admin/Vendors";
import ProductsApproval from "../pages/admin/ProductsApproval";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminOrders from "../pages/admin/AdminOrders";
import Customers from "../pages/admin/Customers";
import Coupons from "../pages/admin/Coupons";
import Analytics from "../pages/admin/Analytics";
import Reviews from "../pages/admin/Reviews";
import Categories from "../pages/admin/Categories";
import Commission from "../pages/admin/Commission";
import Settings from "../pages/admin/Settings";
import Profile from "../pages/admin/Profile";
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRole="customer">
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<Orders />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="payments" element={<Payments />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="support" element={<Support />} />
        <Route path="ai-assistant" element={<AIssistant />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="products" element={<Products />} />

        {/* Track Order — customer layout ke andar, protected */}
        <Route path="track-order/:orderId" element={<TrackOrder />} />
      </Route>

      {/* Vendor Routes */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRole="vendor">
            <VendorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="analytics" element={<VendorAnalytics />} />
        <Route path="shop" element={<MyShop />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="edit-product/:id" element={<EditProducts />} />
        <Route path="reviews" element={<VendorReviews />} />
        <Route path="coupons" element={<VendorCoupons />} />
        <Route path="marketing" element={<VendorMarketing />} />
        <Route path="ai-insights" element={<VendorAIInsights />} />
        <Route path="settings" element={<VendorSettings />} />

      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="products-approval" element={<ProductsApproval />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="categories" element={<Categories />} />
        <Route path="commission" element={<Commission />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}