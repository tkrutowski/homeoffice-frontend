export interface AccountProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  enabled: boolean;
  notLocked: boolean;
  joinDate: Date;
  lastLoginDate: Date | null;
  lastLoginDateDisplay: Date;
  idEmployee: number | null;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
}
