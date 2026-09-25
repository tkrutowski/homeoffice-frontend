import type { AxiosError } from 'axios';
import httpCommon from '@/config/http-common';
import type { ResponseData } from '@/types/User';

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/** Reguła siły hasła zgodna z backendem: min. 8 znaków, min. 1 cyfra, min. 1 znak specjalny. */
export const PASSWORD_STRENGTH_REGEX = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export type PasswordErrorField = 'oldPassword' | 'newPassword' | 'generic';

export interface PasswordChangeError {
  field: PasswordErrorField;
  message: string;
}

/**
 * Backend nie zwraca osobnego kodu błędu dla "złe stare hasło" vs "za słabe nowe hasło" -
 * jedynym rozróżnikiem jest dokładna treść `message` w odpowiedzi 400.
 */
export function parsePasswordChangeError(error: AxiosError<ResponseData>): PasswordChangeError {
  const message = error.response?.data?.message ?? '';

  if (message.includes('Password not found')) {
    return { field: 'oldPassword', message: 'Obecne hasło jest nieprawidłowe.' };
  }
  if (message.includes('Hasło musi mieć co najmniej')) {
    return { field: 'newPassword', message };
  }
  return { field: 'generic', message: message || 'Błąd podczas zmiany hasła.' };
}

export async function changeMyPassword(payload: ChangePasswordPayload): Promise<void> {
  await httpCommon.put('/v1/user/me/password', payload);
}

/** Reset hasła ("zapomniałem hasła") - endpointy publiczne, bez Authorization i bez refresh-tokena. */
export async function requestPasswordReset(email: string): Promise<void> {
  await httpCommon.post('/v1/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await httpCommon.post('/v1/auth/reset-password', { token, newPassword });
}
