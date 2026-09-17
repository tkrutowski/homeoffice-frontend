import { useMutation } from '@tanstack/vue-query';
import { changeMyPassword, type ChangePasswordPayload } from '@/features/account/password/api/passwordApi';

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changeMyPassword(payload),
  });
}
