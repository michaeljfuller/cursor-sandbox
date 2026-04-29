import { cookies } from 'next/headers'
import type { ReactNode } from 'react'
import {
  assertCookiesAllowlisted,
  collectCookieNamesFromConditions,
} from '../../lib/conditions/cookie-allowlist'
import { combineOperator, evaluateCookieCondition } from '../../lib/conditions/evaluate'
import type { ConditionalOperator } from '../../lib/storyblok/types'
import type { StoryblokBlok } from '../../lib/storyblok/types'

export type CookieGateProps = {
  /** Same operator as parent `conditional_content` when this gate wraps only cookie-scoped bloks. */
  operator: ConditionalOperator
  bloks: StoryblokBlok[]
  /** Cookie names permitted to be read; must cover every name referenced in `bloks`. */
  allowlist: ReadonlySet<string>
  fallback: ReactNode
  children: ReactNode
}

/**
 * Server Component that reads `cookies()` and evaluates only cookie-based conditions.
 * Using this (or `ConditionalContent` with cookie conditions) opts the route into dynamic rendering for that request path.
 */
export async function CookieGate({ operator, bloks, allowlist, fallback, children }: CookieGateProps) {
  assertCookiesAllowlisted(collectCookieNamesFromConditions(bloks), allowlist)
  const cookieStore = await cookies()
  const getCookie = (name: string) =>
    allowlist.has(name) ? cookieStore.get(name)?.value : undefined
  const results = bloks.map((b) => evaluateCookieCondition(b, getCookie))
  if (!combineOperator(operator, results)) return fallback
  return children
}
