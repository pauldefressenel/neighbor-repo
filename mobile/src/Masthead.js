import { useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { router, useGlobalSearchParams, usePathname } from 'expo-router'
import { useReducedMotion } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { i18n } from './i18n'
import Rule from './Rule'
import { FadePressable, PAGE_REDUCED, useFade, usePop } from './motion'
import { categoryType, colors, fonts } from './theme'

// The bar at the top of every screen. It sits outside the scrolling content
// so it stays put, and spans the full width so its hand-drawn rule runs edge
// to edge. The wordmark is centred between two equal slots: an optional back
// arrow (`onBack`) on the left and the language on the right. The arrow
// pops in as a rubrique opens (BACK_POP in motion.js), or just fades with
// Reduce Motion on, and keeps its last handler while it goes so the slot
// never jumps.
export default function Masthead({ onBack, backLabel = 'Retour' }) {
  const insets = useSafeAreaInsets()
  const lastBack = useRef(onBack)
  if (onBack) lastBack.current = onBack
  const reduceMotion = useReducedMotion()
  const pop = usePop(!!onBack)
  const fade = useFade(!!onBack, PAGE_REDUCED)
  const backStyle = reduceMotion ? { opacity: fade } : pop
  return (
    <View style={styles.masthead}>
      <View style={[styles.row, { paddingTop: insets.top + 12 }]}>
        <View style={styles.slot}>
          {lastBack.current ? (
            <Animated.View
              style={backStyle}
              pointerEvents={onBack ? 'auto' : 'none'}
              aria-hidden={!onBack}
            >
              <FadePressable
                onPress={() => lastBack.current?.()}
                disabled={!onBack}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={backLabel}
              >
                {/* The Rubriques list's chevron, mirrored to point back. */}
                <Text style={styles.back}>&gt;</Text>
              </FadePressable>
            </Animated.View>
          ) : null}
        </View>
        <Text style={styles.logo}>The Neighbor</Text>
        {/* As wide as the back arrow's slot, so the wordmark stays
            centred. */}
        <View style={[styles.slot, styles.languageSlot]}>
          <Language />
        </View>
      </View>
      <Rule />
    </View>
  )
}

// Both languages side by side, FR then EN: the current one in ink, the
// other faint (the current one in red, the other in ink, was tried). A tap
// anywhere on the pair shows the same page in the other language (it
// replaced a selector that opened a row with the other language beside it). Article slugs differ between languages, so from an
// article it goes to the list the article was opened from. The account
// (account.js) sits above the [lang] segment, so it survives the switch.
function Language() {
  const { lang } = useGlobalSearchParams()
  const pathname = usePathname()
  const t = i18n[lang] ?? i18n.fr
  const other = t.switchTo

  const choose = () => {
    const parts = pathname.split('/').filter(Boolean).slice(1)
    let rest = parts
    if (parts[0] === 'articles') rest = []
    else if (parts[0] === 'rubriques' && parts.length > 2) rest = parts.slice(0, 2)
    router.replace(`/${[other, ...rest].join('/')}`)
  }

  return (
    <FadePressable
      onPress={choose}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={i18n[other].language}
      style={styles.languages}
    >
      <Text style={[styles.language, lang === 'en' && styles.faint]}>FR</Text>
      <Text style={[styles.language, lang !== 'en' && styles.faint]}>EN</Text>
    </FadePressable>
  )
}

const styles = StyleSheet.create({
  masthead: {
    backgroundColor: colors.bar,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  // Wide enough for "FR EN" and its inset; both slots share it so the
  // wordmark stays centred.
  slot: {
    width: 64,
  },
  // The language and the wordmark stand on the same baseline (both
  // `alignSelf: 'baseline'`), rather than being centred against each
  // other; the back arrow's slot stays centred in the row.
  // 8pt further in than the row's 20pt padding, so the language ends 28pt
  // from the screen's edge.
  languageSlot: {
    alignItems: 'flex-end',
    alignSelf: 'baseline',
    paddingRight: 8,
  },
  // The cards' category type, in ink, at 16pt.
  language: {
    ...categoryType,
    fontSize: 16,
    lineHeight: 16 * 1.1,
    letterSpacing: 16 * -0.05,
    color: colors.ink,
  },
  languages: {
    flexDirection: 'row',
    gap: 7,
  },
  faint: {
    color: colors.faint,
  },
  back: {
    fontFamily: fonts.paprika,
    fontSize: 23,
    color: colors.ink,
    transform: [{ scaleX: -1 }],
    alignSelf: 'flex-start',
  },
  logo: {
    alignSelf: 'baseline',
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.neighbor,
    fontSize: 28,
    color: colors.ink,
  },
})
