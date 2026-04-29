import { cookies } from 'next/headers'
import type { ReactNode } from 'react'
import {
  assertCookiesAllowlisted,
  collectCookieNamesFromConditions,
} from '../../lib/conditions/cookie-allowlist'
import {
  combineOperator,
  evaluateCookieCondition,
  evaluateServerCachedCondition,
} from '../../lib/conditions/evaluate'
import { partitionConditions } from '../../lib/conditions/scope'
import type {
  ConditionalContentStory,
  ConditionalRenderContext,
  StoryblokBlok,
} from '../../lib/storyblok/types'
import { ClientConditional } from './ClientConditional'
import { StoryblokBlocks } from './StoryblokBlocks'

export type ConditionalContentProps = {
  blok: ConditionalContentStory
  /** Pathname and locale should come from routing (e.g. `params`, headers, or middleware). */
  context: ConditionalRenderContext
  /** Cookie names that may be read when cookie-scoped conditions are present. */
  cookieAllowlist: ReadonlySet<string>
}

/**
 * Resolves `conditional_content` with correct ordering: server cached → cookies → client.
 * Cookie reads happen only when cookie-scoped conditions exist (and after cached `all` checks where possible).
 */
export async function ConditionalContent({ blok, context, cookieAllowlist }: ConditionalContentProps) {
  const operator = blok.operator ?? 'all'
  const { serverCached, serverCookie, client } = partitionConditions(blok.conditions)
  const cachedBools = serverCached.map((b) => evaluateServerCachedCondition(b, context))

  const content = <StoryblokBlocks bloks={blok.content} />
  const fallback = <StoryblokBlocks bloks={blok.fallback_content} />

  if (operator === 'all' && !combineOperator('all', cachedBools)) return fallback

  if (operator === 'any' && combineOperator('any', cachedBools)) {
    return content
  }

  let cookieBools: boolean[] = []
  if (serverCookie.length > 0) {
    assertCookiesAllowlisted(collectCookieNamesFromConditions(serverCookie), cookieAllowlist)
    const cookieStore = await cookies()
    const getCookie = (name: string) =>
      cookieAllowlist.has(name) ? cookieStore.get(name)?.value : undefined
    cookieBools = serverCookie.map((b) => evaluateCookieCondition(b, getCookie))
  }

  const serverMerged = [...cachedBools, ...cookieBools]
  const hasServerConditions = serverMerged.length > 0

  if (operator === 'all') {
    if (hasServerConditions && !combineOperator('all', serverMerged)) return fallback
    return renderWithOptionalClientGate(operator, client, content, fallback)
  }

  if (hasServerConditions && combineOperator('any', serverMerged)) return content
  if (client.length > 0) {
    return (
      <ClientConditional operator={operator} conditions={client} fallback={fallback}>
        {content}
      </ClientConditional>
    )
  }
  if (!hasServerConditions && client.length === 0) return content
  return fallback
}

function renderWithOptionalClientGate(
  operator: 'all' | 'any',
  client: StoryblokBlok[],
  content: ReactNode,
  fallback: ReactNode
): ReactNode {
  if (client.length === 0) return content
  return (
    <ClientConditional operator={operator} conditions={client} fallback={fallback}>
      {content}
    </ClientConditional>
  )
}
