import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { AppLoadingScreen } from '../components/ui/LoadingSkeletons';

export default function HomePage() {
  const { data: user, isPending } = useCurrentUser();

  if (isPending) {
    return <AppLoadingScreen />;
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}
