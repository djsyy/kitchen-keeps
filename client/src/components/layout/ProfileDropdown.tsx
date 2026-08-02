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
        className="border-primary-100 text-primary hover:border-primary-300 hover:bg-primary-50 rounded-lg border bg-white/60 p-2 shadow-sm transition"
        aria-label="Open profile menu"
        onClick={toggleDropdown}
      >
        <PiUserCircleThin className="h-8 w-8" />
      </button>

      {isOpen && (
        <div className="bg-background-50 border-accent-300 absolute top-full right-0 left-1/2 z-50 mt-2 h-fit w-30 -translate-x-1/2 rounded-md border px-2 py-4 shadow-md">
          <div className="text-md text-text flex flex-col gap-2">
            <Link
              to="/profile"
              className="hover:bg-accent-100 rounded-sm text-center transition"
            >
              Profile
            </Link>
            <Link
              to="/dashboard"
              className="hover:bg-accent-100 rounded-sm text-center transition"
            >
              Dashboard
            </Link>
            <Link
              to="/library"
              className="hover:bg-accent-100 rounded-sm text-center transition"
            >
              Library
            </Link>
            <Link
              to="/recipes"
              className="hover:bg-accent-100 rounded-sm text-center transition"
            >
              Recipes
            </Link>

            <hr className="border-text-400 my-1 border-t" />

            {logoutUserMutation.isError && (
              <ErrorMessage
                className="text-center"
                message={logoutUserMutation.error.message}
              />
            )}

            <button
              type="button"
              className="hover:bg-accent-100 rounded-sm transition disabled:cursor-not-allowed disabled:opacity-60"
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
