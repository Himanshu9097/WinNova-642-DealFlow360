import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to a default route based on role or show 403
        navigate('/');
      }
    }
  }, [user, loading, navigate, allowedRoles]);

  if (loading || !user) {
    return <div className="p-5 text-center">Loading Workspace...</div>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-5 text-center text-danger">Access Denied</div>;
  }

  return children;
}
