import { useRef } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useReducedMotion } from 'react-native-reanimated'
import Masthead from '../../Masthead'
import { APPEAR, AppearContext, Rise, RiseLines } from '../../motion'
import Rule from '../../Rule'
import { colors, menu } from '../../theme'

// Placeholder copy, only there to see the layout; the real text is to come
// (the Studio has an aboutPage document per language for it).
const BLOCKS = [
  {
    name: 'Le Journal',
    subtitle: 'Depuis 2024',
    text: 'The Neighbor est un journal en ligne écrit par des voisins, pour des voisins. On y publie des critiques, des nouvelles et des portraits, sans autre ambition que celle de bien regarder ce qui nous entoure.',
  },
  {
    name: 'Les Voisins',
    subtitle: 'Ecrivains, Lecteurs',
    text: 'Chaque texte est signé par quelqu’un qui aurait pu habiter sur votre palier. Étudiants, chercheurs, musiciens ou simples curieux : tous écrivent par plaisir, et c’est ce plaisir qu’on essaie de transmettre.',
  },
  {
    name: 'Nous Ecrire',
    subtitle: 'Propositions, Questions',
    text: 'Un texte à proposer, une remarque, une envie de collaborer ? Écrivez-nous, on lit tout, et on répond presque toujours.',
  },
]

// A Propos, laid out like the Rubriques list (`menu` in theme.js): a title,
// then titled blocks with a red subtitle, a paragraph and a rule, building up
// the same way when the page is first shown.
export default function AProposScreen() {
  const shown = useRef(Date.now()).current
  const reduceMotion = useReducedMotion()
  const steps = APPEAR.menu
  return (
    <View style={styles.screen}>
      <Masthead />
      <AppearContext.Provider value={{ since: shown, still: reduceMotion }}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
          <RiseLines style={menu.title} step={steps.title}>A Propos</RiseLines>
          {BLOCKS.map((block, i) => (
            <View key={block.name} style={menu.block}>
              <Rise step={steps.name} extraDelay={i * steps.stagger}>
                <Text style={menu.name}>{block.name}</Text>
              </Rise>
              <Rise step={steps.subtitle} extraDelay={i * steps.stagger}>
                <Text style={menu.subtitle}>{block.subtitle}</Text>
                <Text style={menu.text}>{block.text}</Text>
              </Rise>
              <Rise step={steps.rule} extraDelay={i * steps.stagger}>
                <Rule style={menu.rule} />
              </Rise>
            </View>
          ))}
        </ScrollView>
      </AppearContext.Provider>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    flex: 1,
  },
  body: {
    ...menu.body,
    flex: undefined,
    paddingBottom: 30,
  },
})
