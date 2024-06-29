type Website = "UPOLUJ_EBOOKA" | "EMPIK";
type ReadingType = "NOT_READ" | "READ_NOW" | "READ" | "ALL";
type OwnershipType = "HAVE" | "WANT" | "READ_ONLY" | "ALL";
type Edition = "BOOK" | "AUDIOBOOK" | "EBOOK" | "ALL";
export interface ReadingStatus {
  name: ReadingType;
  viewName: string;
}
export interface OwnershipStatus {
  name: OwnershipType;
  viewName: string;
}
export interface EditionType {
  name: Edition;
  viewName: string;
}
export default Website;
export interface Book {
  id: number;
  series: Series | undefined;
  authors: Author[];
  categories: Category[];
  title: string;
  description: string;
  cover: string;
  bookInSeriesNo: string;
}
export interface Author {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Series {
  id: number;
  title: string;
  description: string;
  url: string;
}

export interface Bookstore {
  id: number;
  name: string;
  url: string;
}

export interface UserBook {
  id: number;
  idUser: number;
  book: Book | undefined;
  idBookstore: number;
  editionType: EditionType;
  readingStatus: ReadingStatus;
  ownershipStatus: OwnershipStatus;
  readFrom: string;
  readTo: string;
  info: string;
}
