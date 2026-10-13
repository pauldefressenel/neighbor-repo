// Minutes to read the text and any poems, at 230 words a minute, as in the
// app, rounded, and never under one.
const WORDS_PER_MINUTE = 230

export const readingMinutes = ({ body, poems }) => {
  const blocks = [...(body ?? []), ...(poems ?? []).flatMap((poem) => poem.poemContent ?? [])]
  const words = blocks
    .flatMap((block) => block.children ?? [])
    .reduce((sum, span) => sum + (span.text?.match(/\S+/g)?.length ?? 0), 0)
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
