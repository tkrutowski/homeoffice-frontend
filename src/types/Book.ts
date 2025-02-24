export enum ReadingStatus {
  NOT_READ ='NOT_READ',
  READ_NOW = 'READ_NOW',
  READ = 'READ',
  ALL = 'ALL'
}
export enum OwnershipStatus {
  HAVE = 'HAVE',
  WANT = 'WANT',
  READ_ONLY = 'READ_ONLY',
  ALL = 'ALL'
}
export enum EditionType {
 BOOK ='BOOK',
 AUDIOBOOK = 'AUDIOBOOK',
 EBOOK = 'EBOOK',
 ALL = 'ALL'
}

export interface BookDto {
  id: number
  series: string
  authors: string
  categories: string
  title: string
  description: string
  cover: string
  bookInSeriesNo: string
}
export interface Book {
  id: number
  series: Series | null
  authors: Author[]
  categories: Category[]
  title: string
  description: string
  cover: string
  bookInSeriesNo: string
}
export interface Author {
  id: number
  firstName: string
  lastName: string
}

export interface Category {
  id: number
  name: string
}

export interface Series {
  id: number
  title: string
  description: string
  url: string
  checkDate: Date | null
  hasNewBooks: boolean
}

export interface Bookstore {
  id: number
  name: string
  url: string
}

export interface UserBook {
  id: number
  idUser: number
  book: Book | null
  idBookstore: number
  editionType: EditionType
  readingStatus: ReadingStatus
  ownershipStatus: OwnershipStatus
  readFrom: Date | null
  readTo: Date | null
  info: string
}
