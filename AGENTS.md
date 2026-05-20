<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:image-generation-rules -->
# Image Generation

When you need to generate images (avatars, OG cards, hero visuals, icons, backgrounds, etc.) for this project, **always** use the `imagenew.sh` script located at the project root. Do NOT use placeholder images or external image generation tools.

## Usage
```bash
bash imagenew.sh "PROMPT" [options]
```

## Options
| Flag | Description | Default |
|---|---|---|
| `-r, --ratio` | Aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`, `5:4`, `4:5`, `21:9`, `1:4`, `4:1`, `1:8`, `8:1` | `auto` |
| `-s, --size` | Resolution: `512`, `1K`, `2K`, `4K` | `1K` |
| `-o, --output` | Output file path | `generated_image.png` |
| `-i, --input` | Input image for editing/transforming | — |

## Rules
1. **Always save to `public/`** — e.g. `public/og-image.png`, `public/avatars/name.png`
2. **Create directories first** — `mkdir -p public/avatars` before generating into subdirectories
3. **Use descriptive prompts** — include style keywords like "glassmorphism, dark mode, premium, cinematic" to match the project aesthetic
4. **Pick correct aspect ratios** — OG images: `3:2`, avatars: `1:1`, hero banners: `16:9`
5. **Never use `2:1` ratio** — it's not supported; use `3:2` instead
<!-- END:image-generation-rules -->

<!-- BEGIN:project-rules -->
# Project: VoiceCloser AI

AI-powered voice receptionist SaaS for small businesses. Built with Next.js 16, Tailwind v4, Framer Motion, Supabase, and Stripe.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack) — port `3005`
- **Styling:** Tailwind CSS v4 with `@tailwindcss/postcss`
- **Animations:** Framer Motion
- **Auth & DB:** Supabase (`@supabase/ssr` for cookie-based auth)
- **Payments:** Stripe (Checkout, Billing Portal, Webhooks)
- **Icons:** Lucide React
- **Fonts:** Outfit + Geist Mono (Google Fonts)

## Code Quality Rules

### Keep Code Short
- Write concise, DRY code. No verbose boilerplate.
- Extract repeated patterns into shared utilities or components.
- Prefer composition over duplication.

### No Redundant Code
- **Never leave dead code, unused imports, or commented-out blocks.**
- Remove old code when replacing with new implementations.
- If a function/component is no longer used, delete it immediately.
- Don't keep "just in case" code — version control handles that.

### General
- Use TypeScript strict mode. No `any` types unless truly unavoidable.
- Prefer `const` over `let`. Never use `var`.
- Use early returns to reduce nesting.
- Keep components focused — one responsibility per file.

## Project Structure
```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── (auth)/           # Auth route group (login, signup)
│   ├── actions/          # Server actions (auth.ts)
│   ├── api/stripe/       # Stripe API routes (checkout, portal, webhook)
│   ├── auth/callback/    # OAuth callback handler
│   ├── dashboard/        # Protected dashboard
│   ├── demo/             # Voice demo pages
│   └── pricing/          # Pricing page
├── components/
│   ├── landing/          # Landing page sections (Navbar, Hero, etc.)
│   └── ui/               # Reusable UI components (GlowOrb, etc.)
├── lib/
│   ├── supabase/         # Supabase clients (client.ts, server.ts, middleware.ts)
│   ├── stripe.ts         # Stripe instance + price IDs
│   ├── prompts.ts        # Demo scenario data
│   └── utils.ts          # Utility functions (cn)
└── proxy.ts              # Next.js 16 proxy (auth session refresh)
```

## Design System
- **Theme:** Dark mode, glassmorphism, indigo-purple gradient accents
- **Background:** `#050510` (deep slate)
- **Brand colors:** `brand-indigo`, `brand-purple`, `brand-violet`, `brand-cyan`
- **CSS classes:** Use `glass`, `glass-strong`, `gradient-text`, `border-glow`, `bg-grid`, `bg-dots` from `globals.css`
- **Animations:** Use existing keyframes (`float`, `pulse-glow`, `shimmer`, `fade-up`, etc.) — don't create new ones unless necessary

## Auth Flow
- Browser client: `lib/supabase/client.ts`
- Server client: `lib/supabase/server.ts` (async `cookies()`)
- Proxy refreshes session on every request via `proxy.ts`
- Server actions in `app/actions/auth.ts` handle signup, login, OAuth, signout
- Protected routes: `/dashboard` (redirect to `/login` if unauthenticated)

## Conventions
- **Next.js 16 uses `proxy.ts`** instead of deprecated `middleware.ts`
- Dev server runs on **port 3005** (`NEXT_PUBLIC_APP_URL=http://localhost:3005`)
- `useSearchParams()` must be wrapped in `<Suspense>`
- Stripe webhook uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- Database schema lives in `supabase/schema.sql`
<!-- END:project-rules -->
