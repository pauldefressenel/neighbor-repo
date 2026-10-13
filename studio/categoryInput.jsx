import { set, unset, useFormValue } from 'sanity'
import { Select } from '@sanity/ui'
import { RUBRIQUES } from '../shared/sections.js'

// The categories an article may take: its rubrique's list
// (shared/sections.js) in its language, or null where the category is free.
export function categoriesFor(section, language) {
  const rubrique = RUBRIQUES.find((r) => r.sanity.includes(section))
  return rubrique?.categories?.map((c) => c[language] ?? c.en) ?? null
}

// The Category field: a list where the rubrique has one, else plain text. A
// value outside the list (written before it) stays shown until changed.
export function CategoryInput(props) {
  const { value, onChange, elementProps } = props
  const section = useFormValue(['section'])
  const language = useFormValue(['language'])
  const options = categoriesFor(section, language)
  if (!options) return props.renderDefault(props)
  return (
    <Select
      {...elementProps}
      value={value ?? ''}
      onChange={(e) => onChange(e.currentTarget.value ? set(e.currentTarget.value) : unset())}
    >
      <option value="">—</option>
      {value && !options.includes(value) && <option value={value}>{value}</option>}
      {options.map((c) => <option key={c} value={c}>{c}</option>)}
    </Select>
  )
}
