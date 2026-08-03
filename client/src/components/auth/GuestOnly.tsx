import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { AppLoadingScreen } from '../ui/LoadingSkeletons';

export function GuestOnly() {
  const { data: user, isPending } = useCurrentUser();

  if (isPending) {
    return <AppLoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
