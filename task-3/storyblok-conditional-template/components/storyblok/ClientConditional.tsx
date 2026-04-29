'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { combineOperator, evaluateClientCondition } from '../../lib/conditions/evaluate'
import type { ConditionalOperator } from '../../lib/storyblok/types'
import type { StoryblokBlok } from '../../lib/storyblok/types'

export type ClientConditionalProps = {
  operator: ConditionalOperator
  conditions: StoryblokBlok[]
  fallback: ReactNode
  children: ReactNode
}

/**
 * Evaluates client-only conditions (viewport, media queries, localStorage) after mount.
 * Until evaluation completes, nothing is rendered to avoid flashing incorrect SEO-sensitive content.
 */
export function ClientConditional({
  operator,
  conditions,
  fallback,
  children,
}: ClientConditionalProps) {
  const [passed, setPassed] = useState<boolean | null>(null)

  useEffect(() => {
    const results = conditions.map((b) => evaluateClientCondition(b))
    setPassed(combineOperator(operator, results))
  }, [operator, conditions])

  if (passed === null) return null
  if (!passed) return fallback
  return children
}
