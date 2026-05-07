import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roles }) {
  const { user, token } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
