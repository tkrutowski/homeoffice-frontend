export interface Series {
  id: number;
  title: string;
  description: string;
  url: string;
  checkDate: Date | null;
  hasNewBooks: boolean;
}
