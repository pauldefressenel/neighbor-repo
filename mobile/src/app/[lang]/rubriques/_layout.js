import PageStack from '../../../PageStack'

// The Rubriques list, with a rubrique pushed on top of it, and an article on
// top of that (PageStack.js).
export default function RubriquesLayout() {
  return (
    <PageStack
      root="/rubriques"
      backLabel={(segments, t) => (segments.at(-1) === '[section]' ? t.backToRubriques : t.back)}
    />
  )
}
