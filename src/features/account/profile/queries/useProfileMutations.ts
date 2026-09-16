import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { updateMyProfile } from '@/features/account/profile/api/profileApi';
import { accountKeys } from '@/features/account/_shared/queryKeys';
import type { UpdateProfilePayload } from '@/features/account/profile/types';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMyProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.profile() });
    },
  });
}
