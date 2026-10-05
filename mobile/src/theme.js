// Values from the website's CSS (src/index.css, src/ArticleCard.css).
export const colors = {
  paper: '#FFFFF2',
  bar: '#FFFFF2', // fill of the top masthead and the bottom menu
  ink: '#1a1a1a',
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
  londrina: 'LondrinaSolid_300Light', // card categories
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

// The title of the Rubriques list and of every article page (A La Une and
// each rubrique), so the title sits in the same place from page to page. The
// space below it is set by each page.
export const rubriquesTitle = {
  // On an article page, this and ArticleList's titleStyle margin centre the
  // title between the masthead's rule and the line above the first card.
  marginTop: 41.5,
  // NeighborFont's descenders run below a tight line box, so the q needs room.
  paddingBottom: 4,
  textAlign: 'center',
  fontFamily: fonts.neighbor,
  fontSize: 35,
  lineHeight: 50,
  letterSpacing: -0.35,
  color: colors.ink,
}

// The Rubriques list's layout, shared with A Propos: a page of titled blocks,
// each with a small red subtitle and ruled off below.
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
    marginBottom: 36,
  },
  name: {
    flexShrink: 1,
    // Room for the q's tail below NeighborFont's tight line box, taken back
    // by the negative margin so the gaps around the name stay as they are.
    paddingBottom: 6,
    marginBottom: -6,
    fontFamily: fonts.neighbor,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  // Set in capitals, so its text carries no accents.
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.newAmsterdam,
    fontSize: 17,
    letterSpacing: 0.45,
    textTransform: 'uppercase',
    color: colors.red,
  },
  // A block's running text, under its subtitle.
  text: {
    marginTop: 8,
    fontFamily: fonts.garamond,
    fontSize: 20,
    lineHeight: 24,
    color: colors.ink,
  },
  rule: {
    marginTop: 6,
  },
}
