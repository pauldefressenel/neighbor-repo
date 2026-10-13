// Crops each article's illustration to its drawing. The vignettes are drawn
// on wide sheets of paper (#FFFFF2) and the drawings fill very different
// parts of them; the cards size each one by the drawing's own area
// (shared/illustration.js), so they need to know where it is. The box around
// the ink, with a little paper left round it, becomes the image's Sanity
// `crop`, which urlFor() applies. Portraits are left alone: their cards show
// the animation.
//
//   node import/trim-illustrations.mjs                       # dry run
//   SANITY_TOKEN=<token> node import/trim-illustrations.mjs --write
//
// Run it again after adding or replacing an illustration. Every --write
// first saves the articles' previous crops to
// import/backup-crops-<timestamp>.ndjson.

import { writeFileSync } from 'node:fs'
import { createClient } from '@sanity/client'
import { PNG } from 'pngjs'

const WRITE = process.argv.includes('--write')
const TOKEN = process.env.SANITY_TOKEN
if (WRITE && !TOKEN) {
  console.error('--write needs a token:  SANITY_TOKEN=<token> node import/trim-illustrations.mjs --write')
  process.exit(1)
}

const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: TOKEN,
})

// Measured on a copy this wide.
const SAMPLE = 600
// A pixel is ink when it is this far from the paper (summed over R, G, B).
const INK = 60
// Paper kept round the drawing, in the sample's pixels.
const MARGIN = 3

// The box around the ink, as fractions of the image (Sanity's crop).
async function inkCrop(ref) {
  const [, id, dimensions, format] = ref.split('-')
  const url = `https://cdn.sanity.io/images/9hw8z0gm/production/${id}-${dimensions}.${format}?w=${SAMPLE}&fm=png`
  const { width, height, data } = PNG.sync.read(Buffer.from(await (await fetch(url)).arrayBuffer()))
  const paper = data.subarray(0, 4)
  const ink = (i) => data[i + 3] > 40 && (paper[3] < 40
    || Math.abs(data[i] - paper[0]) + Math.abs(data[i + 1] - paper[1]) + Math.abs(data[i + 2] - paper[2]) > INK)
  let top = height, bottom = -1, left = width, right = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!ink((y * width + x) * 4)) continue
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
      left = Math.min(left, x)
      right = Math.max(right, x)
    }
  }
  if (bottom < 0) return null
  const round = (n) => Math.round(Math.max(0, n) * 1e4) / 1e4
  return {
    _type: 'sanity.imageCrop',
    top: round((top - MARGIN) / height),
    bottom: round((height - 1 - bottom - MARGIN) / height),
    left: round((left - MARGIN) / width),
    right: round((width - 1 - right - MARGIN) / width),
  }
}

const articles = await client.fetch(
  `*[_type == "article" && defined(mainImage.asset) && section != "portraits"]{ _id, "slug": slug.current, mainImage }`,
)

const crops = new Map()
for (const { mainImage } of articles) {
  const ref = mainImage.asset._ref
  if (!crops.has(ref)) crops.set(ref, await inkCrop(ref))
}

const changes = []
for (const article of articles) {
  const crop = crops.get(article.mainImage.asset._ref)
  if (!crop) {
    console.log(`  no ink found, left alone: ${article.slug}`)
    continue
  }
  const { top, bottom, left, right } = crop
  console.log(`${article.slug.padEnd(52)} keeps ${Math.round((1 - left - right) * 100)}% × ${Math.round((1 - top - bottom) * 100)}%`)
  changes.push({ article, crop })
}

if (!WRITE) {
  console.log(`\nDry run: ${changes.length} crops to set. Add --write to save them.`)
  process.exit(0)
}

const backup = `import/backup-crops-${new Date().toISOString().replace(/[:.]/g, '-')}.ndjson`
writeFileSync(backup, articles.map(({ _id, mainImage }) => JSON.stringify({ _id, crop: mainImage.crop ?? null, hotspot: mainImage.hotspot ?? null })).join('\n') + '\n')
console.log(`\nBacked up to ${backup}`)

const transaction = client.transaction()
for (const { article, crop } of changes) {
  // The hotspot goes to the middle of the drawing, so nothing that crops
  // further around it can lose the drawing.
  const hotspot = {
    _type: 'sanity.imageHotspot',
    x: crop.left + (1 - crop.left - crop.right) / 2,
    y: crop.top + (1 - crop.top - crop.bottom) / 2,
    width: 1 - crop.left - crop.right,
    height: 1 - crop.top - crop.bottom,
  }
  transaction.patch(article._id, (p) => p.set({ 'mainImage.crop': crop, 'mainImage.hotspot': hotspot }))
}
await transaction.commit()
console.log(`Set ${changes.length} crops.`)
