'use client';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ApprovalsPage() {
  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN', 'SALES_MANAGER', 'FINANCE']}>
      <div className="container mt-5">
        <h1 className="display-5" style={{color: '#D6536D'}}>Approvals Center</h1>
        <p className="lead text-muted">Review and approve high-discount deals, custom credit terms, and critical quotations.</p>
        
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body py-5 text-center text-muted">
            <i className="fs-1 mb-3">📋</i>
            <h4>No Pending Approvals</h4>
            <p>Approval queue module will be implemented soon.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
