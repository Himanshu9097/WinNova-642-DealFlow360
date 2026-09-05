'use client';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function BillingPage() {
  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'FINANCE']}>
      <div className="container mt-5">
        <h1 className="display-5" style={{color: '#D6536D'}}>Billing & Invoicing</h1>
        <p className="lead text-muted">Generate invoices, track payments, and monitor company revenue.</p>
        
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body py-5 text-center text-muted">
            <i className="fs-1 mb-3">💵</i>
            <h4>Invoices & Payments</h4>
            <p>Finance and billing module will be implemented soon.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
