// Values from the website's CSS (src/index.css, src/ArticleCard.css).
export const colors = {
  paper: '#FFFFF2',
  bar: '#FFFFF2', // fill of the top masthead and the bottom menu
  ink: '#000000', // full black; the website's text is #1a1a1a
  red: '#FF1919',
  placeholder: '#7B61FF',
  water: '#A6D2F7', // rivers between articles
  bank: '#9E9E9E',
}

// Custom fonts in React Native pick their weight by family name, not by
// fontWeight, so each weight is its own family (loaded in app/_layout.js).
export const fonts = {
  neighbor: 'NeighborFont-Regular',
  neighborMedium: 'NeighborFont-Medium',
  garamond: 'EBGaramond_400Regular',
  garamondItalic: 'EBGaramond_400Regular_Italic',
  garamondMedium: 'EBGaramond_500Medium',
  garamondMediumItalic: 'EBGaramond_500Medium_Italic',
  monoBold: 'GeistMono_700Bold',
  mono: 'GeistMono_500Medium',
  newAmsterdam: 'NewAmsterdam_400Regular',
  paprika: 'Paprika_400Regular',
  averia: 'AveriaLibre_400Regular', // card categories
  averiaSerif: 'AveriaSerifLibre_400Regular', // the dinkus under page titles
}

// The big centred title at the top of a page (Rubriques, a rubrique, …).
export const pageTitle = {
  fontFamily: fonts.neighbor,
  fontSize: 40,
  lineHeight: 44,
  color: colors.ink,
  textAlign: 'center',
  marginTop: 30,
  marginBottom: 15,
}

// The title of the Rubriques list and of every article page (En Couverture
// and each rubrique), so the title sits in the same place from page to page.
// The space below it is set by each page.
// The type shared by page titles and article titles, so the two match:
// 35pt, -0.03em letter-spacing, 1.1 line height.
export const titleType = {
  fontFamily: fonts.neighbor,
  fontSize: 35,
  lineHeight: 35 * 1.1,
  letterSpacing: 35 * -0.03,
  color: colors.ink,
}

// The red category over an article card, also the Rubriques list's and A
// Propos's subtitles: 18pt, -0.05em letter-spacing, 1.1em line height.
export const categoryType = {
  fontFamily: fonts.averia,
  fontSize: 18,
  lineHeight: 18 * 1.1,
  letterSpacing: 18 * -0.05,
  color: colors.red,
  textTransform: 'uppercase',
}

export const rubriquesTitle = {
  ...titleType,
  // With ArticleList's titleStyle margin, sets the space above and below the
  // title on an article page.
  marginTop: 41.5,
  // NeighborFont's descenders run below a tight line box, so the q needs room.
  paddingBottom: 4,
  textAlign: 'center',
}

// The Rubriques list's layout: a page of titled blocks, each with a small red
// subtitle and ruled off below.
export const menu = {
  body: {
    flex: 1,
    paddingHorizontal: 22,
  },
  title: {
    ...rubriquesTitle,
    marginBottom: 73,
  },
  block: {
    marginBottom: 56,
  },
  // In the page title's type, number included.
  name: {
    ...titleType,
    flexShrink: 1,
    // Room for the q's tail below NeighborFont's tight line box, taken back
    // by the negative margin so the gaps around the name stay as they are.
    paddingBottom: 6,
    marginBottom: -6,
  },
  // In the card categories' type, smaller.
  subtitle: {
    ...categoryType,
    fontSize: 16,
    lineHeight: 16 * 1.1,
    letterSpacing: 16 * -0.05,
    marginTop: 4,
  },
  rule: {
    marginTop: 6,
  },
}
