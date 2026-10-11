import { useEffect, useMemo, useRef, useState } from 'react'
import { ActionSheetIOS, ActivityIndicator, Alert, Animated, Easing, Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { getLocales } from 'expo-localization'
import { Picker } from '@react-native-picker/picker'
import { useGlobalSearchParams } from 'expo-router'
import { useReducedMotion } from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import { useAccount } from './account'
import COUNTRIES from './countries'
import { i18n } from './i18n'
import { APPEAR, FadePressable, Rise, RiseLines } from './motion'
import { Neighbours } from './NeighbourLanding'
import Rule from './Rule'
import { categoryType, colors, fonts, rubriquesTitle } from './theme'

// The photo's frame and the example avatar beside it.
const FRAME = { width: 96, height: 112 }
const EXAMPLE = 84
// The avatar part's height, the same before and after a photo, so the line
// and the envelope below never move: room for the example with a
// three-line activity (the longest, 58 letters, takes three in its column).
const AVATAR_PART = 152

// The envelope's breathing, much softer than the frame's.
const BREATH = { frame: 1.035, envelope: 1.012, half: 1200 }

// The sign-up's words. The placeholders (Victor Hugo, France) stay as they
// are in both languages.
const COPY = {
  fr: {
    takeSelfie: 'Prendre un selfie',
    choosePhoto: 'Choisir une photo',
    removePhoto: 'Retirer la photo',
    cancel: 'Annuler',
    camera: 'L’appareil photo n’est pas autorisé : Réglages > The Neighbor.',
    missing: 'Le prénom, le nom et le pays sont demandés.',
    missingActivity: 'Dites ce que vous faites sur votre photo.',
    confirm: 'Envoyer votre profil ?',
    visibleWithAvatar: 'Votre prénom, votre pays et votre avatar seront visibles des autres voisins.',
    visible: 'Votre prénom et votre pays seront visibles des autres voisins.',
    send: 'Envoyer',
    firstName: 'Prénom*',
    lastName: 'Nom*',
    country: 'Pays*',
    countryLabel: (name) => `Pays : ${name ?? 'à choisir'}`,
    avatar: 'Avatar de voisin',
    optional: 'Optionnel',
    changePhoto: 'Changer la photo',
    activity: 'Activité*',
    activityPlaceholder: 'Manger des sandwiches…',
    retake: 'Reprendre la photo',
    importSelfie: 'Importer un selfie',
    // In capitals as written: see Frame.
    importSelfieCaps: 'IMPORTER\nUN SELFIE',
    sendProfile: 'Envoyer mon profil',
    close: 'Fermer',
  },
  en: {
    takeSelfie: 'Take a selfie',
    choosePhoto: 'Choose a photo',
    removePhoto: 'Remove the photo',
    cancel: 'Cancel',
    camera: 'The camera is not allowed: Settings > The Neighbor.',
    missing: 'Your first name, last name and country are needed.',
    missingActivity: 'Say what you are doing in your photo.',
    confirm: 'Send your profile?',
    visibleWithAvatar: 'Your first name, country and avatar will be visible to the other neighbors.',
    visible: 'Your first name and country will be visible to the other neighbors.',
    send: 'Send',
    firstName: 'First name*',
    lastName: 'Last name*',
    country: 'Country*',
    countryLabel: (name) => `Country: ${name ?? 'to choose'}`,
    avatar: 'Neighbor avatar',
    optional: 'Optional',
    changePhoto: 'Change the photo',
    activity: 'Activity*',
    activityPlaceholder: 'Eating sandwiches…',
    retake: 'Retake the photo',
    importSelfie: 'Upload a selfie',
    importSelfieCaps: 'UPLOAD\nA SELFIE',
    sendProfile: 'Send my profile',
    close: 'Close',
  },
}

// The countries in the reader's language and alphabetical order, as
// [code, name]. countries.js holds [code, French, English] in French order.
const countryNames = (lang) =>
  lang === 'en'
    ? COUNTRIES.map(([code, , en]) => [code, en]).sort((a, b) => a[1].localeCompare(b[1], 'en'))
    : COUNTRIES.map(([code, fr]) => [code, fr])

// The sign-up, once a new address's code is accepted: one page, chosen on
// comparison sheets. The first name, surname and country are required, in
// the landing's fields; the neighbour's avatar is optional. Before a photo,
// an empty frame that breathes ("Importer un selfie") points to the stream's
// neighbours, one at a time with their name and activity, to show what a
// photo becomes. A tap on the frame opens iOS's own action sheet (a selfie
// or a photo from the library). Once a photo is taken the example goes: the
// photo stays on the left, and beside it the activity, then required, and a
// link to take it again. Under a drawn line, the envelope sends it all: ink
// until the profile can go, then red, and iOS's alert asks first. The
// answers go to the profile (account.js).
export default function SignUpForm({ onDone }) {
  const { lang } = useGlobalSearchParams()
  const copy = COPY[lang] ?? COPY.fr
  const countries = useMemo(() => countryNames(lang), [lang])
  const { saveProfile } = useAccount()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  // Empty to start with, "France" in grey standing in, like the names'
  // placeholders. The wheel opens on the phone's region, which is chosen as
  // it opens, so most readers need only tap OK.
  const [country, setCountry] = useState(null)
  const region = useMemo(() => {
    const code = getLocales()[0]?.regionCode
    return COUNTRIES.find(([c]) => c === code)?.[0] ?? 'FR'
  }, [])
  const openCountries = () => {
    if (!country) setCountry(region)
    setChoosing(true)
  }
  const [choosing, setChoosing] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [activity, setActivity] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const ready = !!(firstName.trim() && lastName.trim() && country && (!photo || activity.trim()))
  const lift = useKeyboardLift()

  const countryName = useMemo(() => countries.find(([code]) => code === country)?.[1], [countries, country])

  // iOS's action sheet, as in Photos or Messages.
  const choosePhoto = () => {
    const options = [copy.takeSelfie, copy.choosePhoto, ...(photo ? [copy.removePhoto] : []), copy.cancel]
    ActionSheetIOS.showActionSheetWithOptions(
      { options, cancelButtonIndex: options.length - 1, destructiveButtonIndex: photo ? 2 : undefined },
      async (i) => {
        if (i === 2 && photo) return setPhoto(null)
        if (i !== 0 && i !== 1) return
        // The image is kept as base64 to upload as it is (account.js), cut
        // square by iOS's own editor.
        const options = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true }
        let result
        if (i === 0) {
          const { granted } = await ImagePicker.requestCameraPermissionsAsync()
          if (!granted) return setError(copy.camera)
          result = await ImagePicker.launchCameraAsync({ ...options, cameraType: ImagePicker.CameraType.front })
        } else {
          result = await ImagePicker.launchImageLibraryAsync(options)
        }
        if (!result.canceled) setPhoto(result.assets[0])
      },
    )
  }

  // Too soon, the envelope shakes and says what is missing; ready, iOS's
  // alert says what the other neighbours will see before anything goes.
  const submit = () => {
    if (busy) return false
    if (!ready) {
      setError(
        !firstName.trim() || !lastName.trim() || !country
          ? copy.missing
          : copy.missingActivity,
      )
      return false
    }
    setError(null)
    Keyboard.dismiss()
    Alert.alert(
      copy.confirm,
      photo ? copy.visibleWithAvatar : copy.visible,
      [
        { text: copy.cancel, style: 'cancel' },
        { text: copy.send, style: 'default', isPreferred: true, onPress: send },
      ],
    )
    return true
  }

  const send = async () => {
    setBusy(true)
    const failed = await saveProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      country: COUNTRIES.find(([code]) => code === country)[2],
      activity: activity.trim(),
      photo: photo?.base64,
    }, lang)
    setBusy(false)
    if (failed) setError(failed)
    else onDone?.()
  }

  return (
    <Animated.View style={{ transform: [{ translateY: lift.shift }] }}>
      <RiseLines style={styles.title} step={APPEAR.menu.title}>{(i18n[lang] ?? i18n.fr).signUp}</RiseLines>

      <Rise step={APPEAR.menu.subtitle}>
        <View style={styles.names}>
          <Field label={copy.firstName} placeholder="Victor" value={firstName} onChangeText={setFirstName} textContentType="givenName" autoComplete="given-name" />
          <Field label={copy.lastName} placeholder="Hugo" value={lastName} onChangeText={setLastName} textContentType="familyName" autoComplete="family-name" />
        </View>
        <Pressable onPress={openCountries} accessibilityRole="button" accessibilityLabel={copy.countryLabel(countryName)}>
          <Text style={[styles.label, styles.spaced]}>{copy.country}</Text>
          <View style={styles.choice}>
            <Text style={[styles.input, !countryName && styles.placeholder]}>{countryName ?? 'France'}</Text>
            {/* The back chevron, turned to point down. */}
            <Text style={styles.chevron}>&gt;</Text>
          </View>
          <Rule />
        </Pressable>
      </Rise>

      <Rise step={APPEAR.menu.rule}>
        <Text style={[styles.label, styles.section]}>{copy.avatar}</Text>
        <Text style={[styles.label, styles.optional]}>{copy.optional}</Text>
        <View style={styles.avatarPart}>
        {photo ? (
          <View style={styles.taken}>
            <Pressable onPress={choosePhoto} accessibilityRole="button" accessibilityLabel={copy.changePhoto}>
              <Frame photo={photo} />
            </Pressable>
            <View style={styles.words}>
              <Field
                label={copy.activity}
                value={activity}
                onChangeText={setActivity}
                placeholder={copy.activityPlaceholder}
                autoCapitalize="sentences"
                maxLength={60}
                inputStyle={styles.activity}
                inputRef={lift.ref}
                onFocus={lift.onFocus}
                onBlur={lift.onBlur}
              />
              <Pressable onPress={choosePhoto} hitSlop={10} accessibilityRole="button" style={styles.retake}>
                <Text style={styles.retakeText}>{copy.retake}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.pictures}>
            <Pressable onPress={choosePhoto} accessibilityRole="button" accessibilityLabel={copy.importSelfie}>
              <Frame invite={copy.importSelfieCaps} />
            </Pressable>
            <Text style={styles.arrow}>&gt;</Text>
            <View style={styles.example}>
              <Neighbours example size={EXAMPLE} />
            </View>
          </View>
        )}
        </View>
      </Rise>

      <Rise step={APPEAR.menu.rule} extraDelay={APPEAR.menu.stagger}>
        <Rule style={styles.line} />
        <Envelope ready={ready} busy={busy} onPress={submit} label={copy.sendProfile} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Rise>

      <CountryPicker
        visible={choosing}
        value={country}
        onChange={setCountry}
        onClose={() => setChoosing(false)}
        countries={countries}
        closeLabel={copy.close}
      />
    </Animated.View>
  )
}

