import { defineCliConfig } from 'sanity/cli'

// Written out rather than read from shared/sanity.js: the CLI loads this
// file on its own and can't follow an import out of studio/.
export default defineCliConfig({
  api: {
    projectId: '9hw8z0gm',
    dataset: 'production',
  },
})
