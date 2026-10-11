import { RUBRIQUES } from '../../shared/sections'

// The app's three rubriques, from the list the website and the Studio share
// (shared/sections.js), with French slugs in both languages. `label` and
// `subtitle` (the small line under each name in the Rubriques list) are keyed
// by language. The order is the order of the Rubriques list.
export const SECTIONS = RUBRIQUES.map((r) => ({
  slug: r.slug.fr,
  label: r.label,
  subtitle: r.subtitle,
  sanity: r.sanity,
}))

export const findSection = (slug) => SECTIONS.find((s) => s.slug === slug)
