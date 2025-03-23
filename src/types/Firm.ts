export interface Firm {
    id: number
    name: string
    address: Address
    phone: string
    phone2: string
    fax: string
    mail: string
    www: string
    otherInfo: string
}

export interface Address {
    id: number;
    city: string;
    street: string;
    zip: string;
}