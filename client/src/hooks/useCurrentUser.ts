import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../services/authService';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data.user;
    },
    retry: false,
  });
}
