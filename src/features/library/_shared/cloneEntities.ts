import type { Author, Book, Category, Series, UserBook } from '@/features/library/shelf/types';

/**
 * Dane z TanStack Query są głęboko readonly (Vue).
 * Przed edycją w formularzu zawsze kopiuj encję — nigdy nie mutuj `data` z useQuery.
 */

export function cloneAuthor(source: Author): Author {
  return { ...source };
}

export function cloneCategory(source: Category): Category {
  return { ...source };
}

export function cloneSeries(source: Series): Series {
  return { ...source };
}

export function cloneBook(source: Book): Book {
  return {
    ...source,
    authors: (source.authors ?? []).map(cloneAuthor),
    categories: (source.categories ?? []).map(cloneCategory),
    series: source.series ? cloneSeries(source.series) : null,
  };
}

export function cloneUserBook(source: UserBook): UserBook {
  return {
    ...source,
    book: source.book ? cloneBook(source.book) : null,
    readFrom: source.readFrom instanceof Date ? new Date(source.readFrom.getTime()) : source.readFrom,
    readTo: source.readTo instanceof Date ? new Date(source.readTo.getTime()) : source.readTo,
  };
}
