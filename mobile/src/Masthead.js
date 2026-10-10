import { useRef, useState } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { router, useGlobalSearchParams, usePathname } from 'expo-router'
import { useReducedMotion } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { i18n } from './i18n'
import Rule from './Rule'
import { FadePressable, PAGE_REDUCED, useFade, usePop } from './motion'
import { colors, fonts } from './theme'

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

// The current language, which opens a row with the other one, as on the
// website (Layout.jsx). The other language shows to its left, in red,
// between it and the wordmark: hung below the masthead it would sit outside
// the masthead's bounds, where iOS doesn't deliver touches. Choosing it
// shows the same page in that language. Article slugs differ between
// languages, so from an article it goes to the list the article was opened
// from. The account (account.js) sits above the [lang] segment, so it
// survives the switch.
function Language() {
  const { lang } = useGlobalSearchParams()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const t = i18n[lang] ?? i18n.fr
  const other = t.switchTo

  const choose = () => {
    setOpen(false)
    const parts = pathname.split('/').filter(Boolean).slice(1)
    let rest = parts
    if (parts[0] === 'articles') rest = []
    else if (parts[0] === 'rubriques' && parts.length > 2) rest = parts.slice(0, 2)
    router.replace(`/${[other, ...rest].join('/')}`)
  }

  return (
    <View>
      <FadePressable
        onPress={() => setOpen(!open)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t.language}
        accessibilityState={{ expanded: open }}
      >
        <Text style={styles.language}>{lang === 'en' ? 'En' : 'Fr'}</Text>
      </FadePressable>
      {open ? (
        <View style={styles.otherLanguage}>
          <FadePressable onPress={choose} hitSlop={12} accessibilityRole="button" accessibilityLabel={i18n[other].language}>
            <Text style={[styles.language, styles.otherText]}>{other === 'en' ? 'En' : 'Fr'}</Text>
          </FadePressable>
        </View>
      ) : null}
    </View>
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
  slot: {
    width: 32,
  },
  languageSlot: {
    alignItems: 'flex-end',
  },
  language: {
    fontFamily: fonts.garamondMedium,
    fontSize: 19,
    color: colors.ink,
  },
  otherLanguage: {
    position: 'absolute',
    top: 0,
    right: '100%',
    marginRight: 14,
  },
  otherText: {
    color: colors.red,
  },
  back: {
    fontFamily: fonts.paprika,
    fontSize: 23,
    color: colors.ink,
    transform: [{ scaleX: -1 }],
    alignSelf: 'flex-start',
  },
  logo: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.neighbor,
    fontSize: 28,
    color: colors.ink,
  },
})
