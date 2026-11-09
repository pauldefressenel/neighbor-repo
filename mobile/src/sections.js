import { RUBRIQUES } from '../../shared/sections'

// The app's three rubriques, from the list the website and the Studio share
// (shared/sections.js), with French slugs in both languages. `label` and
// `subtitle` (the small line under each name in the Rubriques menu) are
// keyed by language. The order is the order of the menu.
export const SECTIONS = RUBRIQUES.map((r) => ({
  slug: r.slug.fr,
  label: r.label,
  subtitle: r.subtitle,
  sanity: r.sanity,
}))

// Voisinage isn't finished, so the first App Store release ships without it:
// while this is false its tab is left out of the bar (TabBar.js), its route
// sends to A La Une, and no account is looked up on launch (account.js). The
// website's own switch is NEIGHBORHOOD_OPEN (src/sections.js).
export const VOISINAGE_OPEN = false

export const findSection =(slug) => SECTIONS.find((s) => s.slug === slug)
