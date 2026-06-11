# Supabase Integration — Complete Reference

## 1. Project Info

| Key | Value |
|-----|-------|
| Project Ref | `vyycfwgkawtqkjllvsuc` |
| URL | `https://vyycfwgkawtqkjllvsuc.supabase.co` |
| Dashboard | `https://supabase.com/dashboard/project/vyycfwgkawtqkjllvsuc` |
| Region | Check dashboard → Settings → General |
| Framework | Vite 4.4 + React 18.2 + TypeScript |
| Deployed on | Vercel (SPA) |

## 2. Keys & Environment

### Keys (from Supabase Dashboard → Settings → API)

| Key | Purpose | Where Used |
|-----|---------|-----------|
| `anon` (public) | Client-side requests, respects RLS | `.env.local` → `VITE_SUPABASE_ANON_KEY` |
| `service_role` (secret) | Server-side, bypasses RLS | **Never** expose to client. Admin API only. |

### Environment Files

```
.env.local          # Local dev (gitignored!)
  VITE_SUPABASE_URL=https://vyycfwgkawtqkjllvsuc.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...

.env.production     # Production (committed)
  VITE_EMBED_BASE_URL=https://1calendar-widget-aliias-projects-37358320.vercel.app
```

**For production deployment (Vercel):**
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel → Project → Settings → Environment Variables.

## 3. Authentication

### 3.1 Providers

| Provider | Status | How It Works |
|----------|--------|-------------|
| **Email/Password** | Working | `supabase.auth.signUp()` / `signInWithPassword()`. Email confirmation is auto (no manual confirm needed). |
| **Google OAuth** | Needs setup | See Section 3.3 below |
| **Guest (access code)** | Working | Client-side only. Code `PEACHY2026`. Stored in `localStorage`. No Supabase session. |

### 3.2 Email/Password Flow

**Registration:**
```
User fills form → auth.register(name, email, password)
  → supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
  → Supabase creates user in auth.users
  → onAuthStateChange fires → AuthContext updates → mode = 'registered'
  → navigate('/studio')
```

**Login:**
```
User fills form → auth.login(email, password)
  → supabase.auth.signInWithPassword({ email, password })
  → Returns JWT session
  → onAuthStateChange fires → AuthContext updates
  → navigate('/studio')
```

**Session persistence:**
- Supabase stores JWT in `localStorage` automatically
- On page reload: `supabase.auth.getSession()` restores session
- `onAuthStateChange` listener keeps state in sync

**Logout:**
```
auth.logout() → supabase.auth.signOut() → clears session → mode = null
```

### 3.3 Google OAuth Setup (TODO)

**Step 1: Google Cloud Console**
1. Go to https://console.cloud.google.com/
2. Select or create project
3. APIs & Services → Credentials → Create Credentials → OAuth Client ID
4. Application type: **Web application**
5. Authorized JavaScript origins: `http://localhost:5173`, `https://your-production-url.vercel.app`
6. Authorized redirect URIs: `https://vyycfwgkawtqkjllvsuc.supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**

**Step 2: Supabase Dashboard**
1. Go to https://supabase.com/dashboard/project/vyycfwgkawtqkjllvsuc/auth/providers
2. Find **Google** → Enable
3. Paste Client ID and Client Secret
4. Save

**Step 3: URL Configuration**
1. Go to https://supabase.com/dashboard/project/vyycfwgkawtqkjllvsuc/auth/url-configuration
2. Site URL: `http://localhost:5173` (dev) or production URL
3. Redirect URLs: add both:
   - `http://localhost:5173/studio`
   - `https://your-production-url.vercel.app/studio`

**Step 4: Code (already done)**
The `loginWithGoogle()` method in AuthContext calls:
```typescript
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin + '/studio' }
})
```

### 3.4 Guest Mode (Access Code)

- No Supabase involved
- Code: `PEACHY2026` (hardcoded in `AuthContext.tsx` → `GUEST_CODE`)
- Stored as `localStorage.setItem('peachy_guest', 'true')`
- Provides Studio access without account features
- Cleared on logout or when user signs in with Supabase

### 3.5 Auth Context API

**File:** `src/presentation/context/AuthContext.tsx`

```typescript
interface AuthContextType {
  mode: 'guest' | 'registered' | null;
  user: { name: string; email: string; avatarUrl?: string } | null;
  supabaseUser: User | null;           // Raw Supabase user object
  isLoggedIn: boolean;                  // mode !== null
  isGuest: boolean;                     // mode === 'guest'
  isRegistered: boolean;                // mode === 'registered'
  loading: boolean;                     // True during initial session check
  loginWithCode: (code: string) => boolean;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}
```

## 4. Database

### 4.1 Table: `widgets`

