# IndieStack Design Spec

**Date:** 2026-03-27  
**Status:** Approved

---

## 1. Product Overview

**Name:** IndieStack  
**Tagline:** The marketing stack for indie hackers who ship fast.

### What It Is

A fork of Postiz (AGPL-3.0) repositioned for indie hackers. Built on Postiz's 28+ channel integrations, with OpenClaw as the unified AI engine powering all content generation, SEO/GEO optimization, and marketing automation via configurable skills. Opinionated UX tailored for solo founders who need to market their products without learning enterprise tools.

### Target Audience

Indie hackers / solo founders building and launching their own products. Tight budget, need to market on their own, don't have time for enterprise tools.

### Licensing Strategy

- **IndieStack (fork):** Postiz + OpenClaw integration endpoints — AGPL-3.0 open source
- **OpenClaw + skills:** Separate closed-source product/service — proprietary

This separation ensures the Postiz fork remains open source while the AI brain (OpenClaw and skills) can be proprietary.

### TikTok Compliance Strategy

Positioned as "marketing tools for builders" — a broadly useful product with indie hackers as the primary demographic. This framing makes the service appear general-purpose enough for TikTok developer approval.

---

## 2. Architecture

### Core Stack

Postiz fork (unchanged):

- **Backend:** NestJS — API endpoints, channel integrations
- **Frontend:** React/Vite — modified UI for indie hacker workflows
- **Orchestrator:** Temporal — workflow scheduling
- **Database:** PostgreSQL + Prisma

### OpenClaw Integration

IndieStack connects to OpenClaw as an external hosted service:

```
User → IndieStack UI → IndieStack API → OpenClaw (hosted) → Skills execute → Results returned → User reviews → Published
```

- IndieStack exposes skill invocation endpoints in the backend (new `openclaw` module in libs/server)
- OpenClaw runs as a separate hosted service (not baked into the fork)
- Users configure their OpenClaw connection via Settings → API key
- Skills run on OpenClaw, results returned to IndieStack for review

### Hosting Model

OpenClaw is a managed service hosted by the IndieStack team. Users don't need to set it up themselves.

---

## 3. OpenClaw Skills (Managed)

Included skills (hosted on IndieStack's OpenClaw instance, closed source):

| Skill               | Source                                           | Purpose                                                 |
| ------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| last30days          | github.com/mvanhorn/last30days-skill             | Analyze 30-day growth trends and suggest content topics |
| product-hunt-launch | github.com/inferen-sh/skills/product-hunt-launch | Optimize content and timing for Product Hunt launch     |
| seo-geo-claude      | github.com/aaron-he-zhu/seo-geo-claude-skills    | Keyword research and SEO/GEO content optimization       |
| larry               | clawhub.ai/olliewazza/larry                      | Social listening and engagement automation              |

### User Experience

- Skills are pre-configured in the hosted OpenClaw
- Users see skills in the IndieStack webapp UI and click "Run Skill"
- No OpenClaw setup required — managed service
- Results appear in IndieStack for review before publishing

### Extensibility

New skills can be added to the OpenClaw instance without modifying IndieStack. IndieStack only needs to know the skill name and input schema.

---

## 4. Supported Channels

All Postiz channels plus Product Hunt:

Twitter/X, LinkedIn, Instagram, TikTok, YouTube, Facebook, Reddit, Pinterest, Threads, Dribbble, Discord, Slack, Mastodon, Bluesky, Telegram, Medium, Dev.to, Hashnode, Nostr, Farminster, Product Hunt

---

## 5. Pricing

Package-based tiers (no per-transaction charges):

| Tier    | Price  | Posts/mo  | AI Generations | Channels |
| ------- | ------ | --------- | -------------- | -------- |
| Builder | $19/mo | 50        | 100            | 5        |
| Maker   | $49/mo | Unlimited | 500            | 15       |
| Studio  | $99/mo | Unlimited | Unlimited      | All 28+  |

**Included in all tiers:**

- Access to all OpenClaw skills
- Calendar & scheduling
- Media library
- Analytics dashboard

---

## 6. UI Structure

### Navigation

- **Dashboard** — Analytics & growth metrics
- **Create** — AI content generation (primary workflow)
- **Skills** — OpenClaw skill hub (new, key differentiation)
- **Calendar** — Schedule & publish
- **Media** — Library & assets
- **Settings** — Channels & API configuration

### Skills Hub

Grid of skill cards showing:

- Skill name and icon
- Brief description
- "Run Skill" button
- Results displayed below for review

### Create Page

- AI-first: user describes idea, AI generates content
- Sidebar with AI suggestions (hashtags, SEO score, caption, PH angle)
- Media attachment
- Channel selection
- Schedule or publish immediately

---

## 7. Channel Priority

Phase 1 (launch priority):

1. TikTok
2. Twitter/X
3. LinkedIn
4. Reddit
5. Product Hunt

Phase 2:
Remaining Postiz channels (Instagram, YouTube, Facebook, etc.)

---

## 8. Technical Implementation Notes

- **Fork strategy:** Start from Postiz main, add IndieStack-specific features in separate modules/packages. Keeps merging from upstream manageable.
- **OpenClaw integration:** New `openclaw` module in libs/server — connects to external OpenClaw API. Doesn't include OpenClaw code itself.
- **Self-hosted option:** AGPL means users can self-host IndieStack. SaaS tier is the managed offering. OpenClaw skills would need to be licensed separately for self-hosted users.
