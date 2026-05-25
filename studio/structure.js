const languages = [
  { title: 'English', value: 'en' },
  { title: 'Français', value: 'fr' },
]

const sections = {
  en: [
    { title: 'Fiction & Poetry', value: 'fiction-poetry' },
    { title: 'Literature Review', value: 'literature-review' },
    { title: 'The Arts', value: 'the-arts' },
    { title: 'Portraits', value: 'portraits' },
  ],
  fr: [
    { title: 'Fiction & Poésie', value: 'fiction-poetry' },
    { title: 'La Revue Littéraire', value: 'literature-review' },
    { title: 'Les Arts', value: 'the-arts' },
    { title: 'Portraits', value: 'portraits' },
  ],
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
              .items(
                sections[lang].map(({ title, value: section }) =>
                  S.listItem()
                    .title(title)
                    .child(
                      S.documentList()
                        .title(title)
                        .filter('_type == "article" && language == $lang && section == $section')
                        .params({ lang, section })
                        .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                    )
                )
              )
          )
      )
    )
