import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function HomePage() {
  const { data: user, isPending } = useCurrentUser();

  if (isPending) {
    return <p className="p-6 text-text-600">Loading…</p>;
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}
