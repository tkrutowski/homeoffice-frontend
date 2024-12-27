export type BedType = 'SINGLE' | 'DOUBLE'
export interface Room {
  id: number
  name: string
  color: string
  bed: BedType[]
  price: number
  description: string
}
