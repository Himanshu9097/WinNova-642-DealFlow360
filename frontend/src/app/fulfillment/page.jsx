'use client';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function FulfillmentPage() {
  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'OPERATIONS']}>
      <div className="container mt-5">
        <h1 className="display-5" style={{color: '#D6536D'}}>Fulfillment & Operations</h1>
        <p className="lead text-muted">Track delivery, supply chain operations, and project handoffs for closed-won deals.</p>
        
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body py-5 text-center text-muted">
            <i className="fs-1 mb-3">📦</i>
            <h4>Fulfillment Queue</h4>
            <p>Operations and project management module will be implemented soon.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
