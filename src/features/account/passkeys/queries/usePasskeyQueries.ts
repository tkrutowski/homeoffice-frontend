import { useQuery } from '@tanstack/vue-query';
import { fetchPasskeys } from '@/features/account/passkeys/api/passkeyApi';
import { accountKeys } from '@/features/account/_shared/queryKeys';

export function usePasskeysQuery() {
  return useQuery({
    queryKey: accountKeys.passkeys(),
    queryFn: () => fetchPasskeys(),
  });
}
