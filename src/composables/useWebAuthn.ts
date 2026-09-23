import { browserSupportsWebAuthn, startAuthentication, startRegistration } from '@simplewebauthn/browser';
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser';

function isCancelled(err: unknown): boolean {
  return err instanceof Error && err.name === 'NotAllowedError';
}

/** Ceremonia WebAuthn (rejestracja/logowanie kluczem dostępu) - odcisk palca / Face ID / Windows Hello. */
export function useWebAuthn() {
  const isSupported = browserSupportsWebAuthn();

  /** Zwraca null przy cichym anulowaniu przez użytkownika (np. zamknięcie promptu biometrii). */
  async function performRegistration(
    optionsJSON: PublicKeyCredentialCreationOptionsJSON
  ): Promise<RegistrationResponseJSON | null> {
    try {
      return await startRegistration({ optionsJSON });
    } catch (err) {
      if (isCancelled(err)) return null;
      throw err;
    }
  }

  /** Zwraca null przy cichym anulowaniu przez użytkownika (np. zamknięcie promptu biometrii). */
  async function performAuthentication(
    optionsJSON: PublicKeyCredentialRequestOptionsJSON
  ): Promise<AuthenticationResponseJSON | null> {
    try {
      return await startAuthentication({ optionsJSON });
    } catch (err) {
      if (isCancelled(err)) return null;
      throw err;
    }
  }

  return { isSupported, performRegistration, performAuthentication };
}