// While the activity is typed, the page rises just enough for the field to
// clear the keyboard, and comes back down with it. The page doesn't scroll,
// and the other fields sit above the keyboard already.
const KEYBOARD_EASING = Easing.bezier(0.17, 0.59, 0.4, 0.77)

function useKeyboardLift() {
  const shift = useRef(new Animated.Value(0)).current
  const lifted = useRef(0)
  const field = useRef(null)
  const focused = useRef(false)
  const move = (toValue, duration = 250) => {
    lifted.current = toValue
    Animated.timing(shift, { toValue, duration, easing: KEYBOARD_EASING, useNativeDriver: true }).start()
  }
  // The field's place is measured as drawn, so the lift already applied is
  // added back.
  const clear = (keyboardTop, duration) => {
    if (!focused.current) return
    field.current?.measureInWindow((x, y, w, h) => {
      const over = y - lifted.current + h + 16 - keyboardTop
      if (over > 0) move(-over, duration)
    })
  }
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', (e) => clear(e.endCoordinates.screenY, e.duration))
    const hide = Keyboard.addListener('keyboardWillHide', (e) => move(0, e.duration))
    return () => {
      show.remove()
      hide.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return {
    shift,
    ref: field,
    // From another field, the keyboard is already up and won't show again.
    onFocus: () => {
      focused.current = true
      const metrics = Keyboard.metrics()
      if (metrics) clear(metrics.screenY)
    },
    onBlur: () => {
      focused.current = false
      if (Keyboard.isVisible()) move(0)
    },
  }
}

// The envelope and "Envoyer mon profil", breathing softly: ink until the
// profile can be sent, then red. A tap too soon shakes it; a sent profile
// flies off with it while it is saved.
function Envelope({ ready, busy, onPress, label }) {
  const reduceMotion = useReducedMotion()
  const breath = useBreath(BREATH.envelope, !reduceMotion)
  const shake = useRef(new Animated.Value(0)).current
  const color = ready ? colors.red : colors.ink

  const press = () => {
    if (onPress() || reduceMotion) return
    shake.setValue(0)
    Animated.sequence(
      [-4, 4, -3, 0].map((toValue) => Animated.timing(shake, { toValue, duration: 70, useNativeDriver: true })),
    ).start()
  }

  return (
    <Pressable onPress={press} disabled={busy} hitSlop={14} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !ready }} style={styles.send}>
      <Animated.View style={[styles.sendInner, { transform: [{ translateX: shake }, { scale: breath }] }]}>
        {busy ? (
          <ActivityIndicator color={colors.red} style={styles.envelope} />
        ) : (
          <Svg width={36} height={25.2} viewBox="0 0 40 28" style={styles.envelope}>
            <Path d="M2.6 3.4 C13 2.8 26 2.7 37.4 3.1 C37.8 10 37.7 18 37.3 25 C26 25.5 14 25.4 2.8 25.1 C2.3 18 2.3 10 2.6 3.4 Z" fill="none" stroke={color} strokeWidth={1.9} strokeLinejoin="round" />
            <Path d="M3 3.6 C9 9 14.5 13.3 20 16.4 C25.6 13.2 31 9 37.2 3.3" fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
        <Text style={[styles.sendText, { color }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  )
}

// A slow swell to `to` and back, 2.4s a breath; 1 when off.
function useBreath(to, on) {
  const breath = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!on) return
    const half = { duration: BREATH.half, easing: Easing.inOut(Easing.ease), useNativeDriver: true }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, ...half }),
        Animated.timing(breath, { toValue: 0, ...half }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [on, breath])
  return breath.interpolate({ inputRange: [0, 1], outputRange: [1, to] })
}

