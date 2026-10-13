// The design values the website and the app share. The app reads them
// through mobile/src/theme.js; the website as CSS variables (`cssVariables`
// below, served by the `tokens` plugin in vite.config.js as
// virtual:tokens.css). Sizes are px on the web and pt in the app; tracking is
// in em, leading a multiple of the size.
//
// A value belongs here only when both sides use it. Font families are named
// differently on each side, so they stay in theme.js and the CSS.

export const colors = {
  paper: '#FFFFF2',
  red: '#FF1919',
  placeholder: '#7B61FF', // an article with no illustration yet
}

export const type = {
  // Page titles and card titles: NeighborFont.
  title: { size: 35, tracking: -0.03, leading: 1.1 },
  // The red category over a card: Averia Libre, in capitals.
  category: { size: 18, tracking: -0.05, leading: 1.1 },
  // A card's excerpt: EB Garamond.
  excerpt: { size: 20, leading: 1.1 },
  // A card's byline and date: EB Garamond, medium and italic.
  byline: { size: 21, lineHeight: 24 },
}

export const card = {
  // The excerpt runs the card's width, less this on each side, on a phone.
  // (It was a 240-wide column, whose short lines made it run long.)
  excerptInset: 20,
  // Above and below the illustration, on a phone.
  imageGap: 30, // (22 to 26 felt tight)
  // An illustration's height: the card's width at these proportions. Each
  // drawing, trimmed to its ink (import/trim-illustrations.mjs), stands this
  // tall, times its article's illustrationScale (shared/illustration.js).
  // (The box was the vignettes' own 1818×572 at first, and then each drawing
  // took the same area of a 2.4 box, which was not liked.)
  illustrationAspect: 3.2,
  // A one-line title wider than this share of the card goes onto two lines.
  titleMaxFill: 0.8,
}

// Under the header (the website) and the masthead (the app), the paper fades
// out over this height, so the page scrolling up beneath dissolves rather
// than being cut off at the line.
export const headerFade = 30

// An article card in the app while it is held: it eases down to `scale`,
// and back more slowly on release, both along `easing` (a cubic bezier).
// Chosen on a comparison page; 0.9 in 0.15s each way felt harsh. The
// website has no press.
export const press = {
  scale: 0.98,
  pressIn: 220, // ms
  release: 380, // ms
  easing: [0.22, 1, 0.36, 1],
}

// A page's title is closed by one asterisk, centred under it (three were
// used first, then a short drawn line). `size` is its type size, and its
// line box is as tall, so iOS doesn't clip it; `above` is the room between
// the title's box and the asterisk's, `below` between the asterisk's and
// what follows (the first card's box). Change these to move it.
export const titleMark = { size: 26, above: 23, below: 17 }

// How an article list builds up as its page opens, timed from the moment it
// opens (ms): the title one line at a time, then its asterisk, then the cards,
// each with the line below it. Each part fades in while rising `rise` into
// place on a spring (Framer's duration and bounce). Only the first `max`
// cards play it; those further down are shown as they are. Cards that arrive
// late, after the fetch, don't wait out delays already past.
export const appear = {
  titleLines: { rise: 10, delay: 200, stagger: 75, spring: { duration: 400, bounce: 0.4 } },
  titleMark: { rise: 5, delay: 350, spring: { duration: 200, bounce: 0 } },
  // (Two beats, at 500 and 550, felt slow; 250 felt rushed.)
  card: { rise: 5, delay: 400, spring: { duration: 200, bounce: 0 } },
  line: { rise: 5, delay: 400, spring: { duration: 200, bounce: 0 } },
  max: 5,
  // An article's page, top to bottom: the category and byline (and the
  // website's back arrow), the title, then the reading time and text. The
  // app's APPEAR.article (mobile/src/motion.js), which the app keeps its own
  // copy of; the website reads these.
  article: {
    heading: { rise: 10, delay: 300, spring: { duration: 400, bounce: 0 } },
    title: { rise: 10, delay: 350, spring: { duration: 400, bounce: 0 } },
    body: { rise: 10, delay: 400, spring: { duration: 400, bounce: 0 } },
  },
}

// A spring as the app plays it (motion.js springConfig: Framer's duration
// and bounce as stiffness and damping, at rest within 0.001), traced from 0
// to 1 for the web: how long it runs and a CSS linear() easing through it.
export const springCurve = ({ duration, bounce }) => {
  const stiffness = (2 * Math.PI / (duration / 1000)) ** 2
  const damping = 2 * (1 - bounce) * Math.sqrt(stiffness)
  const dt = 1 / 1000
  let x = 0
  let v = 0
  const trace = [0]
  while (trace.length < 5000) {
    v += (-stiffness * (x - 1) - damping * v) * dt
    x += v * dt
    trace.push(x)
    if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.001) break
  }
  trace[trace.length - 1] = 1
  const n = 40
  const points = Array.from({ length: n + 1 }, (_, i) => trace[Math.round((i / n) * (trace.length - 1))])
  return { ms: trace.length - 1, easing: `linear(${points.map((p) => +p.toFixed(4)).join(', ')})` }
}

export const cssVariables = () => {
  const vars = {
    '--paper': colors.paper,
    '--red': colors.red,
    '--placeholder': colors.placeholder,
    '--title-size': `${type.title.size}px`,
    '--title-tracking': `${type.title.tracking}em`,
    '--title-leading': type.title.leading,
    '--category-size': `${type.category.size}px`,
    '--category-tracking': `${type.category.tracking}em`,
    '--category-leading': type.category.leading,
    '--excerpt-size': `${type.excerpt.size}px`,
    '--excerpt-leading': type.excerpt.leading,
    '--byline-size': `${type.byline.size}px`,
    '--byline-line-height': `${type.byline.lineHeight}px`,
    '--excerpt-inset': `${card.excerptInset}px`,
    '--card-image-gap': `${card.imageGap}px`,
    '--title-mark-size': `${titleMark.size}px`,
    '--title-mark-above': `${titleMark.above}px`,
    '--title-mark-below': `${titleMark.below}px`,
    '--header-fade': `${headerFade}px`,
    ...Object.fromEntries(
      Object.entries({
        title: appear.titleLines,
        'title-mark': appear.titleMark,
        card: appear.card,
        line: appear.line,
        'article-heading': appear.article.heading,
        'article-title': appear.article.title,
        'article-body': appear.article.body,
      }).flatMap(([name, step]) => {
        const { ms, easing } = springCurve(step.spring)
        return [
          [`--appear-${name}-rise`, `${step.rise}px`],
          [`--appear-${name}-delay`, `${step.delay}ms`],
          [`--appear-${name}-duration`, `${ms}ms`],
          [`--appear-${name}-easing`, easing],
        ]
      })
    ),
    '--appear-title-stagger': `${appear.titleLines.stagger}ms`,
    '--illustration-aspect': card.illustrationAspect,
  }
  return `:root {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n`
}
