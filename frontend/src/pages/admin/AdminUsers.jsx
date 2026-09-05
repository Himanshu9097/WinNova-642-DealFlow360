import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'SALES_REP', department: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5006/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5006/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setNewUser({ name: '', email: '', password: '', role: 'SALES_REP', department: '' });
        fetchUsers();
      } else {
        alert('Failed to create user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}>
      <div className="container mt-4">
        <h2 className="mb-4" style={{color: '#D6536D'}}>Company Users</h2>
        
        <div className="row">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-bottom-0 pt-4">
                <h5 className="mb-0">Invite New User</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateUser}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required minLength="6" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                      <option value="SALES_MANAGER">Sales Manager</option>
                      <option value="SALES_REP">Sales Representative</option>
                      <option value="FINANCE">Finance</option>
                      <option value="OPERATIONS">Operations</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} />
                  </div>
                  <button type="submit" className="btn w-100 text-white" style={{backgroundColor: '#D6536D'}}>Create User</button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-4">No users found</td></tr>
                    ) : (
                      users.map(u => (
                        <tr key={u._id}>
                          <td className="ps-4 fw-medium">{u.name} {user?._id === u._id && '(You)'}</td>
                          <td>{u.email}</td>
                          <td><span className="badge bg-secondary">{u.role.replace('_', ' ')}</span></td>
                          <td><span className={`badge ${u.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'}`}>{u.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
