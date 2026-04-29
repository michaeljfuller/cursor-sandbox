import type {
  ConditionalOperator,
  ConditionalRenderContext,
  ConditionAbBucketStory,
  ConditionAuthHintStory,
  ConditionCookieEqualsStory,
  ConditionDateRangeStory,
  ConditionLocaleStory,
  ConditionLocalStorageStory,
  ConditionReducedMotionStory,
  ConditionStoryblokToggleStory,
  ConditionUrlMatchStory,
  ConditionViewportStory,
  StoryblokBlok,
} from '../storyblok/types'
import { getConditionScope } from './scope'

/**
 * Combines individual condition results with AND or OR.
 * Empty `results` yields true for `all` (vacuous) and false for `any` (nothing passes).
 */
export function combineOperator(operator: ConditionalOperator, results: boolean[]): boolean {
  if (results.length === 0) return operator === 'all'
  return operator === 'all' ? results.every(Boolean) : results.some(Boolean)
}

/** Evaluates server-cache-safe conditions (no cookies). */
export function evaluateServerCachedCondition(
  blok: StoryblokBlok,
  ctx: ConditionalRenderContext
): boolean {
  const now = ctx.now ?? new Date()
  switch (blok.component) {
    case 'condition_date_range':
      return evaluateDateRange(blok as ConditionDateRangeStory, now)
    case 'condition_url_match':
      return evaluateUrlMatch(blok as ConditionUrlMatchStory, ctx.pathname)
    case 'condition_locale':
      return evaluateLocale(blok as ConditionLocaleStory, ctx.locale)
    case 'condition_storyblok_toggle':
      return Boolean((blok as ConditionStoryblokToggleStory).enabled)
    default:
      return false
  }
}

function evaluateDateRange(blok: ConditionDateRangeStory, now: Date): boolean {
  const start = blok.start ? new Date(blok.start).getTime() : NaN
  const end = blok.end ? new Date(blok.end).getTime() : NaN
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  const t = now.getTime()
  return t >= start && t <= end
}

function evaluateUrlMatch(blok: ConditionUrlMatchStory, pathname: string): boolean {
  const pattern = blok.pattern?.trim() ?? ''
  if (!pattern) return false
  if (blok.match_type === 'regex') {
    try {
      const re = new RegExp(pattern)
      return re.test(pathname)
    } catch {
      return false
    }
  }
  const prefix = pattern.endsWith('/') ? pattern.slice(0, -1) : pattern
  if (!prefix.startsWith('/')) {
    return pathname === `/${prefix}` || pathname.startsWith(`/${prefix}/`)
  }
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function evaluateLocale(blok: ConditionLocaleStory, locale: string | undefined): boolean {
  if (!locale || !blok.locale) return false
  return blok.locale.toLowerCase() === locale.toLowerCase()
}

/** Uses Next.js cookies() — call only from Server Components that opt into dynamic rendering when needed. */
export function evaluateCookieCondition(
  blok: StoryblokBlok,
  getCookie: (name: string) => string | undefined
): boolean {
  switch (blok.component) {
    case 'condition_cookie_equals':
      return evaluateCookieEquals(blok as ConditionCookieEqualsStory, getCookie)
    case 'condition_ab_bucket':
      return evaluateAbBucket(blok as ConditionAbBucketStory, getCookie)
    case 'condition_auth_hint':
      return evaluateAuthHint(blok as ConditionAuthHintStory, getCookie)
    default:
      return false
  }
}

function evaluateCookieEquals(
  blok: ConditionCookieEqualsStory,
  getCookie: (name: string) => string | undefined
): boolean {
  const name = blok.cookie_name?.trim()
  if (!name) return false
  const raw = getCookie(name)
  if (raw === undefined) return false
  const expected = blok.expected_value ?? ''
  if (blok.match_mode === 'regex') {
    try {
      return new RegExp(expected).test(raw)
    } catch {
      return false
    }
  }
  return raw === expected
}

function evaluateAbBucket(
  blok: ConditionAbBucketStory,
  getCookie: (name: string) => string | undefined
): boolean {
  const name = blok.cookie_name?.trim()
  if (!name || blok.bucket_id === undefined) return false
  const raw = getCookie(name)
  return raw === blok.bucket_id
}

function evaluateAuthHint(
  blok: ConditionAuthHintStory,
  getCookie: (name: string) => string | undefined
): boolean {
  const name = blok.cookie_name?.trim()
  if (!name) return false
  return getCookie(name) !== undefined
}

/** Client-side evaluators (for use in ClientConditional / browser only). */
export function evaluateClientCondition(blok: StoryblokBlok): boolean {
  if (typeof window === 'undefined') return false
  switch (blok.component) {
    case 'condition_viewport':
      return evaluateViewport(blok as ConditionViewportStory)
    case 'condition_reduced_motion':
      return evaluateReducedMotion(blok as ConditionReducedMotionStory)
    case 'condition_local_storage':
      return evaluateLocalStorage(blok as ConditionLocalStorageStory)
    default:
      return false
  }
}

function evaluateViewport(blok: ConditionViewportStory): boolean {
  const w = typeof window !== 'undefined' ? window.innerWidth : 0
  const min = blok.min_width_px
  const max = blok.max_width_px
  if (min !== undefined && w < min) return false
  if (max !== undefined && w > max) return false
  return true
}

function evaluateReducedMotion(blok: ConditionReducedMotionStory): boolean {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const prefersReduced = mq.matches
  const whenReduced = blok.when_reduced !== false
  return whenReduced ? prefersReduced : !prefersReduced
}

function evaluateLocalStorage(blok: ConditionLocalStorageStory): boolean {
  try {
    const key = blok.storage_key?.trim()
    if (!key) return false
    const v = window.localStorage.getItem(key)
    if (v === null) return false
    if (blok.expected_value === undefined || blok.expected_value === '') return true
    return v === blok.expected_value
  } catch {
    return false
  }
}

/**
 * Flattens per-scope evaluation into a single pass/fail on the server for cached + cookie layers.
 * Client bloks are not evaluated here.
 */
export function evaluateServerCachedConditions(
  operator: ConditionalOperator,
  bloks: StoryblokBlok[],
  ctx: ConditionalRenderContext
): boolean {
  const results = bloks.map((b) => evaluateServerCachedCondition(b, ctx))
  return combineOperator(operator, results)
}

export function evaluateServerCookieConditions(
  operator: ConditionalOperator,
  bloks: StoryblokBlok[],
  getCookie: (name: string) => string | undefined
): boolean {
  const results = bloks.map((b) => evaluateCookieCondition(b, getCookie))
  return combineOperator(operator, results)
}

export function evaluateClientConditions(
  operator: ConditionalOperator,
  bloks: StoryblokBlok[]
): boolean {
  const results = bloks.map((b) => evaluateClientCondition(b))
  return combineOperator(operator, results)
}

/** Returns true if this blok is a known condition component. */
export function isKnownConditionBlok(blok: StoryblokBlok): boolean {
  return getConditionScope(blok.component) !== undefined
}
