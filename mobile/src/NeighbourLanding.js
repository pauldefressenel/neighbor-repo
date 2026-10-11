import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, StyleSheet, Text, TextInput, View } from 'react-native'
import { Image } from 'expo-image'
import { useGlobalSearchParams } from 'expo-router'
import { useIsFocused } from 'expo-router/react-navigation'
import { CODE_LENGTH, isEmail, useAccount } from './account'
import { MONTHS } from '../../shared/dates'
import { i18n } from './i18n'
import { APPEAR, FadePressable, NEIGHBOUR, Rise, RiseLines, usePlayOn } from './motion'
import Rule from './Rule'
import { avatarUrl, getNeighbours } from './supabase'
import { categoryType, colors, fonts, rubriquesTitle } from './theme'

// How many avatars ahead are loaded while one is shown. Loading all of them
// up front would be some 30 MB over a phone's data.
const AHEAD = 3

// The neighbour's avatar, under the description (120pt was too small, 150pt
// too big).
const AVATAR = 135

const MODES = {
  fr: { up: "S'inscrire", in: 'Se connecter' },
  en: { up: 'Sign up', in: 'Sign in' },
}

// The text under the address changes with the link, so choosing one shows:
// what being a neighbour brings to someone signing up, a welcome back to
// someone signing in.
// "Voisin" and "voisins" are set in italic, as the paper's own word. "News-letter" keeps
// an ordinary hyphen on purpose: the line may break after "news-", which
// fills the first line (a non-breaking hyphen was tried).
// In English, "neighbor" and "neighbors" take the italic.
const DESCRIPTIONS = {
  fr: {
    up: (
      <>
        En devenant <Text style={{ fontFamily: fonts.garamondItalic }}>voisin</Text>, vous accédez à la news-letter, à
        des mini-jeux, et bien plus encore.
      </>
    ),
    in: (
      <>
        Vous revoilà{'\u00a0'}! Vos <Text style={{ fontFamily: fonts.garamondItalic }}>voisins</Text> vous ont gardé une
        place. Le voisinage a bien changé, venez voir.
      </>
    ),
  },
  en: {
    up: (
      <>
        When becoming a <Text style={{ fontFamily: fonts.garamondItalic }}>neighbor</Text>, you get access to the
        newsletter, mini-games, and much more.
      </>
    ),
    in: (
      <>
        Welcome back! Your <Text style={{ fontFamily: fonts.garamondItalic }}>neighbors</Text> kept you a seat. The
        neighborhood has changed, come and see.
      </>
    ),
  },
}

// The sign-in's other words.
const COPY = {
  fr: {
    sent: 'Envoyé à l\u2019instant.',
    resent: 'Un nouveau code vient de partir.',
    invalid: "Cette adresse n'est pas valide.",
    codeLength: (n) => `Le code a ${n} chiffres.`,
    placeholder: 'votre adresse e-mail',
    emailLabel: (mode) => `Votre adresse e-mail, pour ${mode.toLowerCase()}`,
    change: 'Modifier',
    codeLabel: 'Le code reçu par e-mail',
    resend: 'Renvoyer',
    send: 'Envoyer',
    since: (month) => `Depuis ${month}`,
  },
  en: {
    sent: 'Just sent.',
    resent: 'A new code is on its way.',
    invalid: "This address doesn't look right.",
    codeLength: (n) => `The code has ${n} digits.`,
    placeholder: 'your e-mail address',
    emailLabel: (mode) => `Your e-mail address, to ${mode.toLowerCase()}`,
    change: 'Change',
    codeLabel: 'The code sent by e-mail',
    resend: 'Resend',
    send: 'Send',
    since: (month) => `Since ${month}`,
  },
}
const copyFor = (lang) => (COPY[lang] ? lang : 'fr')

// Voisinage for a reader who isn't signed in. Under the centred title,
// "S'inscrire" and "Se connecter" (the chosen one red), with the address
// right under them, since they say what the address is for; then what being
// a neighbour means, flush left and set like a card's excerpt (centred
// Garamond was turned down); then the neighbours one at a time, the picture
// centred and their words flush left under it. Once the address is sent, the code field opens
// under it on the same page, and the address can be changed. Both links
// lead to the same two steps; only who the reader turns out to be (a new
// address or a known one) will decide what follows the code. There is no
// dinkus: it separates articles, and there are none here. Chosen on a
// comparison sheet (option B).
export default function NeighbourLanding() {
  const { lang } = useGlobalSearchParams()
  const [mode, setMode] = useState('up')
  const l = copyFor(lang)
  return (
    <>
      <RiseLines style={styles.title} step={APPEAR.menu.title}>{(i18n[lang] ?? i18n.fr).neighborhood}</RiseLines>
      <Rise step={APPEAR.menu.subtitle}>
        <View style={styles.links}>
          {Object.entries(MODES[l]).map(([key, label]) => (
            <FadePressable
              key={key}
              onPress={() => setMode(key)}
              hitSlop={10}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === key }}
            >
              <Text style={[styles.link, mode === key && styles.chosen]}>{label}</Text>
            </FadePressable>
          ))}
        </View>
        <SignIn mode={mode} />
      </Rise>
      <Rise step={APPEAR.menu.rule}>
        {/* Keyed by the link, so choosing the other one rises the new text in. */}
        <Rise key={mode} step={APPEAR.swap}>
          <Text style={styles.description}>{DESCRIPTIONS[l][mode]}</Text>
        </Rise>
      </Rise>
      <Rise step={APPEAR.menu.rule} extraDelay={APPEAR.menu.stagger} style={styles.stage}>
        <Neighbours />
      </Rise>
    </>
  )
}

