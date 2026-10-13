import { card } from './tokens.js'

// How an illustration is drawn, as the proportions of its box and its width
// in the card's. The drawing, trimmed to its ink (import/trim-illustrations.mjs),
// stands the standard height (card.illustrationAspect), times the article's
// `illustrationScale` (0.5 to 1.5, a slider in the Studio), unless that would make
// it wider than the card: then it is the card's width. The box is exactly as
// tall as the drawing, so the text above and below keeps its distance and
// moves with it.
export function illustrationSize(image, scale = 1) {
  const crop = image?.crop ?? { top: 0, bottom: 0, left: 0, right: 0 }
  const [width, height] = (image?.asset?._ref?.split('-')[2] ?? '').split('x').map(Number)
  if (!width || !height) return { aspect: card.illustrationAspect, width: 1 }
  const ratio = (width * (1 - crop.left - crop.right)) / (height * (1 - crop.top - crop.bottom))
  const s = scale ?? 1
  return {
    aspect: Math.max(card.illustrationAspect / s, ratio),
    width: Math.min(1, (ratio * s) / card.illustrationAspect),
  }
}
