<![CDATA[<div align="center">

# 🎙️ VoiceCloser AI

### _Your AI-Powered Voice Receptionist — Never Miss a Customer Again_

[![Next.js](https://img.shields.io/badge/Next.js-16-000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Voice_AI-000?style=for-the-badge)](https://elevenlabs.io/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue?style=for-the-badge)](./LICENSE)

<br />

**VoiceCloser AI** is a browser-based conversational AI receptionist that talks to your customers naturally, qualifies leads, books appointments, and collects payments — all on autopilot, 24/7.

[Live Demo](#-demo) · [Features](#-features) · [Getting Started](#-getting-started) · [Architecture](#-architecture)

<br />

---

</div>

## 🧠 The Problem

Small businesses lose customers every day because they:

- ❌ Miss calls and inquiries after hours
- ❌ Reply too late to interested leads
- ❌ Can't afford 24/7 receptionists or trained sales staff
- ❌ Fail to qualify leads or collect deposits upfront
- ❌ Lack multilingual support for diverse customer bases

**VoiceCloser AI eliminates all of these problems** with a single, intelligent voice agent that works around the clock.

---

## ✨ Features

### 🗣️ AI Voice Receptionist

Real-time, natural voice conversations powered by **ElevenLabs Conversational AI**. Customers speak to your AI agent just like a real employee — it answers questions, understands intent, and guides them through your workflow.

### 🎯 Intelligent Lead Qualification

The AI asks smart follow-up questions about urgency, budget, service type, and preferences — then scores and categorizes leads automatically so you focus on the ones that matter.

### 📅 Automated Appointment Booking

Checks available slots and books appointments in real time. No back-and-forth emails, no missed opportunities.

### 💳 Stripe Payment Collection

Seamless deposit and fee collection via **Stripe Checkout**. The AI confirms the appointment and triggers a secure payment link — all within the conversation flow.

### 📊 CRM Dashboard

A beautiful, glassmorphism-themed dashboard where business owners can see:

- Live & past conversations with AI summaries
- Lead pipeline with qualification scores
- Appointment calendar & booking status
- Revenue analytics & conversion metrics
- Agent management & configuration

### 🤖 Custom AI Agents

Create and configure multiple AI agents with different personalities, voice profiles, and business contexts. Each agent gets its own demo page and can be tailored for specific use cases.

### 🌐 Multi-Industry Ready

While our primary demo targets **dental clinics**, the platform is fully configurable for any service business — salons, law firms, real estate, healthcare, and more.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript 5](https://typescriptlang.org/) (strict mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + custom glassmorphism system |
| **Animations** | [Framer Motion](https://motion.dev/) |
| **Auth & Database** | [Supabase](https://supabase.com/) (cookie-based SSR auth) |
| **Payments** | [Stripe](https://stripe.com/) (Checkout, Billing, Customer Portal) |
| **Voice AI** | [ElevenLabs](https://elevenlabs.io/) (Conversational AI, real-time voice) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Fonts** | Outfit + Geist Mono (Google Fonts) |
| **Hosting** | [Vercel](https://vercel.com/) + Supabase Cloud |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
│                                                         │
│   Landing Page ──► Auth (Login/Signup) ──► Dashboard    │
│        │                                      │         │
│   Voice Demo                            Agent Config    │
│        │                                Leads / Calls   │
│        ▼                               Analytics        │
│   ElevenLabs                           Appointments     │
│   Voice Agent                          Settings         │
│        │                                      │         │
│        └──────────┬───────────────────────────┘         │
└───────────────────┼─────────────────────────────────────┘
                    │
        ┌───────────▼───────────┐
        │    Next.js 16 API     │
        │    (App Router)       │
        │                       │
        │  ┌─────────────────┐  │
        │  │  Server Actions  │  │
        │  │  API Routes      │  │
        │  │  Proxy (Auth)    │  │
        │  └────────┬────────┘  │
        └───────────┼───────────┘
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
┌─────────┐  ┌───────────┐  ┌──────────┐
│ Supabase│  │  Stripe   │  │ElevenLabs│
│ Auth+DB │  │ Payments  │  │ Voice AI │
└─────────┘  └───────────┘  └──────────┘
```

---

## 📂 Project Structure

```
voicecloser-ai/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (login, signup)
│   │   ├── actions/                  # Server actions (auth.ts)
│   │   ├── admin/                    # Admin panel
│   │   ├── api/stripe/               # Stripe API routes (checkout, portal, webhook)
│   │   ├── auth/callback/            # OAuth callback handler
│   │   ├── dashboard/                # Protected dashboard
│   │   │   ├── agents/               # AI agent management (CRUD + demo)
│   │   │   ├── analytics/            # Business analytics
│   │   │   ├── appointments/         # Appointment management
│   │   │   ├── calls/                # Call history
│   │   │   ├── leads/                # Lead pipeline
│   │   │   └── settings/             # Account settings
│   │   ├── demo/                     # Public voice demo
│   │   └── pricing/                  # Pricing page
│   ├── components/
│   │   ├── dashboard/                # Dashboard UI (Sidebar, StatsCard)
│   │   ├── landing/                  # Landing sections (Hero, Features, CTA, etc.)
│   │   └── ui/                       # Reusable UI components
│   └── lib/
│       ├── supabase/                 # Supabase clients (client, server, middleware)
│       ├── stripe.ts                 # Stripe config + price IDs
│       ├── prompts.ts                # AI agent scenario data
│       └── utils.ts                  # Utility functions
├── supabase/                         # Database schema (SQL migrations)
├── public/                           # Static assets
├── proxy.ts                          # Next.js 16 auth session proxy
├── .env.example                      # Environment variable template
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** (recommended) or npm
- A [Supabase](https://supabase.com/) project
- A [Stripe](https://stripe.com/) account
- An [ElevenLabs](https://elevenlabs.io/) API key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/voicecloser-ai.git
cd voicecloser-ai
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs (Monthly)
STRIPE_STARTER_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_AGENCY_MONTHLY_PRICE_ID=price_xxx

# Stripe Price IDs (Yearly)
STRIPE_STARTER_YEARLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_AGENCY_YEARLY_PRICE_ID=price_xxx

# ElevenLabs
ELEVENLABS_API_KEY=xxx
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3005
```

### 4. Set up the database

Run the SQL schema against your Supabase project:

```bash
# Apply the schema via Supabase Dashboard → SQL Editor
# Or use the Supabase CLI:
supabase db push
```

The schema files are located in the `supabase/` directory.

### 5. Run the development server

```bash
pnpm dev
```

The app will be available at **[http://localhost:3005](http://localhost:3005)**.

### 6. Set up Stripe webhooks (for local development)

```bash
stripe listen --forward-to localhost:3005/api/stripe/webhook
```

---

## 🎨 Design System

VoiceCloser AI uses a **dark-mode-first glassmorphism** design language:

| Token | Value |
|---|---|
| Background | `#050510` (deep slate) |
| Glass panels | `glass`, `glass-strong` CSS classes |
| Brand gradient | Indigo → Purple → Violet → Cyan |
| Text gradient | `gradient-text` utility class |
| Animations | `float`, `pulse-glow`, `shimmer`, `fade-up` keyframes |
| Borders | `border-glow` for interactive elements |
| Patterns | `bg-grid`, `bg-dots` background textures |

---

## 💰 Pricing Tiers

| | Starter | Pro | Agency |
|---|:---:|:---:|:---:|
| **Monthly** | ₹1,999 | ₹5,999 | ₹14,999 |
| AI Conversations | 100 | Unlimited | Unlimited |
| Appointment Booking | ✅ | ✅ | ✅ |
| Payment Collection | ✅ | ✅ | ✅ |
| Analytics | — | ✅ | ✅ |
| Multilingual AI | — | ✅ | ✅ |
| White-label | — | — | ✅ |
| Multi-business | — | — | ✅ |

---

## 🔐 Auth Flow

1. **Browser client** → `lib/supabase/client.ts`
2. **Server client** → `lib/supabase/server.ts` (async cookies)
3. **Session refresh** → `proxy.ts` runs on every request (Next.js 16 pattern)
4. **Server Actions** → `app/actions/auth.ts` handles signup, login, OAuth, signout
5. **Protected routes** → `/dashboard` redirects unauthenticated users to `/login`

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to:
- Follow TypeScript strict mode (no `any` types)
- Use the existing design system classes
- Write concise, DRY code
- Remove unused imports and dead code

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the future of small business communication**

<br />

_VoiceCloser AI — Talk less, close more._

</div>
]]>
