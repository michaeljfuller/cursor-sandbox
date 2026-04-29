import type { SbBlokData } from '@storyblok/react'
import { headers } from 'next/headers'
import { ConditionalContent } from '../components/storyblok/ConditionalContent'
import {
  ConditionAbBucket,
  ConditionAuthHint,
  ConditionCookieEquals,
  ConditionDateRange,
  ConditionLocale,
  ConditionLocalStorage,
  ConditionReducedMotion,
  ConditionStoryblokToggle,
  ConditionUrlMatch,
  ConditionViewport,
} from '../components/storyblok/conditionPlaceholders'
import type { ConditionalContentStory } from '../lib/storyblok/types'

/** Sample cookie allowlist — replace with your app's policy (feature flags, A/B, auth cookie names). */
export const EXAMPLE_COOKIE_ALLOWLIST = new Set<string>(['ab_bucket', 'feature_x', 'session_hint'])

export type ConditionalContentBridgeProps = {
  blok: SbBlokData
}

/**
 * Reads `x-pathname` and optional `x-locale` from request headers (set in middleware) and renders `ConditionalContent`.
 * Override allowlist in your app by forking this bridge or wrapping `ConditionalContent` yourself.
 */
export async function ConditionalContentBridge({ blok }: ConditionalContentBridgeProps) {
  const h = await headers()
  const pathname = h.get('x-pathname') ?? '/'
  const locale = h.get('x-locale') ?? undefined
  return (
    <ConditionalContent
      blok={blok as ConditionalContentStory}
      context={{ pathname, locale }}
      cookieAllowlist={EXAMPLE_COOKIE_ALLOWLIST}
    />
  )
}

/** Pass this object to `StoryblokServerComponent` `components` prop (App Router). */
export const conditionalStoryblokComponents = {
  conditional_content: ConditionalContentBridge,
  condition_date_range: ConditionDateRange,
  condition_url_match: ConditionUrlMatch,
  condition_locale: ConditionLocale,
  condition_storyblok_toggle: ConditionStoryblokToggle,
  condition_cookie_equals: ConditionCookieEquals,
  condition_ab_bucket: ConditionAbBucket,
  condition_auth_hint: ConditionAuthHint,
  condition_viewport: ConditionViewport,
  condition_reduced_motion: ConditionReducedMotion,
  condition_local_storage: ConditionLocalStorage,
} as const
