import { RUBRIQUES } from '../../shared/sections'

// The app's three rubriques, from the list the website and the Studio share
// (shared/sections.js), in French with French slugs. The order is the order
// of the Rubriques list; `subtitle` is the small line under each name there.
export const SECTIONS = RUBRIQUES.map((r) => ({
  slug: r.slug.fr,
  label: r.label.fr,
  subtitle: r.subtitle.fr,
  sanity: r.sanity,
}))

export const findSection = (slug) => SECTIONS.find((s) => s.slug === slug)