function Field({ label, inputStyle, inputRef, ...input }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[styles.input, styles.typed, inputStyle]}
        placeholderTextColor={colors.faint}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={40}
        selectionColor={colors.red}
        accessibilityLabel={label.replace('*', '')}
        {...input}
      />
      <Rule />
    </View>
  )
}

// The frame's hand-drawn edge, at any size.
function edgePath(w, h) {
  const x0 = 4, x1 = w - 4, y0 = 4.5, y1 = h - 4.5
  return `M${x0 + 0.5} ${y0 + 0.6} C${w * 0.32} ${y0 - 0.4} ${w * 0.62} ${y0 - 0.6} ${x1 - 0.5} ${y0 + 0.2} C${x1 + 0.1} ${h * 0.33} ${x1 + 0.2} ${h * 0.63} ${x1 - 0.7} ${y1 - 0.3} C${w * 0.62} ${y1 + 0.5} ${w * 0.32} ${y1 + 0.4} ${x0 + 0.8} ${y1} C${x0} ${h * 0.63} ${x0 - 0.1} ${h * 0.33} ${x0 + 0.5} ${y0 + 0.6} Z`
}

// The frame: dashed, breathing, with "+ Prendre un selfie" inside until a
// photo is chosen, then the photo inside a plain drawn line.
function Frame({ photo, invite }) {
  const { width, height } = FRAME
  const reduceMotion = useReducedMotion()
  const scale = useBreath(BREATH.frame, !photo && !reduceMotion)
  return (
    <Animated.View style={[styles.frame, { width, height, transform: [{ scale }] }]}>
      {photo ? <Image source={{ uri: photo.uri }} style={styles.photo} contentFit="cover" /> : null}
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={StyleSheet.absoluteFill}>
        <Path d={edgePath(width, height)} stroke={colors.ink} strokeWidth={1.3} strokeDasharray={photo ? undefined : '5 4'} fill="none" />
      </Svg>
      {photo ? null : (
        <View style={styles.invite}>
          <Text style={styles.plus}>+</Text>
          {/* In capitals as written: with textTransform, iOS lays the lines
              out at the lowercase width and they sit off centre. */}
          <Text style={styles.inviteText}>{invite}</Text>
        </View>
      )}
    </Animated.View>
  )
}

