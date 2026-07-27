import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createUserbook, deleteUserbook, updateUserbook } from '@/features/library/shelf/api/userbooksApi';
import { libraryKeys } from '@/features/library/_shared/queryKeys';
import type { UserBook } from '@/features/library/shelf/types';

function invalidateShelfRelated(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: libraryKeys.shelf.all() });
  void queryClient.invalidateQueries({ queryKey: libraryKeys.series.all() });
  void queryClient.invalidateQueries({ queryKey: libraryKeys.books.all() });
}

export function useCreateUserbookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userbook: UserBook) => createUserbook(userbook),
    onSuccess: () => {
      invalidateShelfRelated(queryClient);
    },
  });
}

export function useUpdateUserbookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userbook: UserBook) => updateUserbook(userbook),
    onSuccess: (_data, userbook) => {
      invalidateShelfRelated(queryClient);
      void queryClient.invalidateQueries({ queryKey: libraryKeys.shelf.detail(userbook.id) });
    },
  });
}

export function useDeleteUserbookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userbookId: number) => deleteUserbook(userbookId),
    onSuccess: () => {
      invalidateShelfRelated(queryClient);
    },
  });
}
