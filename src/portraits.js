import { PORTRAIT_ANIMATIONS, SLUG_TO_PORTRAIT } from './portraitAnimations'

// Portrait slugs carry a language suffix; the animation does not.
export const portraitKey = (slug = '') => SLUG_TO_PORTRAIT[slug.replace(/-(en|fr)$/, '')]

export const portraitSpec = (slug) => PORTRAIT_ANIMATIONS[portraitKey(slug)]

export const hasPortraitAnimation = (slug) => Boolean(portraitSpec(slug))

// How much of Framer's 110-unit slot each figure leaves empty above and below
// it, over its whole loop (measured from screenshots of the animations, at
// their highest and lowest). A figure stands at the slot's foot, so a short
// one leaves more room above: set in the illustration's place, the gap above
// looked uneven from card to card. Cards take this away from the gap around
// the drawing, on the website's phones and in the app.
const INK = {
  zorba: { top: 23, bottom: 3 },
  feynman: { top: 10, bottom: 2 },
  miller: { top: 11, bottom: 3 },
  sapolsky: { top: 12, bottom: 1 },
  vera: { top: 13, bottom: 1 },
  // Rubin reaches 9 only now and then: for about half his loop his top is
  // some 20 units lower, so his gap looked larger than the others'.
  rubin: { top: 22.5, bottom: 2 },
  furtive: { top: 24, bottom: 2 },
}

export const portraitInk = (slug) => INK[portraitKey(slug)] ?? { top: 0, bottom: 0 }
