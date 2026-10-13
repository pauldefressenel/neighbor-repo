import { RUBRIQUES } from '../shared/sections.js'

// French first: the app serves the French edition only for now.
const languages = [
  { title: 'Français', value: 'fr' },
  { title: 'English', value: 'en' },
]

const aboutTitle = { en: 'About', fr: 'A Propos' }
const frontTitle = { en: 'Latest', fr: 'À la Une' }

// The three rubriques, from the list the website and the app share
// (shared/sections.js). Each lists the articles whose `section` is among
// its values (Essais & Critiques also finds the old `the-arts`); a new one
// takes the first. (Creating an article in Essais & Critiques asked which of
// two old sections it was at first.)
const rubriques = (lang) =>
  RUBRIQUES.map((r) => ({ title: r.label[lang], sections: r.sanity }))

// Fills in language and section for a new article, so writers never set them
// by hand, and the publication date as today. Registered in sanity.config.js.
export const articleTemplate = {
  id: 'article-in-section',
  title: 'Article',
  schemaType: 'article',
  parameters: [
    { name: 'lang', type: 'string' },
    { name: 'section', type: 'string' },
  ],
  value: ({ lang, section }) => ({ language: lang, section, publishedAt: new Date().toISOString() }),
}

// Sets a new À la Une document's language.
export const frontTemplate = {
  id: 'front-page',
  title: 'À la Une',
  schemaType: 'frontPage',
  parameters: [{ name: 'lang', type: 'string' }],
  value: ({ lang }) => ({ language: lang }),
}

export const structure = (S) =>
  S.list()
    .title('The Neighbor')
    .items(
      languages.map(({ title: langTitle, value: lang }) =>
        S.listItem()
          .title(langTitle)
          .child(
            S.list()
              .title(langTitle)
              .items([
                // The home page's articles, in order (schemas/frontPage.js):
                // one fixed document per language, opened straight into the
                // editor. A new one starts with its language set.
                S.listItem()
                  .title(frontTitle[lang])
                  .child(
                    S.document()
                      .schemaType('frontPage')
                      .documentId(`front-${lang}`)
                      .initialValueTemplate('front-page', { lang })
                  ),
                S.divider(),
                ...rubriques(lang).map(({ title, sections }) =>
                  S.listItem()
                    .title(title)
                    .child(
                      S.documentList()
                        .title(title)
                        .schemaType('article')
                        .filter('_type == "article" && language == $lang && section in $sections')
                        .params({ lang, sections })
                        .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                        .initialValueTemplates([
                          S.initialValueTemplateItem(articleTemplate.id, { lang, section: sections[0] }).title('Article'),
                        ])
                    )
                ),
                S.divider(),
                // One fixed document per language, so it opens straight into the editor.
                S.listItem()
                  .title(aboutTitle[lang])
                  .child(S.document().schemaType('aboutPage').documentId(`about-${lang}`)),
              ])
          )
      )
    )
