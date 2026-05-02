import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AdminRoute = () => {
  const { isAdmin } = useAuth();

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