**Migration file:** `supabase/migrations/001_widgets.sql`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | uuid | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | — | FK → `auth.users(id)`, CASCADE delete |
| `name` | text | `'Untitled Widget'` | User-given name |
| `type` | text | — | `'calendar'`, `'clock'`, `'board'` |
| `style` | text | — | Style ID (e.g. `'modern-grid-zoom-fixed'`) |
| `settings` | jsonb | `'{}'` | All widget settings (colors, sizes, etc) |
| `embed_url` | text | null | Generated embed URL |
| `created_at` | timestamptz | `now()` | Creation timestamp |
| `updated_at` | timestamptz | `now()` | Last update timestamp |

### 4.2 Row Level Security (RLS)

**Enabled.** Four policies — users can only access rows where `auth.uid() = user_id`:

| Policy | Operation |
|--------|-----------|
| "Users can view own widgets" | SELECT |
| "Users can insert own widgets" | INSERT |
| "Users can update own widgets" | UPDATE |
| "Users can delete own widgets" | DELETE |

**Index:** `idx_widgets_user_id` on `user_id` for fast lookups.

### 4.3 WidgetStorageService API

**File:** `src/infrastructure/services/WidgetStorageService.ts`

```typescript
WidgetStorageService.getUserWidgets()
// Returns all widgets for current authenticated user
// → SELECT * FROM widgets WHERE user_id = auth.uid() ORDER BY updated_at DESC

WidgetStorageService.saveWidget({ name, type, style, settings, embed_url? })
// Creates new widget for current user
// → INSERT INTO widgets (...) VALUES (...)

WidgetStorageService.updateWidget(id, { name?, settings?, embed_url? })
// Updates existing widget
// → UPDATE widgets SET ... WHERE id = $id AND user_id = auth.uid()

WidgetStorageService.deleteWidget(id)
// Deletes widget
// → DELETE FROM widgets WHERE id = $id AND user_id = auth.uid()
```

## 5. Code Architecture

```
src/
├── infrastructure/
│   └── services/
│       ├── supabase.ts              # createClient(url, anonKey)
│       ├── WidgetStorageService.ts   # CRUD for widgets table
│       └── Logger.ts                # Dev-only logging
├── presentation/
│   ├── context/
│   │   ├── AuthContext.tsx           # Supabase Auth + guest mode
│   │   └── CartContext.tsx           # Shopping cart (client-side)
│   ├── pages/
│   │   ├── LoginPage.tsx            # Email/pw + Google sign in/up
│   │   ├── CheckoutPage.tsx         # Cart → payment
│   │   ├── TemplateDetailPage.tsx   # Product page with Buy Now
│   │   ├── StudioPage.tsx           # Widget editor + dashboard views
│   │   └── ...
│   ├── components/
│   │   ├── ui/sidebar/Sidebar.tsx   # Account section (registered only)
│   │   └── dashboard/
│   │       └── DashboardViews.tsx   # My Widgets, Purchases, Profile views
│   └── data/
│       └── templates.ts             # Template catalog data
└── App.tsx                          # AuthProvider → CartProvider → Router
```

### Provider Hierarchy in App.tsx

```tsx
<ErrorBoundary>
  <ThemeProvider>
    <AuthProvider>        ← Supabase session listener
      <CartProvider>      ← Client-side cart state
        <Router>
          <Routes />
        </Router>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
</ErrorBoundary>
```

## 6. Troubleshooting

### Auth Issues

| Problem | Solution |
|---------|----------|
| "Email not confirmed" | Supabase Dashboard → Auth → Settings → disable "Confirm email" |
| "Invalid login credentials" | Check email/password, check user exists in Auth → Users |
| Google OAuth redirect fails | Check redirect URI matches exactly in Google Console + Supabase |
| Session lost on refresh | Check `supabase.auth.getSession()` runs in `useEffect` |
| Guest mode persists after login | `onAuthStateChange` clears guest flag when Supabase session appears |
| **`ERR_NAME_NOT_RESOLVED` / "This site can't be reached" on `*.supabase.co`** (Google login, email login AND widget saving all break at once) | **Project auto-paused** — free-tier Supabase pauses after ~7 days idle and drops its DNS. Not a code bug. **Restore it** (see §9). This is NOT a Google-specific issue — the whole backend is down; Google is just usually noticed first. |

### Database Issues

| Problem | Solution |
|---------|----------|
| "permission denied for table widgets" | Check RLS policies exist, check user is authenticated |
| Widgets not showing | Check `user_id` matches `auth.uid()`, check RLS policies |
| Insert fails silently | Check required fields (type, style), check user has valid session |

### Development

| Problem | Solution |
|---------|----------|
| Supabase env vars undefined | Restart dev server after creating `.env.local` |
| CORS errors | Supabase handles CORS for anon key automatically |
| Type errors after auth changes | Run `npm run typecheck` |

## 7. Current Status (2026-03-23)