// The address, then the code, both checked by Supabase (account.js). Signing
// in with an address it doesn't know is refused; signing up with one it
// knows simply signs that neighbour in.
function SignIn({ mode }) {
  const { sendCode, verifyCode } = useAccount()
  // The e-mail is written in the app's language.
  const { lang = 'fr' } = useGlobalSearchParams()
  const copy = COPY[copyFor(lang)]
  const modes = MODES[copyFor(lang)]
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [note, setNote] = useState(copy.sent)

  const send = async () => {
    if (busy) return
    if (!isEmail(email)) {
      setError(copy.invalid)
      return
    }
    setError(null)
    setBusy(true)
    const failed = await sendCode(email.trim(), mode, lang)
    setBusy(false)
    if (failed) setError(failed)
    else {
      setSent(true)
      setNote(copy.sent)
    }
  }

  const resend = async () => {
    const failed = await sendCode(email.trim(), mode, lang)
    if (failed) setError(failed)
    else setNote(copy.resent)
  }

  const verify = async (value = code) => {
    if (busy) return
    if (value.length !== CODE_LENGTH) {
      setError(copy.codeLength(CODE_LENGTH))
      return
    }
    setError(null)
    setBusy(true)
    // On success the account signs in and the page turns into the games, so
    // only a failure has anything left to do here.
    const failed = await verifyCode(email.trim(), value, lang)
    if (failed) {
      setBusy(false)
      setCode('')
      setError(failed)
    }
  }

  const change = () => {
    setSent(false)
    setCode('')
    setError(null)
  }

  // When the reader picks the other link, the address's line draws again
  // from the left, and the field's words and arrow come back once it is
  // drawn.
  const redraw = usePlayOn(mode, APPEAR.redraw.spring)
  const afterLine = redraw.interpolate({ inputRange: [0, 1 - APPEAR.redraw.show, 1], outputRange: [0, 0, 1] })

  return (
    <>
      <View>
        <Animated.View style={[styles.row, styles.emailRow, { opacity: afterLine }]}>
          <TextInput
            style={[styles.input, sent && styles.sent]}
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              if (error) setError(null)
            }}
            onSubmitEditing={send}
            placeholder={copy.placeholder}
            placeholderTextColor={colors.faint}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
            editable={!sent && !busy}
            selectionColor={colors.red}
            accessibilityLabel={copy.emailLabel(modes[mode])}
          />
          {sent ? (
            <View style={styles.editSlot}>
              <FadePressable onPress={change} hitSlop={12} accessibilityRole="button">
                <Text style={styles.edit}>{copy.change}</Text>
              </FadePressable>
            </View>
          ) : (
            <Arrow busy={busy} onPress={send} label={copy.send} />
          )}
        </Animated.View>
        <Animated.View style={[styles.drawn, { transform: [{ scaleX: redraw }] }]}>
          <Rule />
        </Animated.View>
      </View>

      {sent ? (
        // Rises as it opens: the page's appear time has long passed, so
        // Rise plays it at once.
        <Rise step={APPEAR.menu.subtitle}>
          <Text style={styles.label}>{copy.codeLabel}</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.code]}
              value={code}
              onChangeText={(text) => {
                const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH)
                setCode(digits)
                if (error) setError(null)
                // A code offered by the keyboard comes in whole: go on.
                if (digits.length === CODE_LENGTH) verify(digits)
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              autoFocus
              editable={!busy}
              selectionColor={colors.red}
              accessibilityLabel={copy.codeLabel}
            />
            <Arrow busy={busy} onPress={() => verify()} style={styles.arrowOnCode} label={copy.send} />
          </View>
          <Rule />
          {error ? (
            <Text style={[styles.note, styles.error]}>{error}</Text>
          ) : (
            <Text style={styles.note}>
              {note}{' '}
              <Text style={styles.underline} onPress={resend} accessibilityRole="button">
                {copy.resend}
              </Text>
            </Text>
          )}
        </Rise>
      ) : error ? (
        <Text style={[styles.note, styles.error]}>{error}</Text>
      ) : null}
    </>
  )
}

