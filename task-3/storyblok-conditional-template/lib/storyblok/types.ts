/**
 * Storyblok blok shapes for conditional content and condition components.
 * Field names align with storyblok/components/*.json schemas.
 */

export type ConditionalOperator = 'all' | 'any'

export type StoryblokBlokBase = {
  _uid: string
  component: string
}

export type ConditionalContentStory = StoryblokBlokBase & {
  component: 'conditional_content'
  content?: StoryblokBlok[]
  fallback_content?: StoryblokBlok[]
  conditions?: StoryblokBlok[]
  operator?: ConditionalOperator
}

export type ConditionDateRangeStory = StoryblokBlokBase & {
  component: 'condition_date_range'
  start?: string
  end?: string
}

export type ConditionUrlMatchStory = StoryblokBlokBase & {
  component: 'condition_url_match'
  match_type?: 'prefix' | 'regex'
  pattern?: string
}

export type ConditionLocaleStory = StoryblokBlokBase & {
  component: 'condition_locale'
  locale?: string
}

export type ConditionStoryblokToggleStory = StoryblokBlokBase & {
  component: 'condition_storyblok_toggle'
  enabled?: boolean
}

export type ConditionCookieEqualsStory = StoryblokBlokBase & {
  component: 'condition_cookie_equals'
  cookie_name?: string
  expected_value?: string
  match_mode?: 'exact' | 'regex'
}

export type ConditionAbBucketStory = StoryblokBlokBase & {
  component: 'condition_ab_bucket'
  cookie_name?: string
  bucket_id?: string
}

export type ConditionAuthHintStory = StoryblokBlokBase & {
  component: 'condition_auth_hint'
  cookie_name?: string
}

export type ConditionViewportStory = StoryblokBlokBase & {
  component: 'condition_viewport'
  min_width_px?: number
  max_width_px?: number
}

export type ConditionReducedMotionStory = StoryblokBlokBase & {
  component: 'condition_reduced_motion'
  when_reduced?: boolean
}

export type ConditionLocalStorageStory = StoryblokBlokBase & {
  component: 'condition_local_storage'
  storage_key?: string
  expected_value?: string
}

export type ConditionStory =
  | ConditionDateRangeStory
  | ConditionUrlMatchStory
  | ConditionLocaleStory
  | ConditionStoryblokToggleStory
  | ConditionCookieEqualsStory
  | ConditionAbBucketStory
  | ConditionAuthHintStory
  | ConditionViewportStory
  | ConditionReducedMotionStory
  | ConditionLocalStorageStory

export type StoryblokBlok = ConditionalContentStory | ConditionStory | StoryblokBlokBase

/** Evaluation context passed from the page / layout (pathname, locale, optional clock). */
export type ConditionalRenderContext = {
  pathname: string
  locale?: string
  now?: Date
}
