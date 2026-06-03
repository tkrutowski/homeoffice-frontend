import legimiIcon from '@/assets/images/legimi.png';
import audiotekaIcon from '@/assets/images/audioteka.png';
import storytelIcon from '@/assets/images/storytel.png';
import bookbeatIcon from '@/assets/images/bookbeat.png';

export const AUDIOBOOK_PLATFORM_ORDER = [2, 7, 8, 12] as const;

const PLATFORM_ICONS: Record<number, string> = {
  2: legimiIcon,
  7: audiotekaIcon,
  8: storytelIcon,
  12: bookbeatIcon,
};

export function getPlatformIcon(bookstoreId: number): string | undefined {
  return PLATFORM_ICONS[bookstoreId];
}
