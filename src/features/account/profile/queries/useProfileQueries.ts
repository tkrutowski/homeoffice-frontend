import { useQuery } from '@tanstack/vue-query';
import { fetchMyProfile } from '@/features/account/profile/api/profileApi';
import { accountKeys } from '@/features/account/_shared/queryKeys';

export function useMyProfileQuery() {
  return useQuery({
    queryKey: accountKeys.profile(),
    queryFn: () => fetchMyProfile(),
  });
}
