// Seeds the two About page documents (about-en, about-fr) from the copy on
// the live Framer site, uploading the founders' avatars as image assets.
//
//   SANITY_TOKEN=<token> node import/seed-about.mjs
//
// Safe to re-run: documents are replaced by id; assets are de-duplicated by
// Sanity on content hash.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))

const TOKEN = process.env.SANITY_TOKEN
if (!TOKEN) {
  console.error('Usage: SANITY_TOKEN=<token> node import/seed-about.mjs')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
})

const uid = () => Math.random().toString(36).slice(2, 10)
const block = (text) => ({
  _type: 'block',
  _key: uid(),
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: uid(), text, marks: [] }],
})

const COPY = {
  en: {
    title: 'About',
    paragraphs: [
      'The Neighbor is a literary magazine that publishes fiction, poetry, essays on books and the arts, and portraits ranging from public figures to the person running the corner bakery. We publish works in a continuous stream, with the intention of transitioning toward periodic issues in the longer term.',
      'Our editorial line is shaped by two productive tensions. The first is linguistic: we publish texts in both French and English, and the second is temporal: we feature both established and emerging authors through our open submission channel. Together, they cultivate a plural and open literary field, a fertile ground for a publication attuned to the rhythms of contemporary society.',
      'In this spirit, our magazine is conceived as a neighborhood: upon signing up, readers become neighbors and become part of a community where ideas and tastes circulate freely.',
      'For submissions, send us an e-mail at: contact@theneighborr.com',
    ],
  },
  fr: {
    title: 'A Propos',
    paragraphs: [
      'The Neighbor est une revue littéraire qui propose de la fiction, de la poésie, des essais critiques sur l’art, ainsi que des portraits allant de la personnalité publique au commerçant du coin. Nous publions les textes en fil continu, dans la perspective d’évoluer vers des numéros périodiques dans le futur.',
      'Notre ligne éditoriale se construit autour de deux tensions fécondes. La première est linguistique : nous publions en français comme en anglais. La seconde est temporelle : nous accueillons aussi bien des auteurs établis qu’émergents, qui nous viennent de contributions spontanées. De cette double ouverture naît un espace littéraire ouvert et pluriel, en prise avec les rythmes de la société contemporaine.',
      'Dans cet esprit, notre revue est conçue comme un voisinage : en s’inscrivant, les lecteurs deviennent des voisins, membres d’une communauté où les idées et les goûts circulent librement.',
      'Pour toute proposition de texte, écrivez-nous à : contact@theneighborr.com',
    ],
  },
}

const FOUNDERS = [
  { name: 'Paul', file: 'paul.png' },
  { name: 'Skander', file: 'skander.png' },
]

console.log('Uploading founder avatars…')
const founders = []
for (const { name, file } of FOUNDERS) {
  const asset = await client.assets.upload('image', readFileSync(join(__dirname, '..', 'public', 'about', file)), {
    filename: file,
    contentType: 'image/png',
  })
  founders.push({
    _type: 'founder',
    _key: uid(),
    name,
    image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
  })
  console.log(`  ${name.padEnd(8)} ${asset._id}`)
}

for (const [language, { title, paragraphs }] of Object.entries(COPY)) {
  const doc = await client.createOrReplace({
    _id: `about-${language}`,
    _type: 'aboutPage',
    language,
    title,
    body: paragraphs.map(block),
    founders,
  })
  console.log(`Wrote ${doc._id}`)
}
console.log('Done.')
