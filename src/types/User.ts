export interface User {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  username: string;
  enabled: boolean;
  notLocked: boolean;
}

export interface Privilege {
  id: number;
  idUser: number;
  role: Role;
  read: PrivilegeType;
  write: PrivilegeType;
  delete: PrivilegeType;
}

export interface Role {
  id: number;
  name: string;
}