import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas/index'
import { structure, articleTemplate } from './structure'
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
    templates: (prev) => [...prev, articleTemplate],
  },
  studio: {
    components: {
      layout: ForceLightScheme,
    },
  },
})
