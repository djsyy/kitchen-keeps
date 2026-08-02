import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function HomePage() {
  const { data: user, isPending } = useCurrentUser();

  if (isPending) {
    return <p className="text-text-600 p-6">Loading…</p>;
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}
