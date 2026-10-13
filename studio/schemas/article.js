import { defineField, defineType } from 'sanity'
import { BlockquoteIcon } from '@sanity/icons'
import { ScaleSlider } from '../scaleSlider.jsx'
import { CategoryInput, categoriesFor } from '../categoryInput.jsx'
import { RubriqueInput } from '../rubriqueInput.jsx'
import { RUBRIQUES } from '../../shared/sections.js'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      // Hidden, like the rubrique: the language folder the article is
      // created in sets it (structure.js). (It was shown read-only first.)
      hidden: true,
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'French', value: 'fr' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      description: 'The red word above the title. Essais & Critiques picks from its list.',
      type: 'string',
      components: { input: CategoryInput },
      validation: Rule => Rule.required().custom((value, { document }) => {
        const options = categoriesFor(document?.section, document?.language)
        return !value || !options || options.includes(value) || `Pick one of: ${options.join(', ')}`
      }),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: 'Short description shown on article cards',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'illustrationScale',
      title: 'Illustration size',
      description: 'At 1 the drawing is as tall as every other card\'s; slide right to make it bigger, left to make it smaller. The text above and below moves with it.',
      type: 'number',
      initialValue: 1,
      options: { min: 0.5, max: 2, step: 0.05, default: 1 },
      components: { input: ScaleSlider },
      validation: Rule => Rule.min(0.5).max(2),
      hidden: ({ document }) => !document?.mainImage,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{
        type: 'block',
        lists: [],
        marks: {
          decorators: [
            { title: 'Strong', value: 'strong' },
            { title: 'Emphasis', value: 'em' },
            { title: 'Citation', value: 'citation', icon: BlockquoteIcon },
          ],
        }
      }],
    }),
    defineField({
      name: 'poems',
      title: 'Poems',
      type: 'array',
      of: [{
        type: 'object',
        name: 'poem',
        fields: [
          { name: 'poemTitle', title: 'Title', type: 'string' },
          { name: 'poemContent', title: 'Content', type: 'array', of: [{ type: 'block' }] },
        ],
        preview: {
          select: { title: 'poemTitle' },
          prepare: ({ title }) => ({ title: title || '(untitled poem)' }),
        },
      }],
    }),
    defineField({
      name: 'audioFile',
      title: 'Audio File',
      description: 'URL of an audio reading for this article',
      type: 'url',
    }),
    defineField({
      name: 'audioQuote',
      title: 'Audio Quote',
      description: 'Short pull-quote displayed alongside the audio player',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      // The moment the article is created; change it if need be. (Also set
      // by the folder's template, structure.js.)
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'section',
      title: 'Rubrique',
      type: 'string',
      description: 'Set by the rubrique folder the article was created in.',
      // Read-only, last in the form: the rubrique folder the article is
      // created in sets it (structure.js), and it decides where the article
      // is listed and its address. Shown as the rubrique's name in the
      // article's language (rubriqueInput.jsx). (It was hidden for a while.)
      readOnly: true,
      components: { input: RubriqueInput },
      options: {
        // The three rubriques (shared/sections.js), each stored as its first
        // Sanity value.
        list: RUBRIQUES.map((r) => ({ title: r.label.fr, value: r.sanity[0] })),
      },
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      section: 'section',
      media: 'mainImage',
    },
    prepare({ title, author, section, media }) {
      return {
        title,
        subtitle: `${section} — ${author}`,
        media,
      }
    },
  },
})
