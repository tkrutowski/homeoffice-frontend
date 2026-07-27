import { useAuthorsStore } from '@/features/library/authors/authors.store';
import { useBookstoreStore } from '@/features/library/bookstores/bookstores.store';
import { useBooksStore } from '@/features/library/catalog/books.store';
import { useSeriesStore } from '@/features/library/series/series.store';
import { useUserbooksStore } from '@/features/library/shelf/userbooks.store';
import { mockAuthors, mockBookstores, mockSeries, mockUserBook } from '@/features/library/_shared/storybook/fixtures';
import { ReadingStatus } from '@/features/library/shelf/types';
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

  const userbooksStore = useUserbooksStore();
  userbooksStore.loadingUserbooks = false;
  userbooksStore.getUserbooksByBookIdFromDb = async () => [mockUserBook];
  userbooksStore.getBooksReadNowForCurrentYear = async () => [mockUserBook];
  userbooksStore.getUserbooksByDate = async () => [mockUserBook];
  userbooksStore.getUserbooksByStatusFromDb = async () => [mockUserBook];

  const seriesStore = useSeriesStore();
  seriesStore.series = mockSeries;
  seriesStore.loadingBooksInSeries = false;
  seriesStore.loadingSeries = false;
  seriesStore.getSeriesFromDb = async () => undefined;
  seriesStore.getBooksInSeriesFromDb = async () => [];
  seriesStore.getNewBooksInSeriesFromDb = async () => [];
  seriesStore.getSeriesByIdFromDb = async id => mockSeries.find(s => s.id === id) ?? null;

  const authorsStore = useAuthorsStore();
  authorsStore.authors = mockAuthors;
  authorsStore.loadingAuthors = false;
  authorsStore.getAuthorsFromDb = async () => mockAuthors;
  authorsStore.getAuthorsFromDbPage = async () => undefined;
  authorsStore.getAuthorBooks = async () => [];

  const booksStore = useBooksStore();
  booksStore.loadingBooks = false;
  booksStore.categories = [
    { id: 1, name: 'Fantasy' },
    { id: 2, name: 'Przygoda' },
  ];
  booksStore.getBooksFromDb = async () => undefined;
  booksStore.getCategoriesFromDb = async () => undefined;

  const bookstoresStore = useBookstoreStore();
  bookstoresStore.bookstores = mockBookstores;
  bookstoresStore.loadingBookstore = false;
  bookstoresStore.getBookstoresFromDb = async () => undefined;

  userbooksStore.readingStatuses = [ReadingStatus.NOT_READ, ReadingStatus.READ_NOW, ReadingStatus.READ];
}
