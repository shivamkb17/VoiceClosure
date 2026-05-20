VoiceCloser AI — Complete Hackathon Execution Plan

Project Name

VoiceCloser AI

One-Line Pitch

VoiceCloser AI is a browser-based AI receptionist that talks to customers naturally, qualifies leads, books appointments, and collects payments automatically using Stripe.

⸻

Core Problem

Small businesses lose customers because:

* they miss calls,
* reply late,
* cannot answer after business hours,
* fail to qualify leads properly,
* do not collect deposits before appointments.

Most businesses cannot afford:

* 24/7 receptionists,
* trained sales staff,
* multilingual support teams.

VoiceCloser AI solves this using conversational voice AI.

⸻

Product Vision

VoiceCloser AI acts like a real AI employee.

It:

* talks naturally,
* understands customer intent,
* qualifies leads,
* books appointments,
* collects deposits,
* updates CRM automatically,
* works 24/7.

⸻

Target Industry

Primary Demo Industry:

Dental Clinics

Reason:

* easy to understand,
* emotionally relatable,
* strong urgency,
* simple workflows,
* natural booking flow,
* perfect for Stripe deposits.

⸻

Core Features

1. AI Voice Receptionist

Customers talk naturally with AI through browser voice chat.

The AI:

* answers questions,
* understands symptoms,
* provides responses,
* guides customers.

⸻

2. Lead Qualification

AI asks intelligent follow-up questions:

* urgency,
* budget,
* appointment preference,
* service type.

⸻

3. Appointment Booking

AI checks available slots and books appointments automatically.

⸻

4. Payment Collection

AI asks for confirmation deposit.

Example:
“Your appointment can be confirmed with a ₹500 booking deposit.”

Stripe Checkout handles payment securely.

⸻

5. CRM Dashboard

Business owner sees:

* customer conversations,
* bookings,
* payments,
* AI summaries,
* analytics.

⸻

Tech Stack

Frontend

* Next.js
* TailwindCSS
* Framer Motion
* ShadCN UI

⸻

Backend

* Node.js
* Express or Hono
* Supabase
* Redis (optional)

⸻

AI & Voice

* ElevenLabs Conversational AI
* ElevenLabs Voice API
* Web Speech APIs (optional)

⸻

Payments

* Stripe Checkout
* Stripe Billing
* Stripe Customer Portal

⸻

Hosting

* Vercel
* Supabase Cloud

⸻

Product Architecture

User Side

Customer Flow

1. User opens dental clinic website
2. AI receptionist popup appears
3. User clicks microphone
4. AI starts real-time conversation
5. AI qualifies customer
6. AI books appointment
7. Stripe payment link appears
8. User pays deposit
9. Booking confirmed

⸻

Business Owner Side

Dashboard Features

* Total bookings
* Revenue collected
* Missed calls prevented
* Live conversations
* AI call summaries
* Lead management
* Appointment calendar

⸻

Database Schema

Businesses Table

* id
* business_name
* business_type
* voice_profile
* stripe_customer_id
* subscription_status

⸻

Leads Table

* id
* customer_name
* phone
* intent
* urgency
* summary
* sentiment
* status

⸻

Appointments Table

* id
* lead_id
* appointment_date
* payment_status
* deposit_amount

⸻

Conversations Table

* id
* lead_id
* transcript
* ai_summary
* duration

⸻

Stripe Integration Plan

1. Stripe Checkout

Purpose:

* booking deposits,
* consultation fees.

Flow:
AI asks customer for confirmation deposit.
Stripe Checkout opens.
Payment confirmed.

⸻

2. Stripe Billing

Purpose:
monthly SaaS subscriptions for businesses.

Plans:

* Starter
* Pro
* Agency

⸻

3. Stripe Customer Portal

Businesses manage:

* invoices,
* billing,
* subscriptions.

⸻

Pricing Model

Starter Plan

₹1999/month

* 100 AI conversations
* appointment booking
* payment collection

⸻

Pro Plan

₹5999/month

* unlimited conversations
* analytics
* multilingual AI
* CRM integration

⸻

Agency Plan

₹14999/month

* white-label
* multiple businesses
* advanced analytics

⸻

Voice AI Features

ElevenLabs Features Used

* conversational AI
* real-time voice
* text-to-speech
* voice cloning
* multilingual voices

⸻

Voice Personalities

Examples:

* friendly receptionist,
* luxury clinic assistant,
* calm medical advisor.

⸻

UI Pages

1. Landing Page

Sections:

* Hero
* Features
* Demo
* Pricing
* Testimonials
* CTA

⸻

2. Voice Call Interface

Features:

* animated waveform
* live transcript
* mute/unmute
* call timer
* AI speaking animation

⸻

3. CRM Dashboard

Widgets:

* revenue
* bookings
* active conversations
* AI summaries
* conversion rate

⸻

4. Pricing Page

Stripe Checkout integration.

⸻

Important UX Design Direction

Design should feel:

* futuristic,
* minimal,
* cinematic,
* premium.

Avoid:

* clutter,
* enterprise-heavy design,
* boring dashboards.

⸻

Suggested Color Palette

Background:

* dark slate
* black gradients

Accent:

* electric blue
* purple glow

Style:

* glassmorphism
* subtle motion effects