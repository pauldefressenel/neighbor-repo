import { useState } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from './theme'

// The running text of an article (ArticleScreen.js) and of A Propos: Portable
// Text paragraphs in EB Garamond, the first opening on a drop cap, then any
// poems.
export default function ArticleText({ body = [], poems = [] }) {
  const paragraphs = body.filter((block) => block._type === 'block')
  return (
    <>
      {paragraphs.map((block, i) =>
        i === 0 ? (
          <DropCapParagraph key={block._key} spans={block.children ?? []} />
        ) : (
          <Text key={block._key} style={styles.paragraph}>
            <Spans spans={block.children ?? []} />
          </Text>
        ),
      )}
      {poems.map((poem) => (
        <View key={poem._key} style={styles.poem}>
          {poem.poemTitle ? <Text style={styles.poemTitle}>{poem.poemTitle}</Text> : null}
          {(poem.poemContent ?? []).filter((block) => block._type === 'block').map((block) => (
            <Text key={block._key} style={styles.poemLine}>
              <Spans spans={block.children ?? []} />
            </Text>
          ))}
        </View>
      ))}
    </>
  )
}

// A block's spans. Italic and bold have their own font families (theme.js);
// `citation` is the website's quieter italic. An e-mail address opens Mail.
function Spans({ spans }) {
  return spans.map((span, i) => (
    <Text key={span._key ?? i} style={markStyle(span.marks)}>
      {withMailLinks(span.text ?? '')}
    </Text>
  ))
}

const markStyle = (marks = []) =>
  marks.includes('citation') ? styles.citation : marks.includes('em') ? styles.em : marks.includes('strong') ? styles.strong : null

const EMAIL = /([\w.+-]+@[\w-]+\.[\w.]+)/

const withMailLinks = (text) =>
  text.split(EMAIL).map((part, i) =>
    i % 2 ? (
      <Text key={i} style={styles.link} onPress={() => Linking.openURL(`mailto:${part}`)} accessibilityRole="link">
        {part}
      </Text>
    ) : (
      part
    ),
  )

// Minutes to read the text and any poems, at 230 words a minute (the usual
// figure for reading on screen), rounded, and never under one.
const WORDS_PER_MINUTE = 230

