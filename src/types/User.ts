type PrivilegeType = 'NULL' | 'READ' | 'WRITE' | 'DELETE' | 'READ_ALL' | 'WRITE_ALL' | 'DELETE_ALL'

export interface User {
  id: number
  firstName: string
  lastName: string
  password: string
  email: string
  username: string
  enabled: boolean
  notLocked: boolean
}

export interface Privilege {
  id: number
  idUser: number
  role: Role
  read: PrivilegeType
  write: PrivilegeType
  delete: PrivilegeType
}

export interface Role {
  id: number
  name: string
}

// Rozszerzenie JwtPayload
export interface CustomJwtPayload extends Record<string, unknown> {
  iss?: string;
  sub: string;
  aud?: string[] | string;
  exp: number;
  nbf?: number;
  iat: number;
  jti?: string;
  authorities: string[];
}

//Axios Error
export interface ResponseData {
  message: string;
}