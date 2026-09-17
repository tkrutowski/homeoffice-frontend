import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchMyActivity } from '@/features/account/activity/api/activityApi';
import { accountKeys } from '@/features/account/_shared/queryKeys';

export function useMyActivityQuery(limit: MaybeRefOrGetter<number> = 10) {
  return useQuery({
    queryKey: computed(() => accountKeys.activity(toValue(limit))),
    queryFn: () => fetchMyActivity(toValue(limit)),
  });
}
