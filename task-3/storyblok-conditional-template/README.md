# Storyblok conditional content (Next.js template)

Drop-in Storyblok component definitions and Next.js App Router code for a `conditional_content` blok with three evaluation scopes:

| Scope | When to use | Next.js caching |
|-------|-------------|-----------------|
| **Server (cache-safe)** | Dates, URL/path, locale from routing, CMS booleans — no cookies | Compatible with ISR/static generation for a given URL variant |
| **Server (cookies)** | A/B buckets, feature cookies, “logged in” hints | Calling `cookies()` makes the route **dynamic** for that tree; use middleware/cache segmentation if you need shared static shells |
| **Client** | `matchMedia`, `localStorage`, APIs that only exist in the browser | No sensitive HTML in the initial response until after hydration unless you accept a flash or use CSS-only patterns |

## Storyblok setup

1. In Storyblok, create components from the JSON files in [`storyblok/components/`](storyblok/components/). You can paste schema fields manually or use the Management API / CLI to sync them.
2. For `conditional_content` → **Content** / **Fallback content**, set `component_whitelist` to the UI bloks your space allows (the template ships with empty arrays — fill in your `teaser`, `grid`, etc.).
3. Keep condition components restricted to the whitelist already listed under **Conditions**.

## Wiring into Next.js

### 1. Middleware (pathname / locale for URL conditions)

`ConditionalContent` needs the request pathname (and optionally locale). The bridge in [`storyblok/register.tsx`](storyblok/register.tsx) reads:

- `x-pathname` — required for `condition_url_match` / sane defaults
- `x-locale` — optional, for `condition_locale`

Example:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  const locale = request.nextUrl.pathname.split('/')[1]
  if (locale && locale.length <= 5) {
    requestHeaders.set('x-locale', locale)
  }
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

Fork `ConditionalContentBridge` if you already pass locale via React context or `[locale]` segment props instead of headers.

### 2. Storyblok server component map

Merge `conditionalStoryblokComponents` from [`storyblok/register.tsx`](storyblok/register.tsx) into the object you pass to `StoryblokServerComponent` (`@storyblok/react/rsc`).

### 3. Cookie allowlist

Cookie-based conditions **must** use names included in `cookieAllowlist`. Unknown names throw in development to avoid arbitrary cookie reads from CMS content. Replace `EXAMPLE_COOKIE_ALLOWLIST` with your real allowlist (or inject from env).

### 4. Mixed scopes and operators

- **`operator: all`** — Every condition must pass. Server layers run first; client conditions run inside `ClientConditional` after mount.
- **`operator: any`** — If any server-evaluable condition passes, the blok renders immediately (client-only conditions are evaluated only when the server side cannot yet satisfy OR).

For complex combinations, prefer **nesting** multiple `conditional_content` bloks (outer = cache-safe, inner = cookie, innermost = client).

## Package layout

| Path | Role |
|------|------|
| [`lib/conditions/evaluate.ts`](lib/conditions/evaluate.ts) | Pure evaluators + `combineOperator` |
| [`lib/conditions/scope.ts`](lib/conditions/scope.ts) | Maps blok names → scope |
| [`lib/conditions/cookie-allowlist.ts`](lib/conditions/cookie-allowlist.ts) | Collect / validate cookie names |
| [`components/storyblok/ConditionalContent.tsx`](components/storyblok/ConditionalContent.tsx) | Orchestration |
| [`components/storyblok/CookieGate.tsx`](components/storyblok/CookieGate.tsx) | Standalone cookie-only gate (optional composition) |
| [`components/storyblok/ClientConditional.tsx`](components/storyblok/ClientConditional.tsx) | Client-side conditions |

## Security

Store only declarative fields in Storyblok (cookie **names**, fixed values, ISO dates). Never embed executable code. Extend allowlists in application code, not from the CMS alone.
