import { queryClient } from '@/config/queryClient';
import { libraryKeys } from '@/features/library/_shared/queryKeys';
import {
  mockAuthors,
  mockBookstores,
  mockCategories,
  mockSeries,
  mockUserBook,
} from '@/features/library/_shared/storybook/fixtures';
import { useAuthorizationStore } from '@/stores/authorization';

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJhdXRob3JpdGllcyI6WyJST0xFX0xJQlJBUlkiLCJST0xFX0FETUlOIl0sImV4cCI6NDA3MDkwODgwMH0.' +
  'signature';

export function setupLibraryStorybookStores() {
  const authStore = useAuthorizationStore();
  authStore.accessToken = mockToken;
  authStore.isAuthenticated = true;
  authStore.username = 'storybook';

  queryClient.setQueryData(libraryKeys.bookstores.list(), mockBookstores);
  queryClient.setQueryData(libraryKeys.authors.list(), mockAuthors);
  queryClient.setQueryData(libraryKeys.series.list(), mockSeries);
  queryClient.setQueryData(libraryKeys.categories.list(), mockCategories);
  if (mockUserBook.book) {
    queryClient.setQueryData(libraryKeys.shelf.byBookId(mockUserBook.book.id), [mockUserBook]);
  }
}
