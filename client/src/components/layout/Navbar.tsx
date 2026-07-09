import { LuChefHat } from 'react-icons/lu';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const { data: user, isPending } = useCurrentUser();

  return (
    <header className="border-b border-background-200 bg-background-50/90 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-text-100 shadow-sm">
            <LuChefHat className="h-7 w-7" />
          </span>
          <div>
            <span className="block text-2xl font-bold text-text-950">
              What&apos;s Cooking?
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-base font-bold text-text-700 sm:block">
              Hi, {user.name}
            </span>
          )}

          {isPending && (
            <span className="hidden h-6 w-24 rounded-md bg-background-100 sm:block" />
          )}

          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
