import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createBook,
  createCategory,
  deleteBook,
  fetchBookFromUrl,
  updateBook,
} from '@/features/library/catalog/api/booksApi';
import { libraryKeys } from '@/features/library/_shared/queryKeys';
import type { Book, Category } from '@/features/library/catalog/types';

export function useCreateBookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (book: Book) => createBook(book),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.books.all() });
    },
  });
}

export function useUpdateBookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (book: Book) => updateBook(book),
    onSuccess: book => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.books.all() });
      void queryClient.invalidateQueries({ queryKey: libraryKeys.books.detail(book.id) });
    },
  });
}

export function useDeleteBookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: number) => deleteBook(bookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.books.all() });
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: Category) => createCategory(category),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.categories.all() });
    },
  });
}

export function useFetchBookFromUrlMutation() {
  return useMutation({
    mutationFn: ({ url, ai = false }: { url: string; ai?: boolean }) => fetchBookFromUrl(url, ai),
  });
}
