import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../services/authService';
import { queryKeys } from '../utils/queryKeys';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data.user;
    },
    retry: false,
  });
}
