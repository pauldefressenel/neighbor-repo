const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// The portraits are shared with the website rather than copied: the
// animation spec (src/portraitAnimations.js) and its sprites
// (public/portraits/) live in the site's half of the repo.
config.watchFolders = [
  path.resolve(__dirname, '../src'),
  path.resolve(__dirname, '../public/portraits'),
]

module.exports = config
