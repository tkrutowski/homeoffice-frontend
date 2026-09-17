import httpCommon from '@/config/http-common';
import type { AccountActivity, AccountActivityAction, AccountActivityEntry } from '@/features/account/activity/types';

interface AuditChangeDto {
  summary: string;
  moduleTag: string;
  action: AccountActivityAction;
  changedAt: string;
}

interface AccountActivityDto {
  lastLoginDate: string | null;
  recentChanges: AuditChangeDto[];
}

/**
 * `changedAt` przychodzi jako LocalDateTime bez strefy (np. "2026-09-16T06:12:00").
 * Rozbijamy string na komponenty i budujemy Date przez konstruktor z jawnymi argumentami,
 * żeby te cyfry były potraktowane jako dosłowny czas zegarowy - niezależnie od strefy
 * czasowej przeglądarki (w przeciwieństwie do `new Date(naiveString)`, który dałby
 * niejednoznaczny wynik w zależności od silnika/strefy).
 */
function parseLocalDateTime(value: string): Date {
  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = (timePart ?? '00:00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second ?? 0);
}

function normalizeEntry(dto: AuditChangeDto): AccountActivityEntry {
  return {
    summary: dto.summary,
    moduleTag: dto.moduleTag,
    action: dto.action,
    changedAt: parseLocalDateTime(dto.changedAt),
  };
}

export async function fetchMyActivity(limit = 10): Promise<AccountActivity> {
  const response = await httpCommon.get<AccountActivityDto>(`/v1/user/me/activity?limit=${limit}`);
  return {
    lastLoginDate: response.data.lastLoginDate ? new Date(response.data.lastLoginDate) : null,
    recentChanges: (response.data.recentChanges ?? []).map(normalizeEntry),
  };
}
