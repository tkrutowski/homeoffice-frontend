# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**homeoffice-frontend** is a Vue 3 + TypeScript + Vite application serving as a personal management dashboard with these modules:
- **Finance** — loans, fees, banks, cards, payments, purchases, transactions (vertical slices + TanStack Query)
- **Library** — books, series, authors, bookstores, reading statistics (vertical slices + TanStack Query)
- **Device** — devices catalog, computers, dashboard (vertical slices + TanStack Query)
- **Share** — shared data (firms, company lookup) — still Pinia + `src/views/share`
- **Admin** — privileges, activity logs — still Pinia + `src/views`

## Quick Start

```bash
# Install dependencies
npm install

# Development server (watches for changes)
npm run dev

# Type check and build
npm run build

# Format code (Prettier)
npm run format

# Preview production build locally
npm run preview

# Build for Docker
npm run build:docker

# Component catalog (Storybook)
npm run storybook
npm run build-storybook
```

## Development Workflow

### Type Checking & Linting
- **TypeScript strict mode** enabled: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, etc.
- **ESLint** configured with Vue + TypeScript rules (see `eslint.config.ts`)
- **Prettier** for code formatting: 120 char line width, single quotes, 2-space tabs
  - Run `npm run format` before committing
  - **Windows line endings:** `.prettierrc.json` uses `endOfLine: "lf"` — ensure Git is configured with `core.autocrlf=false` or `input`

### Building
- `npm run build` runs **`vue-tsc -b`** (incremental type checking with build info) then Vite bundling
- Vite alias `@` resolves to `src/` (configured in `vite.config.ts`)

## Architecture

### Directory Structure
```
src/
├── features/
│   ├── library/          # Library vertical slices + TanStack Query
│   │   ├── _shared/      # Menu, queryKeys, cloneEntities, storybook/
│   │   ├── home/
│   │   ├── catalog/      # books, categories
│   │   ├── shelf/        # userbooks, statistics
│   │   ├── authors/
│   │   ├── series/
│   │   └── bookstores/
│   ├── finance/          # Finance vertical slices + TanStack Query
│   │   ├── _shared/      # Menu, queryKeys, cloneEntities, storybook/
│   │   ├── home/
│   │   ├── banks/
│   │   ├── cards/
│   │   ├── loans/
│   │   ├── fees/
│   │   ├── payments/
│   │   ├── purchases/
│   │   └── transactions/ # list, dashboard, CSV import UI store
│   └── device/           # Device vertical slices + TanStack Query
│       ├── _shared/      # Menu, queryKeys, cloneEntities, storybook/
│       ├── home/         # dashboard + useDeviceDashboard
│       ├── devices/      # list/grid/form
│       └── computers/    # assemble PCs from devices
├── components/           # Shared UI (buttons, dialogs, layout, home entry cards, …)
├── views/                # Auth, Admin, Share, MainHome (not Library/Finance/Device)
├── stores/               # Shared Pinia only (see below)
├── types/                # Cross-cutting types only (User, Firm, ActiveStatus, FileInfo, …)
├── composables/          # Cross-cutting only (e.g. useEc2Control — not module domain)
├── service/              # UtilsService, TranslationService, FileService, …
├── config/               # HTTP client, queryClient, colors, icons, form presets
├── assets/               # CSS, PrimeVue theme, images
├── router/               # Vue Router + auth guard
├── stories/utils/        # libraryStorybook, financeStorybook, deviceStorybook
└── main.ts               # App entry: Pinia → VueQueryPlugin → Router → PrimeVue
```

### Dual data-layer model

| Layer | Where | Use for |
|-------|--------|---------|
| **TanStack Query** | Library, Finance, Device | Server state: lists, details, mutations, cache, invalidation |
| **Pinia** | Shared + rare UI workflows | Auth, firms, users, files, audit, logs, companyLookup; Finance CSV import UI (`bankCsvImport.store.ts`) |

**Feature pattern (Library / Finance / Device):**
1. Thin HTTP in `features/<domain>/<slice>/api/*.ts` (Axios via `http-common`)
2. Query keys in `features/<domain>/_shared/queryKeys.ts` (`libraryKeys` / `financeKeys` / `deviceKeys`)
3. Hooks in `queries/use*Queries.ts` and `use*Mutations.ts`
4. Domain types in `features/<domain>/<slice>/types.ts` (or `dashboardTypes.ts`)
5. Views call hooks — **do not** put API lists in Pinia
6. After mutations: `invalidateQueries` on related keys (toasts stay in components)
7. Form drafts: clone Query data with `cloneEntities` helpers (readonly → mutable; dates / `Map`)

**Shared Pinia (keep here):**
- `authorization.ts`, `users.ts`, `firms.ts`, `files.ts`, `audit.ts`, `logs.ts`, `companyLookup.ts`
- Stores get `router` via Pinia plugin in `main.ts`
- **Do not** add new domain server-state stores under `src/stores/` for Library/Finance/Device

