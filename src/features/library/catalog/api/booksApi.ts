import httpCommon from '@/config/http-common';
import type { BookPageParams } from '@/features/library/_shared/queryKeys';
import type { Book, Category } from '@/features/library/catalog/types';
import type { AudiobookAvailabilityResponse } from '@/features/library/shelf/types';

export type BooksPageResult = {
  content: Book[];
  totalElements: number;
  number: number;
};

export async function fetchBooksPage(params: BookPageParams): Promise<BooksPageResult> {
  const search = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
    sort: params.sort,
    direction: params.direction,
  });

  if (params.globalFilter) search.append('globalFilter', params.globalFilter);
  if (params.title) search.append('title', params.title);
  if (params.author) search.append('author', params.author);
  if (params.category) search.append('category', params.category);
  if (params.series) search.append('series', params.series);

  const response = await httpCommon.get(`/v1/library/book/page?${search.toString()}`);
  return {
    content: response.data.content,
    totalElements: response.data.totalElements,
    number: response.data.number,
  };
}

export async function fetchBook(bookId: number): Promise<Book | null> {
  const response = await httpCommon.get(`/v1/library/book/${bookId}`);
  return response.data ?? null;
}

export async function fetchBookFromUrl(url: string, ai = false): Promise<Book | null> {
  const baseUrl = ai
    ? `https://n8n.focikhome.synology.me/webhook/bf930829-7649-4dfe-a30d-56e941abedfa?&url=${url}`
    : `/v1/library/book/url?&url=${url}`;
  const response = await httpCommon.get(baseUrl, { timeout: 90_000 });
  return response.data ?? null;
}

export async function createBook(book: Book): Promise<Book> {
  const response = await httpCommon.post(`/v1/library/book`, book);
  return response.data;
}

export async function updateBook(book: Book): Promise<Book> {
  const response = await httpCommon.put(`/v1/library/book`, book);
  return response.data;
}

export async function deleteBook(bookId: number): Promise<void> {
  await httpCommon.delete(`/v1/library/book/${bookId}`);
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await httpCommon.get(`/v1/library/category`);
  return response.data ?? [];
}

export async function createCategory(category: Category): Promise<Category> {
  const response = await httpCommon.post(`/v1/library/category`, category);
  return response.data;
}

export async function fetchAudiobookAvailability(bookId: number): Promise<AudiobookAvailabilityResponse | null> {
  try {
    const response = await httpCommon.get<AudiobookAvailabilityResponse>(
      `/v1/library/book/${bookId}/audiobook-availability`
    );
    return response.data ?? null;
  } catch (error) {
    console.error('fetchAudiobookAvailability()', error);
    return null;
  }
}

export async function fetchBooksByAuthor(authorId: number): Promise<Book[]> {
  const response = await httpCommon.get(`/v1/library/book/author/${authorId}`);
  return response.data ?? [];
}

export async function fetchBooksInSeries(seriesId: number): Promise<Book[]> {
  const response = await httpCommon.get(`/v1/library/book/series/${seriesId}`);
  return response.data ?? [];
}

export async function fetchNewBooksInSeries(seriesId: number, url: string): Promise<Book[]> {
  const response = await httpCommon.get(`/v1/library/book/series/new/${seriesId}?url=${url}`);
  return response.data ?? [];
}
