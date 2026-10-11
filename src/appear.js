import { createContext } from 'react'

// Set by a page whose article list builds up as it opens (appear in
// shared/tokens.js), to the moment it opened (performance.now()). PageTitle
// and ArticleCard play their steps from it; outside it they just show.
export const AppearContext = createContext(null)

// What is left of a step's delay, `since` the page opened, so content that
// arrives late, after a fetch, doesn't wait out time already past.
export const delayLeft = (since, delay) => Math.max(0, delay - (performance.now() - since))