**UI-only Pinia exception:** `features/finance/transactions/bankCsvImport.store.ts` (import job status, row selection, dialog) — still invalidates Query after save.

### TanStack Query details
- Singleton: `src/config/queryClient.ts` (`staleTime: 60s`, `gcTime: 5m`, `retry: 1`)
- Registered in `main.ts` with `VueQueryPlugin`; Devtools in `App.vue` when `import.meta.env.DEV`
- `staleTime` marks data stale — it does **not** poll every 60s; refetch happens on remount/focus/invalidate
- Auth: `queryClient.clear()` on **login** and **logout** (not on token refresh) in `stores/authorization.ts`
- Bearer token stays in Axios interceptor — never put tokens in `queryKey`
- Prefetch dictionaries on module entry via `UtilsService`:
  - `getTypesForLibrary()` — bookstores
  - `getTypesForFinance()` — cards, transaction categories/labels (+ firms Pinia if empty)
  - `getTypesForDevice()` — devices list, device types, computers list

### Feature modules (slices)

**Library** — `features/library/`
```
catalog/     BooksView, BookView, NewBookDialog, BookFormFields, …
shelf/       Userbooks* views, Statistics, AddEditUserBookDialog, UserBook*
authors/     AuthorsView, BookSmall (authors copy)
series/      SeriesView, SeriesCarusel, SeriesBook, BookSmall (series copy)
bookstores/  BookstoresView
home/        LibraryHomeView
_shared/     TheMenuLibrary, queryKeys, cloneEntities, storybook/
```

**Finance** — `features/finance/`
```
banks/ cards/ loans/ fees/ payments/ purchases/ transactions/ home/
_shared/     TheMenuFinance, queryKeys, cloneEntities, storybook/
```
- CSV import: UI store in `transactions/bankCsvImport.store.ts`; HTTP in `api/csvImportApi.ts`
- Firms stay in Share (`useFirmsStore`) — Finance consumes them

**Device** — `features/device/`
```
devices/     DevicesListView, DevicesGridView, DeviceView, DeviceDetailsDialog
computers/   ComputersView, NewComputer, DeviceDetails, ComponentCategory, COMPONENT_TYPES
home/        DeviceHomeView, useDeviceDashboard, dashboard/*, dashboardTypes
_shared/     TheMenuDevice, queryKeys, cloneEntities, storybook/
```
- Files upload/download: shared `useFilesStore` + `FileUploadDialog` (not Device Query)
- Dashboard recent changes: shared `useAuditStore` (lists from Query; audit fetch from Pinia)

### Routing
- Defined in `src/router/index.ts`
- Auth guard prevents unauthenticated access (redirects to login)
- Navigation history tracked in `localStorage`
- Feature routes import from `@/features/library|finance|device/...`
- Admin / Share / auth still use `@/views/...`
- Device home path: `/homedevice` (not under `/devices/*`)

### Type System
- Strict TypeScript: target ES2020, ESNext modules
- Domain types: `features/<domain>/<slice>/types.ts`
- Shared cross-cutting: `src/types/` — e.g. `User`, `Firm`, `ActiveStatus`, `FileInfo`, `StatusType`, `Audit`, `CompanyLookup`
- Prefer `@/types/ActiveStatus` (not Finance cards) for ACTIVE/INACTIVE/ALL
- No `any` without justification
- Vue components use `<script setup lang="ts">` with inline type annotations

### HTTP Client
- Configured in `src/config/http-common.ts` (Axios)
- Environment-aware: `.env.development`, `.env.production`, `.env.docker`
- Feature `queryFn` / `mutationFn` call this client (or thin API wrappers around it)

### Storybook
- Config: `.storybook/main.ts`, `.storybook/preview.ts` (Pinia + VueQueryPlugin + PrimeVue + light/dark toolbar)
- Stories: `*.stories.ts` next to components (Shared UI + Library + Finance + Device)
- Fixtures: `features/<domain>/_shared/storybook/fixtures.ts`
- Helpers: `src/stories/utils/{library,finance,device}Storybook.ts` — mock auth + `queryClient.setQueryData`
- Library covers in Storybook use local `sample-cover.jpg` (S3 URLs may 403)

## UI & Styling

### Theme System
- **Switcher component** (`ThemeSwitcher.vue`) applies class `dark` or `light` to `<html>`
- Tailwind's `darkMode: ['selector', '[class="dark"]']` (see `tailwind.config.js`) activates `dark:` variants

### Color Palette: Prime Surface Tokens
Always use **Surface tokens** for consistent theming (light and dark):
- **Text:** `text-surface-600 dark:text-surface-400` (default), adjust tone per context
- **Background:** `bg-surface-0 dark:bg-surface-950` (cards), `bg-surface-100 dark:bg-surface-900` (sections)
- **Borders:** `border-surface-200 dark:border-surface-700` (default), `border-surface-300 dark:border-surface-600` (form inputs)
- **Focus/Accent:** Use `primary` for interactive elements (PrimeVue buttons, form focus)
- **Errors:** `text-red-600 dark:text-red-400`, `border-red-500 dark:border-red-400`
- Never hardcode colors like `#121212`, `#fff`, etc. — always account for both light and dark modes

