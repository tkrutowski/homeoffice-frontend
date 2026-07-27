import httpCommon from '@/config/http-common';
import type { AuthorPageParams } from '@/features/library/_shared/queryKeys';
import type { Author } from '@/features/library/authors/types';

export type AuthorsPageResult = {
  content: Author[];
  totalElements: number;
  number: number;
};

export async function fetchAuthors(): Promise<Author[]> {
  const response = await httpCommon.get(`/v1/library/author`);
  return response.data ?? [];
}

export async function fetchAuthorsPage(params: AuthorPageParams): Promise<AuthorsPageResult> {
  const search = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
    sort: params.sort,
    direction: params.direction,
  });

  if (params.globalFilter) search.append('globalFilter', params.globalFilter);

  const response = await httpCommon.get(`/v1/library/author/page?${search.toString()}`);
  return {
    content: response.data.content,
    totalElements: response.data.totalElements,
    number: response.data.number,
  };
}

export async function createAuthor(author: Author): Promise<Author> {
  const response = await httpCommon.post(`/v1/library/author`, author);
  return response.data;
}

export async function updateAuthor(author: Author): Promise<Author> {
  const response = await httpCommon.put(`/v1/library/author`, author);
  return response.data;
}

export async function deleteAuthor(authorId: number): Promise<void> {
  await httpCommon.delete(`/v1/library/author/${authorId}`);
}

export async function fetchAuthorStatistics(): Promise<Map<number, number>> {
  const response = await httpCommon.get(`/v1/library/author/statistics`);
  const authorStats = new Map<number, number>();

  if (!response.data) return authorStats;

  if (response.data instanceof Map) {
    response.data.forEach((value: number, key: unknown) => {
      if (typeof key === 'object' && key && 'id' in key) {
        authorStats.set((key as { id: number }).id, value);
      } else {
        authorStats.set(Number(key), value);
      }
    });
  } else {
    Object.entries(response.data).forEach(([key, value]) => {
      const idMatch = key.match(/id=(\d+)/);
      if (idMatch) {
        authorStats.set(Number(idMatch[1]), value as number);
      } else {
        authorStats.set(Number(key), value as number);
      }
    });
  }

  return authorStats;
}
