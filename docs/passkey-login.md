# Logowanie passkeyem (odcisk palca / Face ID / Windows Hello)

Dokumentacja integracji WebAuthn/passkey — logowania kluczem dostępu na ekranie logowania
(`LoginView.vue`), obok istniejącego logowania login/hasło i logowania przez Google, oraz
zarządzania kluczami w Ustawieniach konta (`features/account/passkeys/`).

Dotyczy plików:
- `src/composables/useWebAuthn.ts` — wrapper na ceremonię `@simplewebauthn/browser`
  (`startRegistration()` / `startAuthentication()`)
- `src/stores/authorization.ts` — akcja `loginWithPasskey()`
- `src/config/http-common.ts` — `WEBAUTHN_BASE_URL`, wyjątki dla endpointów WebAuthn w
  interceptorach Axios
- `src/views/LoginView.vue` — przycisk logowania kluczem, spięcie z EC2 wake-up flow
- `src/features/account/passkeys/` — rejestracja/lista/usuwanie kluczy w Ustawieniach konta
  (`PasskeySection.vue`, `api/passkeyApi.ts`, `queries/usePasskeyQueries.ts`,
  `queries/usePasskeyMutations.ts`, `types.ts`)

## 1. Kontekst biznesowy

Passkey to **druga metoda logowania obok hasła i Google** — nie zakłada nowego konta. Tak jak
przy Google, rejestracja klucza jest dostępna **tylko dla już zalogowanego** użytkownika
(w Ustawieniach konta), logowanie kluczem jest natomiast dostępne każdemu na ekranie logowania,
obok przycisków hasła i Google.

**Ograniczenie domeny (nie do naprawienia po stronie frontu):** `rpId` WebAuthn jest zaszyty na
sztywno po stronie backendu na `focikhome.netlify.app` (produkcyjnie) i `localhost` (dev, dowolny
port). Passkeye **nie zadziałają** na żadnej innej domenie/subdomenie — `rpId` jest częścią
każdego zarejestrowanego klucza, więc to fundamentalne ograniczenie specyfikacji WebAuthn, a nie
błąd konfiguracji.

## 2. Endpointy backendu

