# Task 3
**Activity:** Agent-First Problem Solving: Use an AI agent (Cursor or Copilot) in "Plan Mode" to solve a real problem from your current work. This could be: writing a utility script, creating configuration files, generating test cases, setting up a small automation, or documenting a process. Let the agent plan and execute with minimal manual intervention.

**Deliverable:** A working solution to your chosen problem and a brief write-up of the agent's plan and execution process. Note what worked well and what required manual intervention.

## Prompt
Plan mode sent to 'Auto' agent. 1.2M tokens used, costing $0.66.

> You are an experienced senior software engineer working with a NextJS app fed by Storyblok CMS. You want to develop a new collection of "bloks" that let content managers define whether a blok's children should be shown, based on the conditions defined in the blok.
> 
> There should be a `conditional_content` blok that has a `content` field that contains UI bloks to be shown. It should also have a `conditions` field that can be many bloks that define certain conditions to be met for the content to show. Lastly, it should have an `operator` rule that defines the behavior when evaluating multiple conditions.
> 
> A point of note is that pages are cached, so the conditions have 3 potential scopes;
> - Conditions that are OK to be cached at the page level.
> - Conditions that are based on the user's cookies, and need to circumvent page caching.
> - Conditions that need to be evaluated on the client's browser.
> 
> Please describe the schema for these bloks, using some example conditions for each scope. Also provide a basic implementation for them in a potentially pre-existing NextJS app, that coveres the 3 scopes. This will be used as a template.
> 
> The app is not defined in this project, so there's no need to scan existing files.

----

## Response
Designing a Storyblok schema and Next.js implementation template for three evaluation scopes. No codebase scan needed. Creating a structured plan you can use as a template.
- [Plan](./Plan.md)

Implementing the Storyblok conditional-content template per the plan. Exploring the workspace and working through the todos.

Creating a self-contained template package with Storyblok component JSON, TypeScript types, evaluation logic, and React components.
- [conditional_content](./storyblok-conditional-template/storyblok/components/conditional_content.json)
- [condition_date_range](./storyblok-conditional-template/storyblok/components/condition_date_range.json)
- [condition_url_match](./storyblok-conditional-template/storyblok/components/condition_url_match.json)
- [condition_locale](./storyblok-conditional-template/storyblok/components/condition_locale.json)
- [condition_storyblok_toggle](./storyblok-conditional-template/storyblok/components/condition_storyblok_toggle.json)
- [condition_cookie_equals](./storyblok-conditional-template/storyblok/components/condition_cookie_equals.json)
- [condition_ab_bucket](./storyblok-conditional-template/storyblok/components/condition_ab_bucket.json)
- [condition_auth_hint](./storyblok-conditional-template/storyblok/components/condition_auth_hint.json)
- [condition_viewport](./storyblok-conditional-template/storyblok/components/condition_viewport.json)
- [condition_reduced_motion](./storyblok-conditional-template/storyblok/components/condition_reduced_motion.json)
- [condition_local_storage](./storyblok-conditional-template/storyblok/components/condition_local_storage.json)

Implementing evaluation logic, TypeScript types, and components with correct flat all/any semantics across scopes.  
Fixing URL prefix matching (avoid /de matching /demo) and cleaning imports in evaluate.ts.  
Fixing empty-array semantics for combineOperator when mixing server and client conditions, then adding components and registration.  
Fixing any short-circuit: when cached conditions satisfy OR, return content directly (don't wrap with client). Cleaning up wrapClientIfNeeded.  
Fixing the Storyblok bridge: Storyblok won't pass pathname — deriving it from headers() (middleware-injected) per the README.  
- [types.ts](./storyblok-conditional-template/lib/storyblok/types.ts)
- [scope.ts](./storyblok-conditional-template/lib/conditions/scope.ts)
- [evaluate.ts](./storyblok-conditional-template/lib/conditions/evaluate.ts)
- [cookie-allowlist.ts](./storyblok-conditional-template/lib/conditions/cookie-allowlist.ts)
- [StoryblokBlocks.tsx](./storyblok-conditional-template/components/storyblok/StoryblokBlocks.tsx)
- [CookieGate.tsx](./storyblok-conditional-template/components/storyblok/CookieGate.tsx)
- [ClientConditional.tsx](./storyblok-conditional-template/components/storyblok/ClientConditional.tsx)
- [ConditionalContent.tsx](./storyblok-conditional-template/components/storyblok/ConditionalContent.tsx)
- [conditionPlaceholders.tsx](./storyblok-conditional-template/components/storyblok/conditionPlaceholders.tsx)
- [register.tsx](./storyblok-conditional-template/storyblok/register.tsx)
- [package.json](./storyblok-conditional-template/package.json)
- [tsconfig.json](./storyblok-conditional-template/tsconfig.json)
- [index.ts](./storyblok-conditional-template/index.ts)
- [README.md](./storyblok-conditional-template/README.md)

Here is what was added and how to use it.

### Storyblok schemas
- `storyblok/components/conditional_content.json` — content, fallback_content, conditions, operator (all / any).
- **Server (cache-safe)**: condition_date_range, condition_url_match, condition_locale, condition_storyblok_toggle.
- **Server (dynamic / cookies)**: condition_cookie_equals, condition_ab_bucket, condition_auth_hint.
- **Client**: condition_viewport, condition_reduced_motion, condition_local_storage.

### Implementation

| Piece                                            | File                                          |
| ------------------------------------------------ | --------------------------------------------- |
| Types                                            | `lib/storyblok/types.ts`                      |
| Evaluators + combineOperator                     | `lib/conditions/evaluate.ts`                  |
| Scope partition                                  | `lib/conditions/scope.ts`                     |
| Cookie allowlist                                 | `lib/conditions/cookie-allowlist.ts`          |
| Main orchestration (cached → cookies → client)   | `components/storyblok/ConditionalContent.tsx` |
| Optional cookie-only gate                        | `components/storyblok/CookieGate.tsx`         |
| Client conditions                                | `components/storyblok/ClientConditional.tsx`  |
| Storyblok blok list renderer                     | `components/storyblok/StoryblokBlocks.tsx`    |
| Condition stubs + conditionalStoryblokComponents | `storyblok/register.tsx`                      |
| Barrel exports                                   | `index.ts`                                    |

**Bridge**: `ConditionalContentBridge` resolves `x-pathname` and `x-locale` from `headers()` so URL/locale conditions work without extra CMS props. Middleware should set those headers (example in README).

**Typing**: Dev dependencies use React 19 so async server components type-check as JSX; peers remain `react >= 18`.

### Docs
`README.md` covers scope choice, caching vs dynamic routes, cookie allowlists, middleware sample, and nesting guidance.

### Verification
`npx tsc --noEmit` succeeds under `storyblok-conditional-template/tsconfig.json`.

All related todos are marked completed. The plan file itself was not modified.
