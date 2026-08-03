type AuthRedirectState = {
  from?: {
    pathname?: unknown;
    search?: unknown;
    hash?: unknown;
  };
};

export function getPostAuthDestination(state: unknown) {
  if (!state || typeof state !== 'object') {
    return '/dashboard';
  }

  const { from } = state as AuthRedirectState;
  if (!from || typeof from.pathname !== 'string') {
    return '/dashboard';
  }

  if (!from.pathname.startsWith('/') || from.pathname.startsWith('//')) {
    return '/dashboard';
  }

  const search =
    typeof from.search === 'string' && from.search.startsWith('?')
      ? from.search
      : '';
  const hash =
    typeof from.hash === 'string' && from.hash.startsWith('#') ? from.hash : '';

  return `${from.pathname}${search}${hash}`;
}
