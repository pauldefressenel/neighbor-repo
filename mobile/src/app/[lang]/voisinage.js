import { useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useScrollToTop } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import { isEmail, useAccount } from '../../account'
import Dinkus from '../../Dinkus'
import { CheckBox } from '../../DrawnIcons'
import Masthead from '../../Masthead'
import { APPEAR, AppearContext, FadePressable, PRESS, Rise, RiseLines } from '../../motion'
import Rule from '../../Rule'
import { categoryType, colors, fonts, menu as menuStyle } from '../../theme'

// The games, for readers who have signed up. They don't exist yet: the list
// is laid out like the Rubriques list, with names to be decided.
const GAMES = [
  { name: 'Mots croisés', subtitle: 'Une grille par numéro' },
  { name: 'Qui a écrit ?', subtitle: "Retrouver l'auteur d'une phrase" },
  { name: 'Le Mot juste', subtitle: 'Un mot par jour' },
]

// Voisinage: signed out, the sign-up form (an e-mail address and the
// newsletter); signed up, the games, then the reader's account.
export default function VoisinageScreen() {
  const { member } = useAccount()
  const scroll = useRef(null)
  useScrollToTop(scroll)
  // The page builds up the first time it is shown, and again when signing
  // up or out swaps its content.
  const shown = useRef(Date.now())
  const lastMember = useRef(member)
  if (!!lastMember.current !== !!member) shown.current = Date.now()
  lastMember.current = member
  const reduceMotion = useReducedMotion()

  return (
    <View style={styles.screen}>
      <Masthead />
      <KeyboardAvoidingView style={styles.screen} behavior="padding">
        <AppearContext.Provider value={{ since: shown.current, still: reduceMotion }}>
          <ScrollView
            ref={scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {member ? <Neighbourhood key="member" /> : <SignUp key="signup" />}
          </ScrollView>
        </AppearContext.Provider>
      </KeyboardAvoidingView>
    </View>
  )
}

function SignUp() {
  const { signUp } = useAccount()
  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const submit = async () => {
    if (!isEmail(email)) {
      setError('Cette adresse ne semble pas valide.')
      return
    }
    setError(null)
    setSending(true)
    await signUp(email.trim(), newsletter)
  }

  return (
    <>
      <RiseLines style={styles.title} step={APPEAR.menu.title}>Voisinage</RiseLines>
      <Rise step={APPEAR.dinkus}>
        <Dinkus style={styles.dinkus} />
      </Rise>
      <Rise step={APPEAR.article.body}>
        <Text style={styles.text}>
          Inscrivez-vous pour rejoindre le voisinage : les jeux du Neighbor et, si vous le voulez, notre lettre.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Votre adresse e-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              if (error) setError(null)
            }}
            onSubmitEditing={submit}
            placeholder="vous@exemple.fr"
            placeholderTextColor={colors.faint}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
            editable={!sending}
            selectionColor={colors.red}
          />
          <Rule />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <NewsletterBox checked={newsletter} onToggle={() => setNewsletter(!newsletter)} />

        <FadePressable style={styles.button} pressScale={PRESS.scale} onPress={submit} disabled={sending} accessibilityRole="button">
          {sending ? <ActivityIndicator color={colors.paper} /> : <Text style={styles.buttonText}>S'inscrire</Text>}
        </FadePressable>
        <Text style={styles.small}>Gratuit. Vous pourrez vous désinscrire à tout moment.</Text>
      </Rise>
    </>
  )
}

function Neighbourhood() {
  const { member, setNewsletter, signOut } = useAccount()
  const menu = APPEAR.menu
  return (
    <>
      <RiseLines style={menuStyle.title} step={menu.title}>Voisinage</RiseLines>
      <Rise step={menu.subtitle}>
        <Text style={styles.sectionLabel}>Jeux</Text>
      </Rise>
      {GAMES.map((game, i) => (
        <View key={game.name} style={menuStyle.block}>
          <Rise step={menu.name} extraDelay={i * menu.stagger} style={styles.line}>
            <Text style={menuStyle.name}>{i + 1}. {game.name}</Text>
            <Text style={styles.soon}>Bientôt</Text>
          </Rise>
          <Rise step={menu.subtitle} extraDelay={i * menu.stagger}>
            <Text style={menuStyle.subtitle}>{game.subtitle}</Text>
          </Rise>
          <Rise step={menu.rule} extraDelay={i * menu.stagger}>
            <Rule style={menuStyle.rule} />
          </Rise>
        </View>
      ))}

      <Rise step={menu.rule} extraDelay={GAMES.length * menu.stagger}>
        <Text style={styles.sectionLabel}>Votre compte</Text>
        <Text style={styles.email}>{member.email}</Text>
        <NewsletterBox checked={member.newsletter} onToggle={() => setNewsletter(!member.newsletter)} />
        <Pressable onPress={signOut} hitSlop={8} accessibilityRole="button" style={styles.signOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </Pressable>
      </Rise>
    </>
  )
}

function NewsletterBox({ checked, onToggle }) {
  return (
    <Pressable style={styles.option} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <CheckBox checked={checked} />
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>Recevoir la lettre du Neighbor</Text>
        <Text style={styles.optionNote}>Les nouveaux textes et les nouvelles du journal, par e-mail.</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: menuStyle.body.paddingHorizontal,
    paddingBottom: 60,
  },
  // The title's spacing on an article list (ArticleList.js).
  title: {
    ...menuStyle.title,
    marginBottom: 22.7,
  },
  dinkus: {
    marginBottom: 30,
  },
  text: {
    fontFamily: fonts.garamond,
    fontSize: 21,
    lineHeight: 31,
    color: colors.ink,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  field: {
    marginTop: 36,
  },
  label: {
    ...categoryType,
    fontSize: 14,
    lineHeight: 14 * 1.1,
    letterSpacing: 14 * -0.05,
  },
  input: {
    fontFamily: fonts.garamond,
    fontSize: 22,
    color: colors.ink,
    paddingTop: 10,
    paddingBottom: 6,
  },
  error: {
    fontFamily: fonts.garamondItalic,
    fontSize: 16,
    color: colors.red,
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 30,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.garamondMedium,
    fontSize: 19,
    lineHeight: 23,
    color: colors.ink,
  },
  optionNote: {
    fontFamily: fonts.garamondItalic,
    fontSize: 16,
    lineHeight: 21,
    color: colors.ink,
    marginTop: 2,
  },
  button: {
    marginTop: 40,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.neighbor,
    fontSize: 24,
    color: colors.paper,
  },
  small: {
    fontFamily: fonts.garamondItalic,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 14,
  },
  // A red heading over each part of the signed-in page, in the cards'
  // category type.
  sectionLabel: {
    ...categoryType,
    marginBottom: 28,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  soon: {
    fontFamily: fonts.garamondItalic,
    fontSize: 16,
    color: colors.ink,
  },
  email: {
    fontFamily: fonts.garamondMediumItalic,
    fontSize: 21,
    lineHeight: 31,
    color: colors.ink,
    marginTop: -12,
  },
  signOut: {
    alignSelf: 'flex-start',
    marginTop: 30,
  },
  signOutText: {
    fontFamily: fonts.garamondItalic,
    fontSize: 16,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
})
