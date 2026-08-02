import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { AppLoadingScreen } from '../ui/LoadingSkeletons';

export function RequireAuth() {
  const location = useLocation();
  const { data: user, isPending, isError } = useCurrentUser();

  if (isPending) return <AppLoadingScreen />;

  if (isError || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
