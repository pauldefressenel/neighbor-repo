// French first: the app serves the French edition only for now.
const languages = [
  { title: 'Français', value: 'fr' },
  { title: 'English', value: 'en' },
]

const aboutTitle = { en: 'About', fr: 'A Propos' }

// The three rubriques, as on the site (src/sections.js) and in the app
// (mobile/src/sections.js). Articles still carry four `section` values, so
// Essais & Critiques gathers two of them; creating an article there asks
// which one it belongs to.
const rubriques = {
  fr: [
    {
      title: 'Essais & Critiques',
      sections: [
        { title: 'La Revue Littéraire', value: 'literature-review' },
        { title: 'Les Arts', value: 'the-arts' },
      ],
    },
    { title: 'Prose & Poésie', sections: [{ title: 'Fiction & Poésie', value: 'fiction-poetry' }] },
    { title: 'Portraits', sections: [{ title: 'Portraits', value: 'portraits' }] },
  ],
  en: [
    {
      title: 'Essays & Criticism',
      sections: [
        { title: 'Literature Review', value: 'literature-review' },
        { title: 'The Arts', value: 'the-arts' },
      ],
    },
    { title: 'Prose & Poetry', sections: [{ title: 'Fiction & Poetry', value: 'fiction-poetry' }] },
    { title: 'Portraits', sections: [{ title: 'Portraits', value: 'portraits' }] },
  ],
}

// Fills in language and section for a new article, so writers never set them
// by hand. Registered in sanity.config.js.
export const articleTemplate = {
  id: 'article-in-section',
  title: 'Article',
  schemaType: 'article',
  parameters: [
    { name: 'lang', type: 'string' },
    { name: 'section', type: 'string' },
  ],
  value: ({ lang, section }) => ({ language: lang, section }),
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
                ...rubriques[lang].map(({ title, sections }) =>
                  S.listItem()
                    .title(title)
                    .child(
                      S.documentList()
                        .title(title)
                        .schemaType('article')
                        .filter('_type == "article" && language == $lang && section in $sections')
                        .params({ lang, sections: sections.map((s) => s.value) })
                        .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                        .initialValueTemplates(
                          sections.map(({ title: sectionTitle, value: section }) =>
                            S.initialValueTemplateItem(articleTemplate.id, { lang, section }).title(sectionTitle)
                          )
                        )
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
