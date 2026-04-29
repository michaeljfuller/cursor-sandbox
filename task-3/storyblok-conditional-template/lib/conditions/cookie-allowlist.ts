import type { StoryblokBlok } from '../storyblok/types'

/** Cookie names referenced by Storyblok condition bloks (must be allowlisted before read). */
export function collectCookieNamesFromConditions(bloks: StoryblokBlok[]): string[] {
  const names: string[] = []
  for (const blok of bloks) {
    switch (blok.component) {
      case 'condition_cookie_equals':
      case 'condition_ab_bucket':
      case 'condition_auth_hint': {
        const n = (blok as { cookie_name?: string }).cookie_name?.trim()
        if (n) names.push(n)
        break
      }
      default:
        break
    }
  }
  return names
}

/** Throws if any cookie name is not in the allowlist (fail closed). */
export function assertCookiesAllowlisted(names: string[], allowlist: ReadonlySet<string>): void {
  const missing = names.filter((n) => !allowlist.has(n))
  if (missing.length > 0) {
    throw new Error(
      `[conditional-content] Cookie names not allowlisted: ${missing.join(', ')}. Extend allowlist in application code.`
    )
  }
}
