import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export function RequireAuth() {
  const location = useLocation();
  const { data: user, isPending, isError } = useCurrentUser();

  if (isPending) return <h1>Loading...</h1>; // REPLACE

  if (isError || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
