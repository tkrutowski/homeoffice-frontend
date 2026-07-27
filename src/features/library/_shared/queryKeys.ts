import type { ReadingStatus } from '@/features/library/shelf/types';

export type BookPageParams = {
  page: number;
  size: number;
  sort: string;
  direction: 'ASC' | 'DESC';
  globalFilter?: string | null;
  title?: string | null;
  author?: string | null;
  category?: string | null;
  series?: string | null;
};

export type AuthorPageParams = {
  page: number;
  size: number;
  sort: string;
  direction: 'ASC' | 'DESC';
  globalFilter?: string | null;
};

export const libraryKeys = {
  all: ['library'] as const,

  books: {
    all: () => [...libraryKeys.all, 'books'] as const,
    page: (params: BookPageParams) => [...libraryKeys.books.all(), 'page', params] as const,
    detail: (id: number) => [...libraryKeys.books.all(), 'detail', id] as const,
    byAuthor: (authorId: number) => [...libraryKeys.books.all(), 'author', authorId] as const,
    bySeries: (seriesId: number) => [...libraryKeys.books.all(), 'series', seriesId] as const,
    newBySeries: (seriesId: number, url: string) =>
      [...libraryKeys.books.all(), 'series-new', seriesId, url] as const,
    fromUrl: (url: string, ai: boolean) => [...libraryKeys.books.all(), 'from-url', url, ai] as const,
    audiobookAvailability: (bookId: number) =>
      [...libraryKeys.books.all(), 'audiobook-availability', bookId] as const,
  },

  categories: {
    all: () => [...libraryKeys.all, 'categories'] as const,
    list: () => [...libraryKeys.categories.all(), 'list'] as const,
  },

  authors: {
    all: () => [...libraryKeys.all, 'authors'] as const,
    list: () => [...libraryKeys.authors.all(), 'list'] as const,
    page: (params: AuthorPageParams) => [...libraryKeys.authors.all(), 'page', params] as const,
    statistics: () => [...libraryKeys.authors.all(), 'statistics'] as const,
  },

  series: {
    all: () => [...libraryKeys.all, 'series'] as const,
    list: () => [...libraryKeys.series.all(), 'list'] as const,
    detail: (id: number) => [...libraryKeys.series.all(), 'detail', id] as const,
  },

  bookstores: {
    all: () => [...libraryKeys.all, 'bookstores'] as const,
    list: () => [...libraryKeys.bookstores.all(), 'list'] as const,
    detail: (id: number) => [...libraryKeys.bookstores.all(), 'detail', id] as const,
  },

  shelf: {
    all: () => [...libraryKeys.all, 'shelf'] as const,
    byStatus: (status: ReadingStatus) => [...libraryKeys.shelf.all(), 'status', status] as const,
    byStatusAndYear: (status: ReadingStatus, year: number) =>
      [...libraryKeys.shelf.all(), 'status', status, 'year', year] as const,
    detail: (id: number) => [...libraryKeys.shelf.all(), 'detail', id] as const,
    byBookId: (bookId: number) => [...libraryKeys.shelf.all(), 'by-book', bookId] as const,
    search: (query: string) => [...libraryKeys.shelf.all(), 'search', query] as const,
    statistics: () => [...libraryKeys.shelf.all(), 'statistics'] as const,
    bookstoreStatistics: () => [...libraryKeys.shelf.all(), 'bookstore-statistics'] as const,
  },
};
