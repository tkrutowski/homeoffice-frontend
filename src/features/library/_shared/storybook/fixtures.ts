import type { Author } from '@/features/library/authors/types';
import type { Bookstore } from '@/features/library/bookstores/types';
import type { Book, Category } from '@/features/library/catalog/types';
import type { Series } from '@/features/library/series/types';
import { EditionType, OwnershipStatus, ReadingStatus, type UserBook } from '@/features/library/shelf/types';
import sampleCoverUrl from './sample-cover.jpg';

export const mockAuthors: Author[] = [
  { id: 1, firstName: 'Andrzej', lastName: 'Sapkowski' },
  { id: 2, firstName: 'Brandon', lastName: 'Sanderson' },
];

export const mockCategories: Category[] = [
  { id: 1, name: 'Fantasy' },
  { id: 2, name: 'Przygoda' },
];

export const mockSeries: Series[] = [
  {
    id: 1,
    title: 'Wiedźmin',
    description: 'Saga o Wiedźminie',
    url: 'https://lubimyczytac.pl/cykl/123',
    checkDate: new Date('2026-07-01'),
    hasNewBooks: true,
  },
  {
    id: 2,
    title: 'Archiwum Burzowego Światła',
    description: 'Roshar i zaklęte ostrza',
    url: 'https://lubimyczytac.pl/cykl/456',
    checkDate: new Date('2026-06-18'),
    hasNewBooks: false,
  },
];

export const mockBookstores: Bookstore[] = [
  { id: 2, name: 'Legimi', url: 'https://www.legimi.pl' },
  { id: 7, name: 'Audioteka', url: 'https://audioteka.com' },
  { id: 8, name: 'Storytel', url: 'https://www.storytel.com' },
];

export const mockBook: Book = {
  id: 101,
  title: 'Ostatnie życzenie',
  description: 'Pierwszy tom opowiadań o Geralcie.',
  cover: sampleCoverUrl,

  series: mockSeries[0],
  authors: [mockAuthors[0]],
  categories: [mockCategories[0]],
  bookInSeriesNo: '1',
};

export const mockBookWithoutCover: Book = {
  ...mockBook,
  id: 202,
  title: 'Słowa światłości',
  cover: '',
  series: mockSeries[1],
  authors: [mockAuthors[1]],
  bookInSeriesNo: '2',
};

export const mockUserBook: UserBook = {
  id: 500,
  idUser: 1,
  book: mockBook,
  idBookstore: 2,
  editionType: EditionType.BOOK,
  ownershipStatus: OwnershipStatus.HAVE,
  readingStatus: ReadingStatus.READ_NOW,
  readFrom: new Date('2026-07-02'),
  readTo: null,
  info: 'Czytam wieczorami',
};
