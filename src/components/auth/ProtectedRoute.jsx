import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loader />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;