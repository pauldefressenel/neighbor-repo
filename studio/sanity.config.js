import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas/index'
import { structure, articleTemplate } from './structure'
import { ForceLightScheme } from './forceLight'
import { SANITY } from '../shared/sanity.js'

export default defineConfig({
  name: 'neighbor',
  title: 'The Neighbor',
  projectId: SANITY.projectId,
  dataset: SANITY.dataset,
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