| Feature | Status | Notes |
|---------|--------|-------|
| Supabase client | Done | `src/infrastructure/services/supabase.ts` |
| AuthContext (Supabase) | Done | Email/password + guest code working |
| `widgets` table + RLS | Done | Created via SQL Editor |
| WidgetStorageService | Done | CRUD operations |
| Save button in Studio | Done | Shows for registered users, saves to Supabase |
| My Widgets (real data) | Done | Loads from Supabase, delete works |
| Google OAuth | Code ready | Needs Google Cloud Console setup |
| Edit widget from My Widgets | Partial | Navigates to studio, doesn't load settings yet |
| Purchases (real) | Mock | Needs payment provider |

## 8. Future Considerations

- **Purchases table** — store completed orders with template_id, user_id, price, receipt
- **Widget templates** — pre-built widget configs users can duplicate
- **Real-time sync** — Supabase Realtime for collaborative editing
- **Storage** — Supabase Storage for user-uploaded images (boards)
- **Edge Functions** — Supabase Edge Functions for payment processing (Stripe webhooks)

## 9. Free-Tier Auto-Pause & Keep-Alive

**Free-tier Supabase projects pause after ~7 days with no API/DB activity.** A
paused project's `*.supabase.co` host stops resolving (`NXDOMAIN`), so the
browser shows **"This site can't be reached" / `ERR_NAME_NOT_RESOLVED`** the
moment any auth call or REST query fires. Symptoms look auth-specific (Google
login fails first) but the **entire backend is down** — email login and widget
saving break too. No code change fixes this; the project must be woken up.

### 9.1 Diagnose

```bash
# NXDOMAIN here = project is paused or deleted (not a network/firewall issue
# as long as `host supabase.com` resolves fine)
host vyycfwgkawtqkjllvsuc.supabase.co

# Confirm via Management API (uses the token the Supabase CLI stored in the
# macOS keychain under service "Supabase CLI"). STATUS=INACTIVE => paused.
RAW=$(security find-generic-password -s "Supabase CLI" -w)
TOKEN=$(echo "${RAW#go-keyring-base64:}" | base64 -d)
curl -s -H "Authorization: Bearer $TOKEN" https://api.supabase.com/v1/projects \
  | python3 -c "import sys,json;[print(p['name'],p['id'],p['status']) for p in json.load(sys.stdin)]"
```

If the project still shows in the list it's **paused** (restorable). If it's
gone entirely it was **deleted** → create a new project and update
`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env.local` and Vercel, then
re-run migrations (`npx supabase db push`) and re-configure Google OAuth.

### 9.2 Restore a paused project

**Option A — Dashboard (normal path):** open
`https://supabase.com/dashboard/project/vyycfwgkawtqkjllvsuc` → click
**Restore / Resume project**. DNS comes back in ~2–5 min.

**Option B — Management API (what we used June 2026):**
```bash
RAW=$(security find-generic-password -s "Supabase CLI" -w)
TOKEN=$(echo "${RAW#go-keyring-base64:}" | base64 -d)
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  https://api.supabase.com/v1/projects/vyycfwgkawtqkjllvsuc/restore -d '{}'   # → HTTP 200
```

**Verify it's live** (200 on both = ready; auth provider check is a bonus):
```bash
KEY=$(grep '^VITE_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2-)
curl -s -o /dev/null -w "REST %{http_code}\n" -H "apikey: $KEY" \
  "https://vyycfwgkawtqkjllvsuc.supabase.co/rest/v1/widgets?select=id&limit=1"
curl -s -o /dev/null -w "AUTH %{http_code}\n" -H "apikey: $KEY" \
  "https://vyycfwgkawtqkjllvsuc.supabase.co/auth/v1/settings"
```

### 9.3 Prevention — GitHub Actions keep-alive

To stop the project pausing in the first place, a scheduled workflow makes one
tiny REST query per day so Supabase always sees recent activity.

- **File:** `.github/workflows/supabase-keepalive.yml` (committed on `main`)
- **Schedule:** daily `0 6 * * *` UTC, plus manual `workflow_dispatch`
- **What it does:** `GET /rest/v1/widgets?select=id&limit=1` with the anon key
- **Secret:** `SUPABASE_ANON_KEY` (repo → Settings → Secrets and variables →
  Actions). It's the public anon key, but stored as a secret so key rotation
  doesn't need a code edit.

⚠️ **Must live on the default branch (`main`)** — GitHub only fires `schedule`
triggers from the default branch. A copy on a feature branch never runs.

**Why GitHub Actions (not Vercel Cron / pg_cron):** runs on GitHub's infra so
it works with every dev machine off; Vercel Hobby cron is max once/day and needs
a serverless function (this is a pure Vite SPA); `pg_cron` runs inside the DB so
a paused project can't keep itself alive.

**If the project/key ever changes:** update the `SUPABASE_ANON_KEY` repo secret
and the hardcoded `SUPABASE_URL` inside the workflow file.
