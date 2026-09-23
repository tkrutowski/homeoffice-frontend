# Logowanie przez Google

Dokumentacja integracji "Zaloguj się przez Google" na ekranie logowania (`LoginView.vue`),
obok istniejącego logowania login/hasło.

Dotyczy plików:
- `src/config/google.ts` — publiczny `GOOGLE_CLIENT_ID`
- `src/composables/useGoogleSignIn.ts` — ładowanie Google Identity Services + render przycisku
- `src/stores/authorization.ts` — akcja `loginWithGoogle()`
- `src/config/http-common.ts` — wyjątki dla `/v1/auth/google` w interceptorach Axios
- `src/views/LoginView.vue` — UI + spięcie z EC2 wake-up flow

## 1. Kontekst biznesowy

Logowanie przez Google działa **tylko dla już istniejących kont** (zakładanych ręcznie przez
admina). Jeśli e-mail z konta Google nie pasuje do żadnego istniejącego użytkownika, backend
świadomie odrzuca logowanie (`400`) — to nie błąd do naprawienia, tylko decyzja biznesowa.
Frontend musi to rozróżnić od zwykłego błędu logowania (`401` — nieprawidłowy/wygasły token
Google, konto zablokowane) i pokazać osobny, zrozumiały komunikat.

## 2. Endpoint

```
POST /api/v1/auth/google
Content-Type: application/json

Request:  { "idToken": "<JWT z Google>" }
Response 200: { "accessToken": "...", "refreshToken": "..." }   (identyczny kształt co /login)
Response 400: konto nie istnieje w systemie → przyjazny komunikat
Response 401: nieprawidłowy/wygasły token, konto zablokowane → ogólny błąd logowania
```

## 3. Schemat przepływu

```
LoginView.vue (onMounted)
        │
        ▼
useGoogleSignIn().renderButton(container, handleGoogleCredential)
        │  1. leniwie ładuje <script src="accounts.google.com/gsi/client">
        │  2. google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback })
        │  3. google.accounts.id.renderButton(container, {...})
        ▼
Użytkownik klika przycisk Google → wybiera konto w popupie Google
        │
        ▼
callback(response) → onCredential(response.credential)   // credential = idToken
        │
        ▼
handleGoogleCredential(idToken) w LoginView.vue
        │
        ▼
withEc2AndLogin(() => authorizationStore.loginWithGoogle(idToken))
        │  (ten sam wrapper co zwykły login() — budzi EC2, pokazuje loginPhase)
        ▼
authorizationStore.loginWithGoogle(idToken)
        │
        ├─ 200 → logUser(accessToken, refreshToken, clearQueryCache=true)   (jak w login())
        │         → ten sam storage, ten sam refresh, ten sam redirect (goBack())
        │
        ├─ 400 → setLoginError('To konto Google nie jest powiązane...')
        │
        └─ 401 / inne → setLoginError('Nie udało się zalogować przez Google.')
                │
                ▼
        watch(loginError) w LoginView.vue → toast.add(...)   (mechanizm już istniejący,
                                                                 współdzielony ze zwykłym loginem)
```

## 4. Dlaczego `loginWithGoogle` nie używa wspólnej logiki refresh/logout z interceptora

W `http-common.ts` response interceptor przy `401` normalnie: sprawdza `INVALID_CREDENTIALS`,
`REFRESH TOKEN EXPIRED`, a w pozostałych przypadkach **próbuje odświeżyć token i ponowić
żądanie**, a przy porażce woła `authStore.logout()`. To zachowanie ma sens dla żądań do już
zalogowanego użytkownika, ale nie dla logowania Google — na ekranie logowania nie ma jeszcze
ważnego `refreshToken`, więc próba odświeżenia tylko generuje zbędny request i efekt uboczny
(`logout()` → reset store + redirect), zanim błąd w ogóle dotrze do `loginWithGoogle()`.

Dlatego interceptor ma wczesny bypass:

```ts
const errorPath = error.config?.url?.split('?')[0] ?? '';
if (errorPath.endsWith('/auth/google')) {
  return Promise.reject(error);
}
```

Błąd trafia więc bezpośrednio do `try/catch` w `authorizationStore.loginWithGoogle()`, gdzie
rozróżniane jest `400` vs pozostałe statusy.

Z tego samego powodu `/v1/auth/google` jest też dopisany do listy ścieżek w request
interceptorze, które **pomijają nagłówek `Authorization`** (obok `/login`, `/refresh`,
`/v1/auth/test`) — logowanie Google nie powinno wysyłać (potencjalnie wygasłego) tokenu z
poprzedniej sesji.

## 5. Dlaczego jest wspólny `withEc2AndLogin()` w `LoginView.vue`

Backend logowania Google działa na tym samym serwerze EC2 co zwykłe logowanie — więc przed
wywołaniem `loginWithGoogle()` trzeba tak samo "obudzić" instancję (`useEc2Control`) i pokazać
te same fazy (`checking` / `starting` / `waiting` / `waiting_app` / `logging_in`). Zamiast
duplikować tę logikę, `login()` i `handleGoogleCredential()` różnią się tylko funkcją przekazaną
do wspólnego `withEc2AndLogin(performLogin)`.

## 6. Google Identity Services — szczegóły `useGoogleSignIn`

- Skrypt (`https://accounts.google.com/gsi/client`) ładowany jest raz, leniwie, dopiero przy
  pierwszym wywołaniu `renderButton()` — nie ma go na stałe w `index.html`, bo logowanie Google
  to jedyne miejsce, gdzie jest potrzebny. `scriptPromise` na poziomie modułu zapobiega
  wielokrotnemu dodaniu `<script>` przy kolejnych mountach `LoginView`.
- Typy `Window.google` są zdefiniowane lokalnie w composable (minimalny wycinek API GIS, którego
  faktycznie używamy) — biblioteka nie ma oficjalnych typów ani paczki w `package.json`, więc nie
  jest to zależność, tylko skrypt ładowany z CDN Google w runtime.
- `GOOGLE_CLIENT_ID` w `src/config/google.ts` jest publiczny (identyfikator OAuth, nie sekret) —
  bezpieczny do trzymania wprost w kodzie frontu, tak jak przy standardowej integracji Google
  Identity Services.

## 7. Powiązane pliki

| Plik | Rola |
|---|---|
| `src/config/google.ts` | `GOOGLE_CLIENT_ID` |
| `src/composables/useGoogleSignIn.ts` | Ładowanie GIS + render przycisku, typy `Window.google` |
| `src/stores/authorization.ts` | `loginWithGoogle()` — obok `login()`, ten sam `logUser()` |
| `src/config/http-common.ts` | Wyjątki `/v1/auth/google` w request/response interceptorze |
| `src/views/LoginView.vue` | Render przycisku, `withEc2AndLogin()`, `handleGoogleCredential()` |
