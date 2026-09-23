import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  deletePasskey,
  getPasskeyRegistrationOptions,
  registerPasskey,
} from '@/features/account/passkeys/api/passkeyApi';
import { accountKeys } from '@/features/account/_shared/queryKeys';
import { useWebAuthn } from '@/composables/useWebAuthn';

/** mutateAsync() zwraca false przy cichym anulowaniu ceremonii przez użytkownika (nie błąd). */
export function useRegisterPasskeyMutation() {
  const queryClient = useQueryClient();
  const { performRegistration } = useWebAuthn();

  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const optionsJSON = await getPasskeyRegistrationOptions();
      const credential = await performRegistration(optionsJSON);
      if (!credential) return false;
      await registerPasskey(credential);
      return true;
    },
    onSuccess: registered => {
      if (registered) {
        void queryClient.invalidateQueries({ queryKey: accountKeys.passkeys() });
      }
    },
  });
}

export function useDeletePasskeyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePasskey(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.passkeys() });
    },
  });
}
