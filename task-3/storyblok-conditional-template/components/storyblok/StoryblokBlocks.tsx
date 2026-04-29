import { StoryblokServerComponent } from '@storyblok/react/rsc'
import type { StoryblokBlok } from '../../lib/storyblok/types'

type StoryblokBlocksProps = {
  bloks?: StoryblokBlok[]
}

/** Renders a list of Storyblok bloks using the app-registered server component map. */
export function StoryblokBlocks({ bloks }: StoryblokBlocksProps) {
  if (!bloks?.length) return null
  return (
    <>
      {bloks.map((b) => (
        <StoryblokServerComponent blok={b} key={b._uid} />
      ))}
    </>
  )
}
