import { useFormValue } from 'sanity'
import { Card, Text } from '@sanity/ui'
import { RUBRIQUES } from '../shared/sections.js'

// The Rubrique field (`section`), read-only: the rubrique's name in the
// article's own language (shared/sections.js), "Essais & Critiques" on a
// French article, "Essays & Criticism" on an English one. What is stored is
// the same code in both (`literature-review`, …).
export function RubriqueInput({ value }) {
  const language = useFormValue(['language'])
  const rubrique = RUBRIQUES.find((r) => r.sanity.includes(value))
  return (
    <Card padding={3} radius={2} tone="transparent" border>
      <Text size={1} muted={!rubrique}>
        {rubrique ? rubrique.label[language] ?? rubrique.label.fr : value ?? '—'}
      </Text>
    </Card>
  )
}
