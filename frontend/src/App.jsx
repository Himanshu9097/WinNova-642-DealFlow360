import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Customers from './pages/Customers';
import CustomersCreate from './pages/CustomersCreate';
import Warehouses from './pages/Warehouses';
import Fulfillment from './pages/Fulfillment';
import FulfillmentDetail from './pages/FulfillmentDetail';
import Deals from './pages/Deals';
import DealsCreate from './pages/DealsCreate';
import DealDetail from './pages/DealDetail';
import Quotations from './pages/Quotations';
import QuotationsCreate from './pages/QuotationsCreate';
import QuotationDetail from './pages/QuotationDetail';
import QuotationEdit from './pages/QuotationEdit';
import QuotationPreview from './pages/QuotationPreview';
import Approvals from './pages/Approvals';
import Billing from './pages/Billing';
import CustomerQuote from './pages/CustomerQuote';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import B2BDashboard from './pages/b2b/B2BDashboard';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div id="wrapwrap" className="o_openerp_website o_footer_effect_enable">
          <Navbar />
          <main>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/create" element={<CustomersCreate />} />
              
              <Route path="/warehouses" element={<Warehouses />} />
              
              <Route path="/fulfillment" element={<Fulfillment />} />
              <Route path="/fulfillment/:id" element={<FulfillmentDetail />} />
              
              <Route path="/deals" element={<Deals />} />
              <Route path="/deals/create" element={<DealsCreate />} />
              <Route path="/deals/:id" element={<DealDetail />} />
              
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/quotations/create" element={<QuotationsCreate />} />
              <Route path="/quotations/:id" element={<QuotationDetail />} />
              <Route path="/quotations/:id/edit" element={<QuotationEdit />} />
              <Route path="/quotations/:id/preview" element={<QuotationPreview />} />
              
              <Route path="/approvals" element={<Approvals />} />
              
              <Route path="/billing" element={<Billing />} />
              
              <Route path="/customer/quote/:token" element={<CustomerQuote />} />
              
              {/* Admin */}
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              
              {/* B2B Customer Portal */}
              <Route path="/b2b/dashboard" element={<B2BDashboard />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}
