export interface PasskeyCredential {
  id: string;
  label: string | null;
  created: Date;
  lastUsed: Date | null;
}