// iOS's wheel of countries, in a sheet at the foot of the screen.
function CountryPicker({ visible, value, onChange, onClose, countries, closeLabel }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.shade} onPress={onClose} accessibilityLabel={closeLabel} />
      <View style={styles.sheet}>
        <FadePressable onPress={onClose} hitSlop={12} accessibilityRole="button" style={styles.done}>
          <Text style={styles.link}>OK</Text>
        </FadePressable>
        <Picker selectedValue={value ?? 'FR'} onValueChange={onChange} itemStyle={styles.wheel}>
          {countries.map(([code, name]) => (
            <Picker.Item key={code} label={name} value={code} />
          ))}
        </Picker>
      </View>
    </Modal>
  )
}

const smallCaps = {
  ...categoryType,
  fontSize: 14,
  lineHeight: 14 * 1.1,
  letterSpacing: 14 * -0.05,
}

const styles = StyleSheet.create({
  title: {
    ...rubriquesTitle,
    marginBottom: 26,
  },
  names: {
    flexDirection: 'row',
    gap: 18,
  },
  field: {
    flex: 1,
  },
  label: {
    ...smallCaps,
  },
  spaced: {
    marginTop: 22,
  },
  section: {
    marginTop: 30,
  },
  input: {
    fontFamily: fonts.garamond,
    fontSize: 22,
    color: colors.ink,
    paddingTop: 8,
    paddingBottom: 6,
  },
  typed: {
    paddingHorizontal: 0,
  },
  placeholder: {
    color: colors.faint,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: {
    fontFamily: fonts.paprika,
    fontSize: 18,
    color: colors.ink,
    transform: [{ rotate: '90deg' }],
  },
  // In the label's capitals, grey.
  optional: {
    color: colors.muted,
    marginTop: 3,
  },
  // Before a photo: the frame, the arrow and the example, centred close
  // together.
  avatarPart: {
    height: AVATAR_PART,
  },
  pictures: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 6,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    margin: 4,
  },
  // The "+" and its words are laid out in the frame itself, centred both
  // ways: as an absolute overlay they stuck to the top.
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  invite: {
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 10,
  },
  plus: {
    fontFamily: fonts.averia,
    fontSize: 26,
    lineHeight: 28,
    color: colors.ink,
  },
  inviteText: {
    ...categoryType,
    fontSize: 12,
    lineHeight: 12 * 1.2,
    letterSpacing: 12 * -0.03,
    textTransform: 'none',
    color: colors.ink,
    textAlign: 'center',
    alignSelf: 'stretch',
    marginTop: 4,
  },
  arrow: {
    fontFamily: fonts.paprika,
    fontSize: 22,
    color: colors.ink,
  },
  // Wide enough that every activity fits in three lines, and as tall as
  // that whatever the neighbour shown, so nothing moves as they change.
  example: {
    width: 150,
    height: EXAMPLE + 63,
  },
  // Once a photo is taken: the photo on the left, the activity beside it.
  taken: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 6,
  },
  words: {
    flex: 1,
    paddingTop: 18,
  },
  activity: {
    fontSize: 19,
  },
  retake: {
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  retakeText: {
    ...categoryType,
    fontSize: 12,
    lineHeight: 12 * 1.2,
    letterSpacing: 12 * -0.03,
    color: colors.ink,
    textDecorationLine: 'underline',
    textDecorationColor: colors.faint,
  },
  error: {
    fontFamily: fonts.garamond,
    fontSize: 16,
    lineHeight: 21,
    color: colors.red,
    textAlign: 'center',
    marginTop: 14,
  },
  line: {
    marginTop: 7,
  },
  send: {
    alignSelf: 'center',
    marginTop: 41,
  },
  sendInner: {
    alignItems: 'center',
  },
  envelope: {
    height: 25.2,
    marginBottom: 8,
  },
  sendText: {
    ...categoryType,
    fontSize: 16,
    lineHeight: 16 * 1.1,
    letterSpacing: 16 * -0.05,
  },
  link: {
    ...smallCaps,
    letterSpacing: 14 * -0.03,
  },
  shade: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  sheet: {
    backgroundColor: colors.paper,
    paddingBottom: 30,
  },
  done: {
    alignSelf: 'flex-end',
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  wheel: {
    fontFamily: fonts.garamond,
    fontSize: 22,
    color: colors.ink,
  },
})
