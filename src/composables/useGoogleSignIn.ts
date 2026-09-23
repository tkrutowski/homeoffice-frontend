// composables/useGoogleSignIn.ts
import { ref } from 'vue';
import { GOOGLE_CLIENT_ID } from '@/config/google';

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number | string;
  locale?: string;
}

interface GoogleAccountsId {
  initialize(config: GoogleIdConfiguration): void;
  renderButton(parent: HTMLElement, options: GoogleButtonConfiguration): void;
}

interface GoogleGlobal {
  accounts: {
    id: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}

const SCRIPT_URL = 'https://accounts.google.com/gsi/client';
let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Nie udało się załadować Google Identity Services.'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function useGoogleSignIn() {
  const error = ref<string | null>(null);

  async function renderButton(
    container: HTMLElement,
    onCredential: (idToken: string) => void,
    options?: GoogleButtonConfiguration
  ) {
    error.value = null;
    try {
      await loadGoogleScript();
      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services niedostępne.');
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: response => onCredential(response.credential),
      });

      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        locale: 'pl',
        ...options,
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Nie udało się zainicjować logowania Google.';
    }
  }

  return { error, renderButton };
}
