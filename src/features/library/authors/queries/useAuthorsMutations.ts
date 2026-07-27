import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { createAuthor, deleteAuthor, updateAuthor } from '@/features/library/authors/api/authorsApi';
import { libraryKeys } from '@/features/library/_shared/queryKeys';
import type { Author } from '@/features/library/authors/types';

export function useCreateAuthorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (author: Author) => createAuthor(author),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.authors.all() });
    },
  });
}

export function useUpdateAuthorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (author: Author) => updateAuthor(author),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.authors.all() });
    },
  });
}

export function useDeleteAuthorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (authorId: number) => deleteAuthor(authorId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.authors.all() });
      void queryClient.invalidateQueries({ queryKey: libraryKeys.books.all() });
    },
  });
}
