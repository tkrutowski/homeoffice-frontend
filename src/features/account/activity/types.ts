export type AccountActivityAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AccountActivityEntry {
  summary: string;
  moduleTag: string;
  action: AccountActivityAction;
  changedAt: Date;
}

export interface AccountActivity {
  lastLoginDate: Date | null;
  recentChanges: AccountActivityEntry[];
}
