import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LuBookMarked,
  LuBookOpen,
  LuCookingPot,
  LuLayoutDashboard,
  LuList,
  LuLogOut,
  LuUserRound,
} from 'react-icons/lu';
import { PiUserCircleThin } from 'react-icons/pi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../../services/authService';
import { logoutUser } from '../../services/authService';
import ErrorMessage from '../ui/ErrorMessage';

const menuId = 'profile-menu';

type ProfileDropdownProps = {
  user?: User;
};

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const logoutUserMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      setIsOpen(false);
      navigate('/login', { replace: true });
    },
  });

  const getMenuItems = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"])'
      ) ?? []
    );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    getMenuItems()[0]?.focus();

    const closeOnOutsideInteraction = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideInteraction);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideInteraction);
  }, [isOpen]);

  const closeMenu = ({ returnFocus = false } = {}) => {
    setIsOpen(false);

    if (returnFocus) {
      triggerRef.current?.focus();
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const menuItems = getMenuItems();
    const currentIndex = menuItems.indexOf(
      document.activeElement as HTMLElement
    );

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu({ returnFocus: true });
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.key === 'Home') {
      menuItems[0]?.focus();
      return;
    }

    if (event.key === 'End') {
      menuItems[menuItems.length - 1]?.focus();
      return;
    }

    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + menuItems.length) % menuItems.length;
    menuItems[nextIndex]?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="border-primary-100 text-primary hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-primary rounded-lg border bg-white/60 p-2 shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label="Open profile menu"
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <PiUserCircleThin className="h-8 w-8" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Profile menu"
          className="border-background-300 bg-background-50 absolute top-full right-0 z-50 mt-2 max-h-[calc(100vh-6rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border p-2 shadow-lg sm:w-72"
          onKeyDown={handleMenuKeyDown}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              setIsOpen(false);
            }
          }}
        >
          {user && (
            <div className="border-background-200 px-3 pt-2 pb-3">
              <p className="text-text-950 truncate font-bold">{user.name}</p>
              <p className="text-text-600 mt-0.5 truncate text-sm">
                {user.email}
              </p>
            </div>
          )}

          <MenuSection label="Kitchen">
            <MenuLink
              to="/dashboard"
              icon={<LuLayoutDashboard />}
              onNavigate={() => closeMenu()}
            >
              Dashboard
            </MenuLink>
            <MenuLink
              to="/recipes"
              icon={<LuCookingPot />}
              onNavigate={() => closeMenu()}
            >
              Recipes
            </MenuLink>
            <MenuLink
              to="/library"
              icon={<LuBookOpen />}
              onNavigate={() => closeMenu()}
            >
              Libraries
            </MenuLink>
          </MenuSection>

          <MenuSection label="Ingredients">
            <MenuLink
              to="/pantry"
              icon={<LuBookMarked />}
              onNavigate={() => closeMenu()}
            >
              Pantry
            </MenuLink>
            <MenuLink
              to="/ingredients"
              icon={<LuList />}
              onNavigate={() => closeMenu()}
            >
              Ingredients
            </MenuLink>
          </MenuSection>

          <div className="border-background-200 mt-2 border-t pt-2">
            <MenuLink
              to="/profile"
              icon={<LuUserRound />}
              onNavigate={() => closeMenu()}
            >
              Profile
            </MenuLink>

            {logoutUserMutation.isError && (
              <ErrorMessage
                className="mx-2 mt-2 text-left"
                message={logoutUserMutation.error.message}
              />
            )}

            <button
              type="button"
              role="menuitem"
              aria-disabled={logoutUserMutation.isPending}
              className="text-primary hover:bg-primary-50 focus-visible:outline-primary mt-1 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => logoutUserMutation.mutate()}
              disabled={logoutUserMutation.isPending}
            >
              <LuLogOut aria-hidden="true" className="h-5 w-5 shrink-0" />
              {logoutUserMutation.isPending ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-2">
      <p className="text-text-500 px-3 pt-2 pb-1 text-xs font-bold tracking-wide uppercase">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

function MenuLink({
  to,
  icon,
  children,
  onNavigate,
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      className="text-text-700 hover:bg-background-100 hover:text-text-950 focus-visible:outline-primary flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2"
      onClick={onNavigate}
    >
      <span
        aria-hidden="true"
        className="text-text-500 [&>svg]:h-5 [&>svg]:w-5"
      >
        {icon}
      </span>
      {children}
    </Link>
  );
}
