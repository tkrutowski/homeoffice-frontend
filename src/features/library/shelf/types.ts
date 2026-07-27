export type { Book, BookDto, Category } from '@/features/library/catalog/types';
export type { Author } from '@/features/library/authors/types';
export type { Series } from '@/features/library/series/types';
export type { Bookstore } from '@/features/library/bookstores/types';

import type { Book } from '@/features/library/catalog/types';

export enum ReadingStatus {
  NOT_READ = 'NOT_READ',
  READ_NOW = 'READ_NOW',
  READ = 'READ',
  ALL = 'ALL',
}

export enum OwnershipStatus {
  HAVE = 'HAVE',
  WANT = 'WANT',
  READ_ONLY = 'READ_ONLY',
  ALL = 'ALL',
}

export enum EditionType {
  BOOK = 'BOOK',
  AUDIOBOOK = 'AUDIOBOOK',
  EBOOK = 'EBOOK',
  ALL = 'ALL',
}

export interface UserBook {
  id: number;
  idUser: number;
  book: Book | null;
  idBookstore: number;
  editionType: EditionType;
  readingStatus: ReadingStatus;
  ownershipStatus: OwnershipStatus;
  readFrom: Date | null;
  readTo: Date | null;
  info: string;
}

export interface BookStatistic {
  year: number;
  audiobook: number;
  book: number;
  ebook: number;
}

export interface AudiobookAvailabilityResult {
  bookstoreId: number;
  platformName: string;
  available: boolean;
  url: string | null;
  error: string | null;
}

export interface AudiobookAvailabilityResponse {
  bookId: number;
  title: string;
  author: string;
  results: AudiobookAvailabilityResult[];
  checkedAt: string;
}