// The chevron that sends a field, or a spinner while it is sent.
function Arrow({ busy, onPress, style, label }) {
  if (busy) return <ActivityIndicator color={colors.ink} style={styles.editSlot} />
  return (
    <FadePressable onPress={onPress} hitSlop={12} accessibilityRole="button" accessibilityLabel={label}>
      {/* The masthead's back chevron, pointing on. */}
      <Text style={[styles.arrow, style]}>&gt;</Text>
    </FadePressable>
  )
}

// The neighbour on show, or nothing until the first avatar has loaded (or if
// the neighbours can't be fetched: the field still works). Every couple of
// seconds it fades to the next one, and a tap doesn't stop it (stopping on
// a tap was tried).
// Only neighbours with an activity are shown, in the app's language
// (`activity_fr` / `activity_en`), else as they typed it (a neighbour not
// translated yet). The month comes without its
// year: some neighbours joined in 2025, before the dates the old database
// kept, so a year would be wrong for them.
export function Neighbours({ example = false, size = AVATAR }) {
  const { lang } = useGlobalSearchParams()
  const l = copyFor(lang)
  const [list, setList] = useState(null)
  const [index, setIndex] = useState(0)
  // `ready` is a ref, so the first avatar's arrival also bumps this to draw.
  const [, setLoaded] = useState(0)
  const ready = useRef(new Set())
  const shown = useRef(new Animated.Value(1)).current
  // Set between the fade out and the new avatar being drawn.
  const waiting = useRef(false)
  const focused = useIsFocused()

  useEffect(() => {
    let live = true
    getNeighbours()
      .then((all) => {
        const withActivity = all.filter((n) => n.activity?.trim())
        // A different order on every visit, so the first faces vary.
        for (let i = withActivity.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[withActivity[i], withActivity[j]] = [withActivity[j], withActivity[i]]
        }
        if (live) setList(withActivity)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  // Keeps the next few avatars loading, so a change never shows a blank.
  useEffect(() => {
    if (!list?.length) return
    for (let k = 0; k <= AHEAD; k++) {
      const n = list[(index + k) % list.length]
      if (ready.current.has(n.id)) continue
      Image.prefetch(avatarUrl(n.avatar_path)).then((ok) => {
        if (!ok) return
        ready.current.add(n.id)
        // The first one to arrive starts the show.
        if (ready.current.size === 1) {
          setIndex(list.indexOf(n))
          setLoaded((c) => c + 1)
        }
      })
    }
  }, [list, index])

  // Every `dwell`, fade the neighbour out, move on to the next one whose
  // avatar has loaded, and fade back in. Stops while the tab is out of
  // view.
  useEffect(() => {
    if (!list?.length || !focused) return
    const timer = setInterval(() => {
      let next = (index + 1) % list.length
      for (let k = 0; k < AHEAD && !ready.current.has(list[next].id); k++) next = (next + 1) % list.length
      if (!ready.current.has(list[next].id)) return
      Animated.timing(shown, { toValue: 0, duration: NEIGHBOUR.fade, easing: NEIGHBOUR.easing, useNativeDriver: true }).start(() => {
        // The fade back in waits for the new avatar to be on screen
        // (`appear`, from the image's onDisplay): started at once, it showed
        // the old avatar for a moment, since expo-image keeps the previous
        // picture until the next one is drawn.
        waiting.current = true
        setIndex(next)
      })
    }, NEIGHBOUR.dwell)
    return () => clearInterval(timer)
  }, [list, index, focused, shown])

  const appear = () => {
    if (!waiting.current) return
    waiting.current = false
    Animated.timing(shown, { toValue: 1, duration: NEIGHBOUR.fade, easing: NEIGHBOUR.easing, useNativeDriver: true }).start()
  }
  // In case the image never reports being drawn, come back anyway.
  useEffect(() => {
    if (!waiting.current) return
    const late = setTimeout(appear, 400)
    return () => clearTimeout(late)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const n = list?.[index]
  if (!n || !ready.current.has(n.id)) return example ? <View style={{ width: size, height: size }} /> : null
  const activity = (n[`activity_${l}`] || n.activity).trim()
  const month = MONTHS[l][new Date(n.created_at).getMonth()]
  // The picture centred, its words flush left under it.
  const image = (
    <Image
      style={{ width: size, height: size, alignSelf: 'center' }}
      source={avatarUrl(n.avatar_path)}
      contentFit="contain"
      transition={0}
      onDisplay={appear}
    />
  )

  // The sign-up's example of what a photo becomes: smaller, the name and
  // activity centred under the avatar, without the month.
  if (example) {
    return (
      <Animated.View style={{ opacity: shown }} accessible accessibilityLabel={`${n.first_name}, ${activity}`}>
        {image}
        <Text style={[styles.name, styles.exampleName]}>{n.first_name}</Text>
        <Text style={[styles.activity, styles.exampleActivity]}>{activity}</Text>
      </Animated.View>
    )
  }

  return (
    <View accessible accessibilityLabel={`${n.first_name}, ${activity}. ${COPY[l].since(month)}`}>
      <Animated.View style={[styles.neighbour, { opacity: shown }]}>
        {image}
        <Text style={styles.name}>{n.first_name}</Text>
        <Text style={styles.activity}>{activity}</Text>
        <Text style={styles.since}>{COPY[l].since(month)}</Text>
      </Animated.View>
    </View>
  )
}

// The small capitals of the activity, the month and the code's label.
// (The activity and the month at the name's 20pt were tried.)
const smallCaps = {
  ...categoryType,
  fontSize: 14,
  lineHeight: 14 * 1.1,
  letterSpacing: 14 * -0.03,
}

const styles = StyleSheet.create({
  title: {
    ...rubriquesTitle,
    marginBottom: 90,
  },
  links: {
    flexDirection: 'row',
    gap: 26,
  },
  // The categories' capitals at 16pt (22 and 18 were too big).
  link: {
    ...categoryType,
    fontSize: 16,
    lineHeight: 16 * 1.1,
    letterSpacing: 16 * -0.05,
    color: colors.ink,
  },
  chosen: {
    color: colors.red,
  },
  // The field and its arrow stand on the bottom of the row, and the arrow
  // is raised by the difference so it sits on the text's baseline rather
  // than centred against it (see `arrow`).
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  // The line grows from its left end.
  drawn: {
    transformOrigin: 'left',
  },
  // Right under the links, which stand in for its label: most of the
  // field's top padding is taken back, so the address sits close under
  // them. (Centring both was tried.)
  emailRow: {
    marginTop: -3,
  },
  input: {
    flex: 1,
    fontFamily: fonts.garamond,
    fontSize: 22,
    color: colors.ink,
    paddingTop: 12,
    paddingBottom: 6,
  },
  // The address once sent: kept, greyed, until "Modifier".
  sent: {
    color: colors.muted,
  },
  edit: {
    ...categoryType,
    fontSize: 13,
    lineHeight: 13 * 1.1,
    letterSpacing: 13 * -0.03,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
  label: {
    ...smallCaps,
    letterSpacing: 14 * -0.05,
    marginTop: 22,
  },
  code: {
    fontFamily: fonts.neighbor,
    fontSize: 30,
    letterSpacing: 30 * 0.25,
    paddingTop: 14,
  },
  // In red (ink, like the masthead's back arrow, was tried). Paprika at 24pt
  // and Garamond at 22pt reach the same depth below their baselines (6.6pt,
  // read from the fonts), so raising the arrow by the field's 6pt bottom
  // padding would put both on one line; it sits 2pt lower than that, which
  // looked better on the phone. NeighborFont, in the code field, reaches
  // 6pt, hence the smaller lift there.
  arrow: {
    fontFamily: fonts.paprika,
    fontSize: 24,
    color: colors.red,
    marginBottom: 4,
  },
  arrowOnCode: {
    marginBottom: 3.4,
  },
  // "Modifier" stays centred against the address.
  editSlot: {
    alignSelf: 'center',
  },
  note: {
    fontFamily: fonts.garamondItalic,
    fontSize: 16,
    lineHeight: 21,
    color: colors.ink,
    marginTop: 10,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  // Upright, unlike the notes (italic was tried).
  error: {
    fontFamily: fonts.garamond,
    color: colors.red,
  },
  // A card's excerpt (ArticleCard.js), flush left.
  description: {
    fontFamily: fonts.garamond,
    fontSize: 20,
    lineHeight: 20 * 1.1,
    color: colors.ink,
    marginTop: 10,
  },
  stage: {
    marginTop: 28,
  },
  // Flush left like the text above (centred was tried).
  neighbour: {
    alignItems: 'flex-start',
  },
  name: {
    ...categoryType,
    fontSize: 20,
    lineHeight: 20 * 1.1,
    letterSpacing: 20 * -0.05,
    color: colors.ink,
    marginTop: 12,
  },
  activity: {
    ...smallCaps,
    color: colors.muted,
    marginTop: 3,
  },
  since: {
    ...smallCaps,
    marginTop: 4,
  },
  exampleName: {
    fontSize: 15,
    lineHeight: 15 * 1.1,
    letterSpacing: 15 * -0.05,
    marginTop: 4,
    textAlign: 'center',
  },
  exampleActivity: {
    fontSize: 12,
    lineHeight: 12 * 1.15,
    letterSpacing: 12 * -0.03,
    marginTop: 1,
    textAlign: 'center',
  },
})
