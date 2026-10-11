import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from 'expo-router'
import { useScrollToTop } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import { useAccount } from '../../account'
import { CheckBox } from '../../DrawnIcons'
import Masthead from '../../Masthead'
import NeighbourLanding from '../../NeighbourLanding'
import SignUpForm from '../../SignUpForm'
import { APPEAR, AppearContext, Rise, RiseLines } from '../../motion'
import Rule from '../../Rule'
import { categoryType, colors, fonts, menu as menuStyle } from '../../theme'

// The games, for readers who have signed up. They don't exist yet: the list
// is laid out like the Rubriques list, with names to be decided.
const GAMES = [
  { name: 'Mots croisés', subtitle: 'Une grille par numéro' },
  { name: 'Qui a écrit ?', subtitle: "Retrouver l'auteur d'une phrase" },
  { name: 'Le Mot juste', subtitle: 'Un mot par jour' },
]

// Voisinage: signed out, the landing (NeighbourLanding.js: what being a
// neighbour means, the neighbours one at a time, and the e-mail field that
// signs up or signs in); signed in without a profile, the sign-up
// (SignUpForm.js); signed in, the games, then the reader's account.
export default function VoisinageScreen() {
  const { member } = useAccount()
  const scroll = useRef(null)
  useScrollToTop(scroll)
  // Like A Propos, the page builds up each time its tab is entered, from the
  // top: its content is remounted (an address half typed is lost) and the
  // page scrolled back up. Signing in or out builds it up again too. The
  // tab's focus also fires on the first visit.
  const navigation = useNavigation()
  const [shown, setShown] = useState(() => Date.now())
  useEffect(
    () =>
      navigation.addListener('focus', () => {
        scroll.current?.scrollTo({ y: 0, animated: false })
        setShown(Date.now())
      }),
    [navigation],
  )
  const last = useRef(member)
  if (!!last.current !== !!member) {
    last.current = member
    setShown(Date.now())
  }
  const reduceMotion = useReducedMotion()
  // The sign-up fits the screen and doesn't scroll; it lifts itself over the
  // keyboard (SignUpForm.js), so the screen's own avoiding is off for it.
  const signingUp = !!member?.needsProfile

  return (
    <View style={styles.screen}>
      <Masthead />
      <KeyboardAvoidingView style={styles.screen} behavior="padding" enabled={!signingUp}>
        <AppearContext.Provider value={{ since: shown, still: reduceMotion }}>
          <ScrollView
            ref={scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            scrollEnabled={!signingUp}
          >
            {signingUp ? (
              <SignUpForm key={`sign-up-${shown}`} />
            ) : member ? (
              <Neighbourhood key={`member-${shown}`} />
            ) : (
              <NeighbourLanding key={`landing-${shown}`} />
            )}
          </ScrollView>
        </AppearContext.Provider>
      </KeyboardAvoidingView>
    </View>
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
