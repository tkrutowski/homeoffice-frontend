export interface FileInfo {
  id: number;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadDate: Date | null;
  description: string;
}

export type Module = 'CARD' | 'DEVICE_FILES' | 'DEVICE_IMAGES' | 'BOOK';
