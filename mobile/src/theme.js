// Values from the website's CSS (src/index.css, src/ArticleCard.css).
export const colors = {
  paper: '#FFFFF2',
  bar: '#FFFFF2', // fill of the top masthead and the bottom menu
  ink: '#1a1a1a',
  red: '#FF1919',
  placeholder: '#7B61FF',
  icon: '#6b6b6b', // tab bar icons
  water: '#A6D2F7', // rivers between articles
  bank: '#9E9E9E',
}

// Custom fonts in React Native pick their weight by family name, not by
// fontWeight, so each weight is its own family (loaded in app/_layout.js).
export const fonts = {
  neighbor: 'NeighborFont-Regular',
  neighborMedium: 'NeighborFont-Medium',
  garamond: 'EBGaramond_400Regular',
  garamondMedium: 'EBGaramond_500Medium',
  monoBold: 'GeistMono_700Bold',
  mono: 'GeistMono_500Medium',
  newAmsterdam: 'NewAmsterdam_400Regular',
  paprika: 'Paprika_400Regular',
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
