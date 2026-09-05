'use client';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to a default route based on role or show 403
        router.push('/');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user) {
    return <div className="p-5 text-center">Loading Workspace...</div>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-5 text-center text-danger">Access Denied</div>;
  }

  return children;
}
