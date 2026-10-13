import { defineField, defineType } from 'sanity'

// À la Une: the articles on a language's home page (the website's Latest,
// the app's A La Une), in the order they appear. One document per language,
// with fixed ids `front-fr` / `front-en`, opened straight from the sidebar
// (structure.js). It replaced each article's `featured` field, which couldn't
// set the order and quietly dropped all but the newest four.
export const frontPage = defineType({
  name: 'frontPage',
  title: 'À la Une',
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
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'articles',
      title: 'Articles',
      description: 'Shown in this order, top first. Drag to reorder.',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'article' }],
        // Only this language's articles, and not one already in the list.
        options: {
          filter: ({ document }) => ({
            filter: 'language == $lang && !(_id in $chosen)',
            params: {
              lang: document.language ?? document._id.replace(/^(drafts\.)?front-/, ''),
              chosen: (document.articles ?? []).map((a) => a._ref).filter(Boolean),
            },
          }),
          disableNew: true,
        },
      }],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    select: { language: 'language' },
    prepare: ({ language }) => ({ title: language === 'en' ? 'À la Une — English' : 'À la Une — Français' }),
  },
})
