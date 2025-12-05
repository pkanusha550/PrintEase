import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Order from "./pages/Order.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import CustomerLogin from "./pages/CustomerLogin.jsx";
import CustomerSignup from "./pages/CustomerSignup.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import DealerLogin from "./pages/DealerLogin.jsx";
import DealerSignup from "./pages/DealerSignup.jsx";
import DealerDashboard from "./pages/Dealer.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminSignup from "./pages/AdminSignup.jsx";
import AdminDashboard from "./pages/Admin.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Services from "./pages/Services.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        
        {/* Legacy routes (redirect to customer routes) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Customer Routes */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/signup" element={<CustomerSignup />} />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Dealer Routes */}
        <Route path="/dealer/login" element={<DealerLogin />} />
        <Route path="/dealer/signup" element={<DealerSignup />} />
        <Route
          path="/dealer/dashboard"
          element={
            <ProtectedRoute requiredRole="dealer">
              <DealerDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Common Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/track-order/:orderId"
          element={
            <ProtectedRoute requiredRole="customer">
              <TrackOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute requiredRole="customer">
              <Order />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute requiredRole="customer">
              <MyOrders />
            </ProtectedRoute>
          }
        />
        
        {/* Legacy dashboard routes (redirect to new routes) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dealer"
          element={
            <ProtectedRoute requiredRole="dealer">
              <DealerDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
