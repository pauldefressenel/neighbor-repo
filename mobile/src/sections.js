import { RUBRIQUES } from '../../shared/sections'

// The app's three rubriques, from the list the website and the Studio share
// (shared/sections.js), with French slugs in both languages. `label` and
// `subtitle` are keyed by language. The Rubriques tab shows the first two
// after A La Une; Portraits has its own tab.
export const SECTIONS = RUBRIQUES.map((r) => ({
  slug: r.slug.fr,
  label: r.label,
  subtitle: r.subtitle,
  sanity: r.sanity,
}))

export const findSection = (slug) => SECTIONS.find((s) => s.slug === slug)
