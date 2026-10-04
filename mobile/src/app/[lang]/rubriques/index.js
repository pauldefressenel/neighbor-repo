import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import Masthead from '../../../Masthead'
import Rule from '../../../Rule'
import { SECTIONS } from '../../../sections'
import { colors, fonts } from '../../../theme'

// The rubriques as a numbered table of contents, each one ruled off with a smaller copy of the masthead's line.
export default function RubriquesScreen() {
  const { lang } = useLocalSearchParams()

  return (
    <View style={styles.screen}>
      <Masthead />
      <View style={styles.body}>
        <Text style={styles.title}>Rubriques</Text>
        {SECTIONS.map((section, i) => (
          <Pressable
            key={section.slug}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => router.push(`/${lang}/rubriques/${section.slug}`)}
            accessibilityRole="link"
            accessibilityLabel={section.label}
          >
            <View style={styles.line}>
              <Text style={styles.name}>{i + 1}. {section.label}</Text>
              <Text style={styles.chevron}>&gt;</Text>
            </View>
            <Text style={styles.subtitle}>{section.subtitle}</Text>
            <Rule style={styles.rule} />
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 75,
    marginBottom: 73,
    // NeighborFont's descenders run below a tight line box, so the q needs room.
    paddingBottom: 4,
    textAlign: 'center',
    fontFamily: fonts.neighbor,
    fontSize: 35,
    lineHeight: 50,
    letterSpacing: -0.35,
    color: colors.ink,
  },
  row: {
    marginBottom: 30,
  },
  pressed: {
    opacity: 0.5,
  },
  // The chevron sits on the name's baseline, at the right edge.
  line: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    flexShrink: 1,
    fontFamily: fonts.neighborMedium,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  chevron: {
    fontFamily: fonts.paprika,
    fontSize: 23,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.newAmsterdam,
    fontSize: 15,
    letterSpacing: 0.45,
    textTransform: 'uppercase',
    color: colors.red,
  },
  rule: {
    marginTop: 8,
  },
})