Wszystkie wywołania **muszą** iść z `withCredentials: true` — ceremonia WebAuthn trzyma stan w
sesji/ciasteczku między krokami (osobno od naszego JWT). Wszystkie wywoływane są bez prefiksu
`/api` — patrz [§4](#4-gotcha-endpointy-webauthn-nie-mają-prefiksu-api).

### Rejestracja nowego klucza (Ustawienia konta, użytkownik już zalogowany JWT)

```
POST   /webauthn/register/options     Authorization: Bearer <JWT>
       → opcje/challenge do navigator.credentials.create()

POST   /webauthn/register             Authorization: Bearer <JWT>
       → body: wynik startRegistration(); zapisuje klucz

GET    /webauthn/register             Authorization: Bearer <JWT>
       → lista: [{ id, label, created, lastUsed }, ...]  (pusta [], nie 404, gdy brak kluczy)
       → id = dokładnie ten string, który idzie do DELETE poniżej (base64url credentialId)
       → label może być null/puste — fallback w UI: "Klucz dodany {data}"

DELETE /webauthn/register/{id}        Authorization: Bearer <JWT>
       → usuwa zarejestrowany klucz
```

### Logowanie passkeyem (ekran logowania, brak JWT)

```
POST   /webauthn/authenticate/options   (bez JWT)
       → opcje/challenge do navigator.credentials.get()

POST   /login/webauthn                  (bez JWT)
       → body: wynik startAuthentication()
       → 200: { "authenticated": true }   ⚠️ to NIE są jeszcze nasze tokeny

POST   /webauthn/token                  (bez body, ale z tym samym withCredentials,
                                          żeby zaszło ciasteczko sesji z kroku /login/webauthn)
       → DOPIERO TO zwraca { accessToken, refreshToken }
```

### Kody błędów

- `POST /webauthn/register/options` bez ważnego JWT → `400` (nie `401` — tak działa filtr
  biblioteki po stronie backendu) → „musisz być zalogowany, żeby dodać klucz”
- `POST /login/webauthn` z niepoprawnym/odrzuconym kluczem → `401` → ogólny błąd logowania,
  z fallbackiem do hasła/Google
- Anulowanie przez użytkownika w oknie przeglądarki (np. zamknięcie promptu biometrii) →
  `navigator.credentials.*` rzuca `NotAllowedError` → **ciche anulowanie, nie błąd**
  (patrz [§5](#5-obsługa-anulowania---usewebauthnts))

## 3. Schemat przepływu — logowanie

```
LoginView.vue
        │  v-if="isPasskeySupported" (browserSupportsWebAuthn())
        ▼
Użytkownik klika "Zaloguj kluczem dostępu"
        │
        ▼
loginWithPasskey() w LoginView.vue
        │
        ▼
withEc2AndLogin(() => authorizationStore.loginWithPasskey())
        │  (ten sam wrapper co login() i loginWithGoogle() — budzi EC2, pokazuje loginPhase)
        ▼
authorizationStore.loginWithPasskey()
        │
        ├─ 1. POST /webauthn/authenticate/options  { baseURL: WEBAUTHN_BASE_URL, withCredentials: true }
        │         │
        │         ▼
        ├─ 2. useWebAuthn().performAuthentication(optionsJSON)
        │         │  navigator.credentials.get() pod spodem (przez @simplewebauthn/browser)
        │         │
        │         ├─ null (NotAllowedError - anulowano) → return false, BEZ toasta błędu
        │         │
        │         ▼ credential
        ├─ 3. POST /login/webauthn  { credential, withCredentials: true }
        │         │
        │         ▼
        ├─ 4. POST /webauthn/token  { withCredentials: true }  → { accessToken, refreshToken }
        │         │
        │         ▼
        ├─ 5. logUser(accessToken, refreshToken, clearQueryCache=true)   (jak w login())
        │         → ten sam storage, ten sam refresh, ten sam redirect (goBack())
        │
        └─ catch (401 z /login/webauthn, WebAuthnError z ceremonii, ...)
                  → setLoginError('Logowanie kluczem dostępu nie powiodło się. Użyj hasła lub Google.')
                  │
                  ▼
        watch(loginError) w LoginView.vue → toast.add(...)   (mechanizm współdzielony
                                                                 ze zwykłym loginem i Google)
```

## 4. Gotcha: endpointy WebAuthn nie mają prefiksu `/api`

W przeciwieństwie do reszty naszego API (`/api/v1/auth/...`, `/api/v1/user/...`), ścieżki
WebAuthn **nie są mapowane przez `@RequestMapping` backendu** — cztery z sześciu
(`/webauthn/register/options`, `/webauthn/register`, `/webauthn/register/{id}`,
`/webauthn/authenticate/options`, `/login/webauthn`) są zaszyte na sztywno wewnątrz filtrów
biblioteki Spring Security WebAuthn (`WebAuthnRegistrationFilter`,
`PublicKeyCredentialCreationOptionsFilter` itd.) — DSL `.webAuthn()` nie ma opcji, żeby je
przeprefiksować. Własne `GET /webauthn/register` i `POST /webauthn/token` backendu celowo trzymają
ten sam brak prefiksu, dla spójności — wszystko pod jednym
`securityMatcher("/webauthn/**", "/login/webauthn")`.

Trzeba więc wołać je na **korzeniu** API, bez `/api` z `VITE_API_BASE_URL`. Stąd w
`http-common.ts`:

```ts
export const WEBAUTHN_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/api\/?$/, '');
```

- dev: `http://localhost:8077/api` → `http://localhost:8077`
- prod: `https://api.homeoffice.focik.net/api` → `https://api.homeoffice.focik.net`
- docker: `/api` → `""` (relatywnie do originu frontu — zakłada, że ten sam reverse proxy, który
  przekierowuje `/api`, przekierowuje też `/webauthn/**` i `/login/webauthn`)

**Każde** wywołanie WebAuthn (w `passkeyApi.ts` i `authorization.ts`) przekazuje
`{ baseURL: WEBAUTHN_BASE_URL, withCredentials: true }` jako trzeci argument axiosa, np.:

```ts
await httpCommon.post('/webauthn/register', credential, { baseURL: WEBAUTHN_BASE_URL, withCredentials: true });
```

Interceptory (dopasowanie ścieżki do pominięcia `Authorization`, wyjątek dla 401 w
odpowiedzi — patrz [§7](#7-dlaczego-endpointy-logowania-pomijają-wspólną-logikę-refreshlogout))
działają dalej poprawnie, bo bazują na `config.url` (ścieżka względna przekazana do wywołania),
nie na `config.baseURL`.

### Wymagany CORS po stronie backendu

Ponieważ `/webauthn/**` i `/login/webauthn` są na osobnym `securityMatcher` niż `/api/**`, mają
też **osobną** konfigurację CORS. Jeśli wywołania WebAuthn padają na etapie preflightu (`OPTIONS`)
z błędem typu „No 'Access-Control-Allow-Origin' header is present”, to znaczy, że ten drugi
filter chain nie ma podpiętego `CorsConfigurationSource` — trzeba go dograć analogicznie do
`/api/**`, obejmując **oba** środowiska (`http://localhost:5173` w dev, `https://focikhome.netlify.app`
w prod), z `Access-Control-Allow-Credentials: true` (bo używamy `withCredentials`).

## 5. Obsługa anulowania — `useWebAuthn.ts`

`navigator.credentials.create()/get()` rzuca `NotAllowedError`, gdy użytkownik zamknie/anuluje
prompt biometrii w przeglądarce — to **nie jest błąd aplikacji**, tylko normalna rezygnacja.
`@simplewebauthn/browser` opakowuje ten wyjątek we własny `WebAuthnError`, ale zachowuje
oryginalną nazwę (`this.name = name ?? cause.name`), więc `err.name === 'NotAllowedError'` nadal
działa po opakowaniu:

```ts
function isCancelled(err: unknown): boolean {
  return err instanceof Error && err.name === 'NotAllowedError';
}

async function performAuthentication(optionsJSON) {
  try {
    return await startAuthentication({ optionsJSON });
  } catch (err) {
    if (isCancelled(err)) return null;
    throw err;
  }
}
```

Wywołujący (`loginWithPasskey()` w store, `addPasskey()` w `PasskeySection.vue`) traktuje `null`
jako cichy no-op — `return false` bez `setLoginError`/toasta błędu, żadnego komunikatu użytkownikowi.
Każdy inny wyjątek (np. `NotSupportedError`, brak dostępnego authenticatora) leci dalej i kończy
się ogólnym komunikatem błędu.

## 6. Rejestracja i zarządzanie kluczami — Ustawienia konta

```
PasskeySection.vue (features/account/passkeys/)
        │
        ├─ usePasskeysQuery()  ──►  GET /webauthn/register  ──►  lista PasskeyCredential[]
        │                            (JWT z interceptora, jak każdy inny zapytanie do /v1/...)
        │
        ├─ "Dodaj klucz dostępu" → useRegisterPasskeyMutation().mutateAsync()
        │       1. getPasskeyRegistrationOptions()  → POST /webauthn/register/options
        │       2. useWebAuthn().performRegistration(optionsJSON)
        │              null (anulowano) → mutationFn zwraca false, BEZ toasta błędu
        │       3. registerPasskey(credential)  → POST /webauthn/register
        │       → onSuccess (tylko gdy true): invalidateQueries(accountKeys.passkeys())
        │
        └─ Usuń (OfficeIconButton + ConfirmationDialog) → useDeletePasskeyMutation().mutateAsync(id)
                → DELETE /webauthn/register/{id}
                → onSuccess: invalidateQueries(accountKeys.passkeys())
```

- Endpoint listy (`GET /webauthn/register`) jest **niestandardowy** — biblioteka Spring Security
  WebAuthn go nie ma, backend dopisał go we własnym `WebAuthnAuthController` (razem z
  `POST /webauthn/token`) specjalnie po to, żeby front mógł pokazać i zarządzać kluczami z poziomu
  Ustawień konta — bez tego frontend nie miałby skąd wziąć `id` do `DELETE`.
- `PasskeyCredential.label` bywa `null`/puste (klucz/przeglądarka nie nadały nazwy) — UI pokazuje
  wtedy fallback `Klucz dodany {data}` (`passkeyLabel()` w `PasskeySection.vue`).
- Sekcja jest ukryta (`v-if="!isSupported"` pokazuje tylko komunikat), gdy
  `browserSupportsWebAuthn()` zwróci `false` — np. stara przeglądarka bez WebAuthn.

## 7. Dlaczego endpointy logowania pomijają wspólną logikę refresh/logout

Tak jak przy logowaniu Google, response interceptor w `http-common.ts` przy `401` normalnie
próbuje odświeżyć token i ponowić żądanie, a przy porażce woła `authStore.logout()`. To ma sens
dla żądań zalogowanego użytkownika, ale nie dla logowania passkeyem — na ekranie logowania nie ma
jeszcze ważnego `refreshToken`. Dlatego interceptor ma wczesny bypass dla wszystkich trzech
endpointów logowania:

```ts
const errorPath = error.config?.url?.split('?')[0] ?? '';
if (
  errorPath.endsWith('/auth/google') ||
  errorPath.endsWith('/login/webauthn') ||
  errorPath.endsWith('/webauthn/authenticate/options') ||
  errorPath.endsWith('/webauthn/token')
) {
  return Promise.reject(error);
}
```

Błąd trafia więc bezpośrednio do `try/catch` w `authorizationStore.loginWithPasskey()`. Z tego
samego powodu te trzy ścieżki są też dopisane do listy w request interceptorze, która pomija
nagłówek `Authorization` (obok `/login`, `/refresh`, `/auth/google`) — logowanie passkeyem nie
powinno wysyłać (potencjalnie wygasłego) tokenu z poprzedniej sesji. `/webauthn/register*` i
`GET /webauthn/register` **nie** są na tej liście — te wymagają aktywnego JWT, więc mają dostawać
`Authorization` normalnie.

## 8. Powiązane pliki

| Plik | Rola |
|---|---|
| `src/composables/useWebAuthn.ts` | Wrapper ceremonii `@simplewebauthn/browser`, `NotAllowedError` → `null` |
| `src/stores/authorization.ts` | `loginWithPasskey()` — obok `login()`/`loginWithGoogle()`, ten sam `logUser()` |
| `src/config/http-common.ts` | `WEBAUTHN_BASE_URL`, wyjątki dla ścieżek WebAuthn w request/response interceptorze |
| `src/views/LoginView.vue` | Przycisk logowania kluczem (gated `isPasskeySupported`), `withEc2AndLogin()` |
| `src/features/account/passkeys/PasskeySection.vue` | UI: lista kluczy, dodawanie, usuwanie z potwierdzeniem |
| `src/features/account/passkeys/api/passkeyApi.ts` | Thin HTTP: options/register/list/delete |
| `src/features/account/passkeys/queries/usePasskeyQueries.ts` | `usePasskeysQuery()` |
| `src/features/account/passkeys/queries/usePasskeyMutations.ts` | `useRegisterPasskeyMutation()`, `useDeletePasskeyMutation()` |
| `src/features/account/passkeys/types.ts` | `PasskeyCredential` |
| `src/features/account/_shared/queryKeys.ts` | `accountKeys.passkeys()` |
