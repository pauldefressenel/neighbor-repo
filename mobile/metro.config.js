const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// What the app shares with the website lives outside mobile/: the rubriques,
// queries, strings and design values (shared/), and the portraits' animation
// spec (src/portraitAnimations.js) and sprites (public/portraits/).
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
  path.resolve(__dirname, '../src'),
  path.resolve(__dirname, '../public/portraits'),
]

// Since SDK 58 an image asks for react-native/asset-registry from its own
// folder, and the repo root has no react-native: look in the app's packages.
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')]

module.exports = config
