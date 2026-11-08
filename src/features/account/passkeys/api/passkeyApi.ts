import httpCommon, { WEBAUTHN_BASE_URL } from '@/config/http-common';
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from '@simplewebauthn/browser';
import type { PasskeyCredential } from '@/features/account/passkeys/types';

interface PasskeyDto {
  id: string;
  label: string | null;
  created: string;
  lastUsed: string | null;
}

function normalizePasskey(dto: PasskeyDto): PasskeyCredential {
  return {
    id: dto.id,
    label: dto.label,
    created: new Date(dto.created),
    lastUsed: dto.lastUsed ? new Date(dto.lastUsed) : null,
  };
}

export async function fetchPasskeys(): Promise<PasskeyCredential[]> {
  const response = await httpCommon.get<PasskeyDto[]>('/webauthn/register', {
    baseURL: WEBAUTHN_BASE_URL,
    withCredentials: true,
  });
  return response.data.map(normalizePasskey);
}

export async function getPasskeyRegistrationOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const response = await httpCommon.post<PublicKeyCredentialCreationOptionsJSON>(
    '/webauthn/register/options',
    undefined,
    { baseURL: WEBAUTHN_BASE_URL, withCredentials: true }
  );
  return response.data;
}

/** Etykieta klucza widoczna na liście - rozpoznanie urządzenia po platformie przeglądarki. */
function defaultPasskeyLabel(): string {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
    (/Android/i.test(navigator.userAgent) ? 'Android' : '') ||
    navigator.platform ||
    'urządzenie';
  return `Klucz - ${platform}`;
}

/**
 * Spring Security (WebAuthnRegistrationFilter) oczekuje ciała `{ publicKey: { credential, label } }`,
 * a nie samego credential - inaczej odpowiada 400.
 */
export async function registerPasskey(credential: RegistrationResponseJSON, label?: string): Promise<void> {
  await httpCommon.post(
    '/webauthn/register',
    { publicKey: { credential, label: label?.trim() || defaultPasskeyLabel() } },
    { baseURL: WEBAUTHN_BASE_URL, withCredentials: true }
  );
}

export async function deletePasskey(id: string): Promise<void> {
  await httpCommon.delete(`/webauthn/register/${encodeURIComponent(id)}`, {
    baseURL: WEBAUTHN_BASE_URL,
    withCredentials: true,
  });
}
