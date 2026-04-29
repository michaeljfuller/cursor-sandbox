import type { StoryblokBlok } from '../storyblok/types'

export type ConditionScope = 'server_cached' | 'server_cookie' | 'client'

const SERVER_CACHED = new Set<string>([
  'condition_date_range',
  'condition_url_match',
  'condition_locale',
  'condition_storyblok_toggle',
])

const SERVER_COOKIE = new Set<string>([
  'condition_cookie_equals',
  'condition_ab_bucket',
  'condition_auth_hint',
])

const CLIENT = new Set<string>([
  'condition_viewport',
  'condition_reduced_motion',
  'condition_local_storage',
])

/** Maps a Storyblok component technical name to its evaluation scope. */
export function getConditionScope(component: string): ConditionScope | undefined {
  if (SERVER_CACHED.has(component)) return 'server_cached'
  if (SERVER_COOKIE.has(component)) return 'server_cookie'
  if (CLIENT.has(component)) return 'client'
  return undefined
}

/** Splits condition bloks into three buckets; unknown components are omitted. */
export function partitionConditions(conditions: StoryblokBlok[] | undefined): {
  serverCached: StoryblokBlok[]
  serverCookie: StoryblokBlok[]
  client: StoryblokBlok[]
} {
  const serverCached: StoryblokBlok[] = []
  const serverCookie: StoryblokBlok[] = []
  const client: StoryblokBlok[] = []

  for (const blok of conditions ?? []) {
    const scope = getConditionScope(blok.component)
    if (scope === 'server_cached') serverCached.push(blok)
    else if (scope === 'server_cookie') serverCookie.push(blok)
    else if (scope === 'client') client.push(blok)
  }

  return { serverCached, serverCookie, client }
}
