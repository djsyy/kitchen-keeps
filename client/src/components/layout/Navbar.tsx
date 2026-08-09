import { LuChefHat } from 'react-icons/lu';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import ProfileDropdown from './ProfileDropdown';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';

export default function Navbar() {
  const { data: user, isPending } = useCurrentUser();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="border-background-200 bg-background-50/90 border-b shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="bg-primary text-text-100 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm transition hover:cursor-pointer"
            onClick={handleClick}
            aria-label="Go to dashboard"
          >
            <LuChefHat className="h-7 w-7" />
          </button>
          <div>
            <span className="text-text-950 block text-2xl font-bold">
              Kitchen Keeps
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-text-700 hidden text-base font-bold sm:block">
              Hi, {user.name}
            </span>
          )}

          {isPending && (
            <Skeleton className="hidden h-6 w-24 rounded-md sm:block" />
          )}

          <ProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
