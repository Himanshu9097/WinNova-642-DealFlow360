'use client';
import ProtectedRoute from '../../../components/ProtectedRoute';

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}>
      <div className="container mt-5">
        <h1 className="display-5" style={{color: '#D6536D'}}>Company Settings</h1>
        <p className="lead text-muted">Manage your company profile, branding, and global system preferences.</p>
        
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body py-5 text-center text-muted">
            <i className="fs-1 mb-3">⚙️</i>
            <h4>Configuration Center</h4>
            <p>Company settings and global preferences module will be implemented soon.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
