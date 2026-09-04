import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createBookstore, deleteBookstore, updateBookstore } from '@/features/library/bookstores/api/bookstoresApi';
import { libraryKeys } from '@/features/library/_shared/queryKeys';
import type { Bookstore } from '@/features/library/bookstores/types';

export function useCreateBookstoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookstore: Bookstore) => createBookstore(bookstore),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.bookstores.all() });
    },
  });
}

export function useUpdateBookstoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookstore: Bookstore) => updateBookstore(bookstore),
    onSuccess: bookstore => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.bookstores.all() });
      void queryClient.invalidateQueries({ queryKey: libraryKeys.bookstores.detail(bookstore.id) });
    },
  });
}

export function useDeleteBookstoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookstoreId: number) => deleteBookstore(bookstoreId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.bookstores.all() });
      void queryClient.invalidateQueries({ queryKey: libraryKeys.shelf.all() });
    },
  });
}
