import httpCommon from '@/config/http-common';
import type { AudiobookAvailabilityResponse } from '@/types/Book';

export async function getAudiobookAvailability(bookId: number): Promise<AudiobookAvailabilityResponse | null> {
  try {
    const response = await httpCommon.get<AudiobookAvailabilityResponse>(
      `/v1/library/book/${bookId}/audiobook-availability`
    );
    return response.data ?? null;
  } catch (error) {
    console.error('getAudiobookAvailability()', error);
    return null;
  }
}
