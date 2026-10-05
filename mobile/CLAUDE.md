# CLAUDE.md — the iOS app

The Neighbor's iPhone app: Expo SDK 57, Expo Router, React Native 0.86. It is a
separate app inside the monorepo, with its own `package.json`. It reads the same
Sanity dataset as the website (see the root `CLAUDE.md`).

## Running

```bash
npm install
npx expo start        # scan the QR code with Expo Go
npx expo install <pkg> # add dependencies this way, never with npm install <pkg>
```

The code is plain JavaScript (`.js`), not TypeScript. There is no `tsconfig`,
so skip `tsc`. ESLint is not set up yet: `npx expo lint` would install and
configure it on its first run. There is no `eas.json`, so nothing is built or
submitted yet.

## Scope today

- **French only.** `/` redirects to `/fr`, and the chrome (tab labels, dates,
  "de <author>", the A Propos copy) is hard-coded in French. The `[lang]`
  segment is there so English can come later; `i18n.js` holds only the few
  strings that already exist in both languages.
- **No article screen yet.** Cards are not tappable; the lists show titles,
  excerpts and images only.
- **A Propos uses placeholder copy** in `a-propos.js`. The real text belongs in
  the Studio's `about-fr` document (`aboutPage` type) and is not fetched yet.
- The design is mocked in Framer (e.g. "Mobile — Rubriques Playground"); timings
  and springs in `motion.js` are transcribed from it.

## Routes (`src/app/`)

```
_layout.js                  fonts, splash screen, a <Slot> (not a Stack) inside GestureHandlerRootView
index.js                    → /fr
[lang]/_layout.js           Tabs with the custom TabBar: index, rubriques, a-propos (in that order)
[lang]/index.js             A La Une — articles whose `featured` is "French"
[lang]/rubriques/_layout.js JS Stack with a crossfade; owns the Masthead and its back arrow
[lang]/rubriques/index.js   the three rubriques as a table of contents; prefetches each one
[lang]/rubriques/[section].js one rubrique's articles (slug from sections.js)
[lang]/a-propos.js          About, laid out like the Rubriques list
[lang]/voisinage.js         "coming soon" stand-in; not in the tab bar
```

Navigation details that are easy to break:
- The root is a `Slot` so that opening a rubrique doesn't push a second copy
  of the tabs.
- Screens inside the rubriques stack don't inherit the tab's params. Read
  `lang` with `useGlobalSearchParams()`, not `useLocalSearchParams()`. When it
  was read locally, links went to `/undefined/…`.
- The rubriques stack is `expo-router/js-stack` (not the native stack), and
  the tabs are `expo-router/js-tabs`. The JS stack lets the transition use a
  custom easing.
- Pressing the current tab again scrolls its list to the top, or pops a
  rubrique back to the list (`useScrollToTop` in `ArticleList`).

## Files (`src/`)

- `sections.js` — the three rubriques (`essais-critiques`, `prose-poesie`,
  `portraits`), each mapped to one or more of Sanity's four `section` values.
  `studio/structure.js` duplicates this list, so change both together.
- `sanity.js` — client (same project, dataset `production`, CDN on), `urlFor`,
  `getLatestArticles`, `getSectionArticles`, and `prefetchSectionArticles`. A
  prefetch is used once by the next fetch for that rubrique; pull to refresh
  fetches again.
- `ArticleList.js` — shared by A La Une and each rubrique: a title, a FlatList
  of `ArticleCard`s, pull to refresh, and a retry message on error.
  `fetchArticles` must be stable (`useCallback`).
- `ArticleCard.js` — a centred title page: category, balanced title, excerpt,
  2:1 image (`expo-image`), byline, and the date in French, formatted by hand
  rather than with `Intl`.
- `Masthead.js` — the fixed top bar: the wordmark between two equal slots,
  with an optional back arrow that fades with the page transition.
- `TabBar.js` — the custom bottom bar: hand-drawn PNG icons from
  `assets/icons/`, ink labels, and a red dot under the current tab.
- `Rule.js` — the hand-drawn rule (from the repo's `assets/path.svg`), drawn as
  SVG at any width.
- `BalancedText.js` — `text-wrap: balance` for React Native, found by binary
  searching the width.
- `motion.js` — all animation: `PAGE` (the crossfade), `PRESS` and
  `FadePressable` (touch feedback), and `APPEAR` (the delays and springs for
  how a page builds up). `Rise` and `RiseLines` play those steps when inside
  an `AppearContext`. Every animation honours Reduce Motion.
- `theme.js` — colours (paper `#FFFFF2`, ink, red `#FF1919`), font families,
  and shared text and layout styles (`pageTitle`, `rubriquesTitle`, `menu`).
- `rivers.js` / `River.js` — wavy "river" separators between articles,
  currently off (`SHOW_RIVERS = false`, plain spacing instead).
- `ComingSoon.js` — the placeholder screen.

## Conventions

- Fonts: in React Native each weight is its own family. Use the names in
  `theme.js` `fonts`, not `fontWeight`. NeighborFont `.otf` files are bundled
  from `assets/fonts/`; the others come from `@expo-google-fonts/*`.
- Put colours, fonts and timings in `theme.js` and `motion.js` rather than
  inline values.
- Comments explain *why* (often a bug that was hit) in full sentences; keep
  that style.
- The repo-root `assets/icons/` are working copies of the tab icons. The
  bundled ones are in `mobile/assets/icons/`.

---

Generic Expo guidance follows (installed by the Expo template). Where it
conflicts with the above (TypeScript, `_layout.tsx`), the above wins.

@AGENTS.md