### PrimeVue Styling
- **Preset:** integrated via `tailwindcss-primeui` and CSS imports in `src/assets/`
- **Pass-through (pt) prop:** preferred over `<style scoped>` with `:deep()` for theme consistency
  - Example: `<PButton pt={{ root: { class: 'bg-primary text-white dark:bg-primary-700' } }} />`
- If using scoped styles, apply `@apply` with Surface tokens and `dark:` variants, never hex colors

## Code Organization & Conventions

### Utilities & Services
- **`UtilsService`** (`src/service/UtilsService.ts`): centralized helper functions
  - Format currency, dates, account masking, deadline calculations
  - Prefetch helpers: `getTypesForLibrary` / `getTypesForFinance` / `getTypesForDevice`
  - Before writing a local helper (format, enum translation, etc.), check `UtilsService` first — reuse or extend
  - Add new shared utilities to `UtilsService`, not scattered across components
- **`TranslationService`** (`src/service/TranslationService.ts`): enum labels & translations
- Feature helpers under `features/<domain>/...` (e.g. audiobook availability, transaction enrichment)

### Component Patterns
- Use `<script setup>` with TypeScript
- Props are explicitly typed
- Emitted events typed (Vue 3.3+)
- Library / Finance / Device: server data via TanStack Query; UI-only local refs / rare Pinia UI stores
- Share / Admin: Pinia for shared/legacy server state
- Dialogs keep local open/draft state in the component unless a store is already established
- Prefer `pt` over scoped `:deep()` for PrimeVue theming

### Naming Conventions
- Components: PascalCase (e.g. `PaymentDialog.vue`, `UserBookSmall.vue`)
- Shared Pinia stores: camelCase with `use` prefix (e.g. `stores/firms.ts` → `useFirmsStore()`)
- Query hooks: `useBooksPageQuery`, `useCreateAuthorMutation`, `useDevicesListQuery`
- Types: PascalCase
- Routes: kebab-case paths (e.g. `/finance/loan/all`), PascalCase route names (e.g. `Loans`)

### TypeScript Strictness
- No implicit `any`; all function parameters and return types typed
- Unused variables/parameters flagged as errors
- Union types preferred over function overloading when feasible
- Use `null` for "no value" in types; distinguish from `undefined` if semantically important

## Cursor Rules

These rules in `.cursor/rules/` enforce project-specific practices:

1. **Language Rule** — Always respond in Polish
2. **UtilsService Rule** — Check `src/service/UtilsService.ts` before writing helper functions; extend it for shared utilities
3. **Theme & Surface Rule** — Use Prime Surface tokens for all colors; never hardcode hex values; always support light + dark modes with `dark:` variants; prefer `pt` prop over scoped styles

## Environment & Configuration

- **Dev server:** `npm run dev` starts on default Vite port (usually 5173)
- **Storybook:** `npm run storybook` → http://localhost:6006
- **Environment files:** `.env.development`, `.env.production`, `.env.docker` (configure backend URLs, API keys, etc.)
- **Build modes:**
  - `npm run build` → production (uses `.env.production`)
  - `npm run build:docker` → Docker build (uses `.env.docker`)
- **TypeScript build info** cached in `node_modules/.tmp/tsconfig.app.tsbuildinfo` — safe to delete if build cache is corrupted

## Common Tasks

- **Add Library/Finance/Device API/query:** `api/` + keys in `_shared/queryKeys.ts` + hooks in `queries/` + use in the view
- **Add a feature view:** under `features/<domain>/<slice>/`, register route to that file
- **Add Share/Admin view:** `src/views/...`, Pinia store in `src/stores/` if needed
- **Add a reusable shared component:** `src/components/ComponentName.vue` (+ optional `*.stories.ts`)
- **Add a utility function:** prefer `UtilsService` for cross-feature helpers
- **Storybook stub:** fixtures in feature `_shared/storybook/` + `setup*StorybookStores()` with `setQueryData`
- **Style a view:** Tailwind + Surface tokens; PrimeVue `pt` where possible
- **Format before commit:** `npm run format`

## Notes

- The app is fully in Polish (UI text, locale setup, Cursor rules)
- Git user is "Tomek" — commits attributed accordingly
- Version: 3.18.0 (see `package.json`)
- No unit/e2e test framework in app code; Storybook is the component catalog (not a full test suite)
- Do **not** reintroduce Pinia server-state for Library / Finance / Device; do **not** leave compatibility shims in `src/types` or `src/stores` for moved modules
- Share / Admin are **not** on TanStack Query yet — do not migrate them unless explicitly asked
- Router may log navigations (`console.log('ROUTE to: '...)`) — safe to remove if noise
