import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiUserCircleThin } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '../../services/authService';
import ErrorMessage from '../ui/ErrorMessage';

export default function ProfileDropdown() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const logoutUserMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      setIsOpen(false);
      navigate('/login', { replace: true });
    },
  });

  function toggleDropdown() {
    setIsOpen((current) => !current);
  }

  return (
    <div className="relative">
      <button
        className="rounded-lg border border-primary-100 bg-white/60 p-2 text-primary shadow-sm transition hover:border-primary-300 hover:bg-primary-50"
        aria-label="Open profile menu"
        onClick={toggleDropdown}
      >
        <PiUserCircleThin className="h-8 w-8" />
      </button>

      {isOpen && (
        <div className="absolute bg-background-50 h-fit w-30 top-full right-0 left-1/2 -translate-x-1/2  mt-2 px-2 py-4 shadow-md border border-accent-300 rounded-md z-50">
          <div className="flex flex-col gap-2 text-md text-text">
            <Link
              to="/profile"
              className="text-center rounded-sm transition hover:bg-accent-100 "
            >
              Profile
            </Link>
            <Link
              to="/dashboard"
              className="text-center rounded-sm transition hover:bg-accent-100 "
            >
              Dashboard
            </Link>
            <Link
              to="/library"
              className="text-center rounded-sm transition hover:bg-accent-100"
            >
              Library
            </Link>
            <Link
              to="/recipes"
              className="text-center rounded-sm transition hover:bg-accent-100"
            >
              Recipes
            </Link>

            <hr className="border-t border-text-400 my-1" />

            {logoutUserMutation.isError && (
              <ErrorMessage
                className="text-center"
                message={logoutUserMutation.error.message}
              />
            )}

            <button
              type="button"
              className="rounded-sm transition hover:bg-accent-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => logoutUserMutation.mutate()}
              disabled={logoutUserMutation.isPending}
            >
              {logoutUserMutation.isPending ? 'Logging out...' : 'Log Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
