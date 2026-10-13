import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas/index'
import { structure, articleTemplate, frontTemplate } from './structure'
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
    templates: (prev) => [...prev, articleTemplate, frontTemplate],
  },
  // The global "+ Create" menu offers no article, À la Une or About page:
  // an article is created from its language's rubrique folder, which sets
  // its language and rubrique (read-only fields; structure.js), and the
  // other two are one fixed document per language, opened from the sidebar.
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((item) => !['article', 'article-in-section', 'frontPage', 'front-page', 'aboutPage'].includes(item.templateId))
        : prev,
  },
  studio: {
    components: {
      layout: ForceLightScheme,
    },
  },
})
