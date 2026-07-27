import type { Author } from '@/features/library/authors/types';
import type { Series } from '@/features/library/series/types';

export type { Author } from '@/features/library/authors/types';
export type { Series } from '@/features/library/series/types';

export interface BookDto {
  id: number;
  series: string;
  authors: string;
  categories: string;
  title: string;
  description: string;
  cover: string;
  bookInSeriesNo: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  series: Series | null;
  authors: Author[];
  categories: Category[];
  title: string;
  description: string;
  cover: string;
  bookInSeriesNo: string;
}
