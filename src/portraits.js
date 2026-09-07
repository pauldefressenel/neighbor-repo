import { PORTRAIT_ANIMATIONS, SLUG_TO_PORTRAIT } from './portraitAnimations'

// Portrait slugs carry a language suffix; the animation does not.
export const portraitKey = (slug = '') => SLUG_TO_PORTRAIT[slug.replace(/-(en|fr)$/, '')]

export const portraitSpec = (slug) => PORTRAIT_ANIMATIONS[portraitKey(slug)]

export const hasPortraitAnimation = (slug) => Boolean(portraitSpec(slug))
