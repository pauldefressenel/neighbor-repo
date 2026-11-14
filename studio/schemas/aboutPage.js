import { defineField, defineType } from 'sanity'

// One document per language, with fixed ids `about-en` / `about-fr` so the
// Studio sidebar can open them directly and the frontend can fetch by id.
export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  fields: [
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
      // The id (about-fr / about-en) already says the language, and the app
      // and the website fetch by id. Nothing filled this in on a new page, so
      // requiring it stopped about-en from being published.
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], lists: [] }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'founders',
      title: 'Founders',
      description: 'Shown as small portraits under the text',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'founder',
          fields: [
            { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'image', title: 'Image', type: 'image' },
          ],
          preview: { select: { title: 'name', media: 'image' } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', id: '_id' },
    prepare: ({ title, id }) => ({ title, subtitle: id?.endsWith('about-fr') ? 'Français' : 'Anglais' }),
  },
})
