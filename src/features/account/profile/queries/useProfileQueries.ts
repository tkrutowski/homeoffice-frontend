import { useQuery } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { fetchMyProfile } from '@/features/account/profile/api/profileApi';
import { accountKeys } from '@/features/account/_shared/queryKeys';

export function useMyProfileQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: accountKeys.profile(),
    queryFn: () => fetchMyProfile(),
    enabled: computed(() => toValue(enabled)),
  });
}
