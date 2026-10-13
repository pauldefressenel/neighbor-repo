// Creates the two À la Une documents (front-fr, front-en;
// studio/schemas/frontPage.js) from the articles whose old `featured` field
// names that language, newest first, as the home pages showed them. A
// document that already exists is left alone. Then removes the old field
// from every article: the schema no longer has it.
//
//   node import/seed-front.mjs                        # dry run
//   SANITY_TOKEN=<token> node import/seed-front.mjs --write

import { createClient } from '@sanity/client'

const WRITE = process.argv.includes('--write')
const TOKEN = process.env.SANITY_TOKEN
if (WRITE && !TOKEN) {
  console.error('--write needs a token:  SANITY_TOKEN=<token> node import/seed-front.mjs --write')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: TOKEN,
})

const FLAG = { fr: 'French', en: 'English' }

for (const lang of ['fr', 'en']) {
  const _id = `front-${lang}`
  const articles = await client.fetch(
    `*[_type == "article" && !(_id in path("drafts.**")) && language == $lang && featured == $flag]
      | order(publishedAt desc) { _id, "slug": slug.current }`,
    { lang, flag: FLAG[lang] },
  )
  const exists = await client.fetch('defined(*[_id == $_id][0]._id)', { _id })
  console.log(`${_id}${exists ? ' (exists, left alone)' : ''}:`)
  articles.forEach((a, i) => console.log(`  ${i + 1}. ${a.slug}`))
  if (!WRITE || exists) continue
  await client.createIfNotExists({
    _id,
    _type: 'frontPage',
    language: lang,
    articles: articles.map((a, i) => ({ _key: `a${i}`, _type: 'reference', _ref: a._id })),
  })
  console.log('  created')
}
const flagged = await client.fetch(`*[_type == "article" && defined(featured)]._id`)
console.log(`\n\`featured\` to remove from ${flagged.length} articles (drafts included).`)
if (WRITE && flagged.length) {
  const transaction = client.transaction()
  flagged.forEach((id) => transaction.patch(id, (p) => p.unset(['featured'])))
  await transaction.commit()
  console.log('  removed')
}
if (!WRITE) console.log('\nDry run. Add --write to create them and remove the field.')
