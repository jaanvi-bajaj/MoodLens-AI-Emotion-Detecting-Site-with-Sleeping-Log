import { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/lib/authContext';

type ProtectedRouteProps = {
  component: React.ComponentType;
  path: string;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, path }) => {
  const [isMatch] = useRoute(path);
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isMatch && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isMatch, isAuthenticated, setLocation]);

  return isMatch && isAuthenticated ? <Component /> : null;
};

export default ProtectedRoute; 