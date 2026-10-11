import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { SANITY } from '../../shared/sanity.js'

export const client = createClient({ ...SANITY, useCdn: true })

const builder = imageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)
