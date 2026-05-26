# React TypeScript Vite Boilerplate

Production-ready React SPA with auth, RBAC guards, and shadcn/ui.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix UI primitives) |
| Routing | React Router DOM v7 (lazy-loaded pages) |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| HTTP | Axios with silent refresh interceptor |
| Forms | react-hook-form + Zod |
| Linting | ESLint + Prettier (enforced via lint-staged + Husky pre-commit) |

## Project Structure

```
src/
├── api/
│   ├── client.ts        # Axios instance + 401 silent-refresh interceptor
│   ├── endpoints.ts     # All API endpoint strings (single source of truth)
│   └── auth.api.ts      # Auth API functions (add feature-specific *.api.ts files here)
├── components/
│   ├── ui/              # shadcn/ui generated components (do not hand-edit)
│   └── common/          # Shared custom components
├── features/            # Feature-based modules (see structure below)
├── hooks/               # Global shared hooks
├── layouts/             # AuthLayout, DashboardLayout
├── lib/
│   ├── queryClient.ts   # TanStack Query client config
│   └── utils.ts         # cn() helper (clsx + tailwind-merge)
├── pages/               # Route-level page components (thin wrappers)
├── providers/
│   └── AppProviders.tsx # ThemeProvider + QueryClientProvider
├── router/
│   ├── index.tsx        # createBrowserRouter config
│   ├── ProtectedRoute.tsx  # Redirects unauthenticated to /login
│   └── RoleGuard.tsx       # Redirects unauthorized roles to /unauthorized
├── store/
│   └── auth.store.ts    # Zustand auth store
├── types/
│   ├── api.types.ts     # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   └── auth.types.ts    # User, AuthState, LoginPayload, RegisterPayload
└── config/
    └── env.ts           # Typed env vars (VITE_* prefix)
```

## Feature Module Structure

All features live in `src/features/<feature-name>/` and follow this internal structure:

```
src/features/auth/
├── components/          # Feature-specific React components
├── hooks/               # TanStack Query mutations/queries (useLogin, useRegister, etc.)
├── schemas/             # Zod schemas for form validation
└── types.ts             # Feature-specific TypeScript types (inferred from schemas)
```

Keep feature code inside the feature folder. Only promote to `src/` level when genuinely shared.

## Routing

Defined in `src/router/index.tsx`. All pages are lazy-loaded via `React.lazy()` + `<Suspense>`.

Route protection layers:
- **`ProtectedRoute`** — wraps routes that require authentication. Reads `isAuthenticated` from Zustand; redirects to `/login` if false.
- **`RoleGuard`** — wraps routes that require specific roles. Reads `user.role` from Zustand; redirects to `/unauthorized` if role not allowed.

Route order matters — `ProtectedRoute` wraps `RoleGuard` wraps the actual page.

## Auth Flow

- **Access token**: short-lived JWT stored in `localStorage` under key `accessToken`
- **Refresh token**: httpOnly cookie set by the backend — never accessible from JS
- **Silent refresh**: Axios response interceptor in `src/api/client.ts` catches 401s, calls `GET /auth/refresh` (uses cookie automatically), updates the token, and retries the original request. Queues concurrent 401s during refresh to avoid race conditions.
- On refresh failure: clears `localStorage`, redirects to `/login`

The Zustand store (`src/store/auth.store.ts`) is the single source of truth for auth state:
- `setToken(token)` — stores in localStorage + updates store
- `setUser(user)` — sets user object + marks authenticated
- `logout()` — clears localStorage + resets store

## API Layer Rules

- All endpoint strings go in `src/api/endpoints.ts` — never hardcode paths in components
- API functions (e.g. `loginUser`, `getMe`) return the typed response data, not the Axios response
- Always type responses with `ApiResponse<T>` from `src/types/api.types.ts`
- Add new endpoint groups as `src/api/<feature>.api.ts` files
- The Axios `client` in `src/api/client.ts` automatically attaches `Authorization: Bearer <token>` from localStorage

## Server State (TanStack Query)

Mutations and queries live in feature hooks (`src/features/<name>/hooks/`):

```ts
// Mutation pattern
export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }) => loginUser(email, password),
    onSuccess: (response) => { /* update Zustand store */ },
  });
}

// Query pattern
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getMe,
  });
}
```

Never call API functions directly in components — always go through hooks.

## Forms

Use react-hook-form + Zod for every form:

```ts
// 1. Define schema in features/<name>/schemas/
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

// 2. Infer type in features/<name>/types.ts
export type LoginFormData = z.infer<typeof loginSchema>;

// 3. Use in component
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
```

## UI Components

- `src/components/ui/` — shadcn/ui components. Add new ones with `npx shadcn add <component>`. Do not hand-edit generated files.
- `src/components/common/` — shared custom components used across features
- Use the `cn()` helper from `src/lib/utils.ts` for conditional class merging
- Path alias `@/` maps to `src/` — use it for all non-relative imports (`import { Button } from '@/components/ui/button'`)

## Styling Rules

- Tailwind utility classes only — no custom CSS files except `src/index.css` (global resets/fonts)
- Use shadcn design tokens (`bg-background`, `text-foreground`, `text-destructive`, etc.) for theme-aware colors
- Dark mode is supported via `next-themes` — always use semantic tokens, never hardcode colors like `bg-white`

## State Management

- **Server state** (API data, loading, errors) → TanStack Query
- **Client/UI state** (auth, theme, modals) → Zustand
- Do not put server data in Zustand — let TanStack Query own it

## TypeScript

- Shared API types in `src/types/api.types.ts` and `src/types/auth.types.ts`
- Feature-specific types in `src/features/<name>/types.ts`, inferred from Zod schemas where possible
- Never use `any` — use `unknown` and narrow it

## Adding a New Feature

1. Create `src/features/<name>/` with `components/`, `hooks/`, `schemas/`, `types.ts`
2. Add API endpoint strings to `src/api/endpoints.ts`
3. Create `src/api/<name>.api.ts` with typed API functions
4. Write hooks in `src/features/<name>/hooks/` using TanStack Query
5. Create page component in `src/pages/<Name>Page.tsx`
6. Register route in `src/router/index.tsx` (lazy-loaded, wrapped in appropriate guard)

## npm Scripts

```
npm run dev            # Vite dev server
npm run build          # TypeScript check + Vite production build
npm run lint           # ESLint (0 warnings allowed)
npm run lint:fix       # ESLint with auto-fix
npm run format         # Prettier format src/
npm run format:check   # Prettier check (used in CI)
npm run preview        # Preview production build locally
```

## Code Quality

- Husky pre-commit hook runs lint-staged: ESLint + Prettier on all staged `*.ts` / `*.tsx` files
- ESLint config enforces react-hooks rules and react-refresh rules
- `lint` script runs with `--max-warnings 0` — warnings are treated as errors

## Environment Variables

Vite exposes env vars prefixed with `VITE_`. Typed and accessed via `src/config/env.ts`:

```ts
// src/config/env.ts
export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
};
```

Required: `VITE_API_URL` (e.g. `http://localhost:3000/api`)
Copy `.env.example` to `.env.local` for local development.
