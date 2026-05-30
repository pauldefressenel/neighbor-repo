import { defineField, defineType } from 'sanity'
import { BlockquoteIcon } from '@sanity/icons'

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
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'French', value: 'fr' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      options: {
        list: [
          { title: 'Fiction & Poetry', value: 'fiction-poetry' },
          { title: 'Literature Review', value: 'literature-review' },
          { title: 'The Arts', value: 'the-arts' },
          { title: 'Portraits', value: 'portraits' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      validation: Rule => Rule.required(),
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
      name: 'translationSlug',
      title: 'Translation Slug',
      description: 'Slug of the translated version of this article',
      type: 'string',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
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
