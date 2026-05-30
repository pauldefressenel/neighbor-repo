import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas/index'
import { structure } from './structure'
import { ForceLightScheme } from './forceLight'

export default defineConfig({
  name: 'neighbor',
  title: 'The Neighbor',
  projectId: '9hw8z0gm',
  dataset: 'production',
  plugins: [
    structureTool({ structure }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  studio: {
    components: {
      layout: ForceLightScheme,
    },
  },
})
