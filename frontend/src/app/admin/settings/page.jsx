'use client';
import { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { getCompanySettings, updateCompanySettings } from '../../../services/companyService';

export default function SettingsPage() {
  const [settings, setSettings] = useState({ maxAllowedDiscount: 8 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getCompanySettings()
      .then(data => {
        setSettings({ maxAllowedDiscount: data.maxAllowedDiscount || 8 });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateCompanySettings(settings);
      setMessage('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Error saving settings.');
    }
    setSaving(false);
  };

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}>
      <div className="container-fluid px-4 py-4">
        <h2 className="mb-0" style={{color: '#D6536D'}}>Company Settings</h2>
        <span className="text-muted">Manage your company profile, branding, and global system preferences.</span>
        
        {loading ? (
          <div className="mt-5 text-center">Loading settings...</div>
        ) : (
          <div className="card shadow-sm border-0 mt-4" style={{ maxWidth: '600px' }}>
            <div className="card-header bg-white" style={{ borderBottom: '2px solid #f8f9fa' }}>
              <h5 className="mb-0">Global Policies</h5>
            </div>
            <div className="card-body">
              {message && (
                <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} py-2`}>
                  {message}
                </div>
              )}
              <form onSubmit={handleSave}>
                <div className="mb-4">
                  <label className="form-label fw-bold">Maximum Auto-Approved Discount (%)</label>
                  <p className="text-muted small mb-2">
                    Discounts exceeding this percentage will automatically require Manager approval.
                  </p>
                  <input 
                    type="number" 
                    className="form-control"
                    min="0"
                    max="100"
                    value={settings.maxAllowedDiscount}
                    onChange={(e) => setSettings({ ...settings, maxAllowedDiscount: Number(e.target.value) })}
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{backgroundColor: '#D6536D', borderColor: '#D6536D'}} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
