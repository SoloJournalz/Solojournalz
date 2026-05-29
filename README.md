# SoloJournalz

SoloJournalz is a premium trading journal SaaS built for traders who want a simple, focused, and actionable way to review performance, track execution, and improve consistency.

The platform is designed around a clean workspace experience with a Free plan for developing traders and an Expert plan for traders who want deeper insights and analytics.

---

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Stripe
- Vercel

---

# Current Features

## Authentication

- Secure sign in
- Secure sign up
- Protected workspace routes
- First-time user onboarding flow

## Plans

### Free

- 30 trades per month
- Basic journaling
- Core dashboard access

### Expert

- Unlimited trades
- Advanced analytics
- Performance insights
- Environment tracking
- Consistency intelligence
- Psychology tools
- Full workspace access

---

# Workspace

## Dashboard

- Trading statistics
- Equity curve
- Performance overview
- Expert feature previews
- Upgrade prompts

## Trade Log

- Trade journaling
- Screenshot uploads
- Environment tracking
- Psychology tracking
- Trade management

## Storage

- Historical trade archive
- Screenshot management
- Trade review workflow

## Settings

- Profile management
- Subscription management
- Billing overview
- Plan information
- Environment customization

---

# Stripe Billing System

Implemented and working:

- Stripe Checkout
- Stripe Billing Portal
- Subscription upgrades
- Subscription cancellations
- Webhook synchronization
- Subscription period tracking
- Duplicate subscription protection

Current flow:

1. User selects Expert
2. Stripe Checkout opens
3. Successful payment upgrades account
4. Webhook updates subscription state
5. User receives Expert access
6. Billing Portal manages subscription lifecycle

---

# UX Improvements Completed

Recent improvements:

- Persistent workspace navbar
- Workspace loading screens
- Instant navigation highlighting
- Improved route transitions
- Select Plan page polish
- Improved pricing card layout
- Better onboarding experience

---

# Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# Environment Variables

Required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_STRIPE_PRICE_EXPERT=
NEXT_PUBLIC_SITE_URL=
```

---

# Upcoming Priorities

## Responsive Pass

Focus on:

- Dashboard
- Trade Log
- Storage
- Settings
- Homepage
- Select Plan

Target devices:

- Desktop
- Laptop
- iPad
- Tablet
- Mobile fallback

---

## Deployment

### Vercel

- Connect GitHub repository
- Configure environment variables
- Deploy production build
- Resolve build issues

### Domain

- Connect purchased domain
- Configure DNS
- Verify SSL

---

## Stripe Production Migration

- Replace test keys with live keys
- Create live Expert product
- Configure production webhook
- Verify Billing Portal
- Test live subscription lifecycle

---

## Launch Preparation

- Privacy Policy
- Terms of Service
- Final Free plan testing
- Final Expert plan testing
- Cancellation testing
- Production QA

---

# Launch Criteria

Before launch:

- User can sign up
- User can choose Free or Expert
- Free limits work correctly
- Expert upgrades work correctly
- Billing Portal works correctly
- Cancellations work correctly
- Subscription syncing works correctly
- Responsive layouts completed
- Production deployment stable
- Domain connected
- SSL active

---

# Project Status

Current Status:

✅ Core SaaS Complete

Current Focus:

➡ Responsive Design Pass  
➡ Vercel Deployment  
➡ Domain Setup  
➡ Live Stripe Configuration  
➡ Launch Preparation

---

Built with Next.js, Supabase and Stripe.
## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