export const readingMinutes = (article) => {
  const blocks = [...(article?.body ?? []), ...(article?.poems ?? []).flatMap((poem) => poem.poemContent ?? [])]
  const words = blocks
    .flatMap((block) => block.children ?? [])
    .reduce((sum, span) => sum + (span.text?.match(/\S+/g)?.length ?? 0), 0)
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

// The spans between two offsets into their joined text.
const sliceSpans = (spans, start, end) => {
  const out = []
  let pos = 0
  for (const span of spans) {
    const text = span.text ?? ''
    const from = Math.max(start, pos)
    const to = Math.min(end, pos + text.length)
    if (from < to) out.push({ ...span, text: text.slice(from - pos, to - pos) })
    pos += text.length
  }
  return out
}

// The opening paragraph, its first letter dropped across DROP.lines lines as
// on the website. React Native can't float text around a letter, so the
// paragraph is laid out once, invisibly, at the width beside the letter; the
// lines that fit beside it are drawn there, and the rest runs full width
// underneath. Until that's measured the paragraph is held back, so it never
// jumps.
function DropCapParagraph({ spans }) {
  const text = spans.map((span) => span.text ?? '').join('')
  const capLength = text.match(DROPPED)?.[0].length ?? 0
  const [width, setWidth] = useState(0)
  const [capWidth, setCapWidth] = useState(0)
  const [split, setSplit] = useState(null)
  const besideWidth = width - capWidth - DROP.gap
  const capLetter = text.slice(0, capLength).trim()

  const measured = (e) => {
    const beside = e.nativeEvent.lines.slice(0, DROP.lines)
    setSplit(capLength + beside.reduce((sum, line) => sum + line.text.length, 0))
  }

  if (!capLength) {
    return (
      <Text style={styles.paragraph}>
        <Spans spans={spans} />
      </Text>
    )
  }
  const ready = split !== null && capWidth > 0
  return (
    <View
      style={styles.dropParagraph}
      // Only a new width calls for measuring again: the height changes as
      // soon as the split is drawn.
      onLayout={(e) => {
        const next = e.nativeEvent.layout.width
        if (next === width) return
        setWidth(next)
        setSplit(null)
      }}
    >
      {width > 0 && capWidth > 0 ? (
        <Text
          key={besideWidth}
          style={[styles.body, styles.measure, { width: besideWidth }]}
          onTextLayout={measured}
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Spans spans={sliceSpans(spans, capLength, text.length)} />
        </Text>
      ) : null}
      <View style={[styles.dropRow, !ready && styles.hidden]}>
        {/* As tall as the lines beside it. A letter that reaches past its
            own box (a J's tail and swash) overflows it, into the margin and
            the third line, rather than pushing them away. */}
        <View style={styles.capBox}>
          <Text style={styles.cap} onLayout={(e) => setCapWidth(e.nativeEvent.layout.width - 2 * DROP.bleed)}>
            {capLetter}
          </Text>
        </View>
        <Text style={[styles.body, { width: besideWidth > 0 ? besideWidth : undefined }]}>
          <Spans spans={sliceSpans(spans, capLength, split ?? text.length)} />
        </Text>
      </View>
      {ready && split < text.length ? (
        <Text style={styles.body}>
          <Spans spans={sliceSpans(spans, split, text.length).map((span, i) => (i === 0 ? { ...span, text: span.text.trimStart() } : span))} />
        </Text>
      ) : null}
    </View>
  )
}

// The article text: the website's 21px (the byline's size too), on tighter
// lines than its 1.55 (32.55). Paragraphs are 1.4em apart, as there.
// (Hyphenation was tried and rejected.)
const BODY = 21
const LINE = 31

// The drop cap: NeighborFont, 4pt from the text (the website's 10px was too
// wide), over two lines. The
// website's 72px was too tall beside the app's lines; `size` and `drop` were
// set in the simulator so the letter's top meets the first line's capitals
// and its foot sits on the second line's baseline. Measure again on an L
// whenever the text's size or line height changes: scaling them by
// proportion drifted.
// `bleed` is room drawn around the letter (see `cap`).
const DROP = { size: 58, lines: 2, gap: 4, drop: -6, bleed: 24 }

// What drops: the first letter, with any opening punctuation before it (as
// with CSS's ::first-letter) and an elided apostrophe after it ("C’", "L'"),
// or a whole opening number or time, with a full stop right after it
// ("11:57.", "1984").
const DROPPED = /^[\s«“"'‘(]*(?:\d+(?:[:.,h]\d+)*\.?|[A-Za-zÀ-ÖØ-öø-ÿŒœ]['’]?|\S)/

const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.garamond,
    fontSize: BODY,
    lineHeight: LINE,
    color: colors.ink,
  },
  paragraph: {
    fontFamily: fonts.garamond,
    fontSize: BODY,
    lineHeight: LINE,
    color: colors.ink,
    marginBottom: BODY * 1.4,
  },
  dropParagraph: {
    marginBottom: BODY * 1.4,
  },
  capBox: {
    height: LINE * DROP.lines,
  },
  dropRow: {
    flexDirection: 'row',
    gap: DROP.gap,
  },
  cap: {
    fontFamily: fonts.neighbor,
    fontSize: DROP.size,
    lineHeight: DROP.size * 1.3,
    color: colors.ink,
    // iOS clips a glyph to its text box, which hugs the letter's advance and
    // ends just below the baseline, so a J lost its tail and the left of its
    // swash. The padding draws a margin around the letter, and the negative
    // margins take it back out of the layout, so the letter takes up its
    // usual room and the third line still runs full width.
    padding: DROP.bleed,
    marginTop: DROP.drop - DROP.bleed,
    marginHorizontal: -DROP.bleed,
    marginBottom: -DROP.bleed,
  },
  measure: {
    position: 'absolute',
    opacity: 0,
  },
  hidden: {
    opacity: 0,
  },
  em: {
    fontFamily: fonts.garamondItalic,
  },
  strong: {
    fontFamily: fonts.garamondMedium,
  },
  citation: {
    fontFamily: fonts.garamondItalic,
    color: '#555',
    fontSize: BODY * 0.95,
  },
  // A poem: 48px above, its title in 24px, its lines 0.4em apart.
  poem: {
    marginTop: 48 - BODY * 1.4,
  },
  poemTitle: {
    fontFamily: fonts.garamond,
    fontSize: 24,
    lineHeight: 24 * 1.2,
    color: colors.ink,
    marginBottom: 24,
  },
  poemLine: {
    fontFamily: fonts.garamond,
    fontSize: BODY,
    lineHeight: LINE,
    color: colors.ink,
    marginBottom: BODY * 0.4,
  },
  link: {
    textDecorationLine: 'underline',
  },
})
