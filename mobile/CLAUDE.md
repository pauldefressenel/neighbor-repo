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
[lang]/index.js             En Couverture — articles whose `featured` is "French"
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
  `src/sections.js` (the website) and `studio/structure.js` duplicate this
  list, so change all three together.
- `sanity.js` — client (same project, dataset `production`, CDN on), `urlFor`,
  `getLatestArticles`, `getSectionArticles`, and `prefetchSectionArticles`. A
  prefetch is used once by the next fetch for that rubrique; pull to refresh
  fetches again.
- `ArticleList.js` — shared by En Couverture and each rubrique: a page title
  closed by a dinkus (`Dinkus.js`), a FlatList of cards, pull to refresh, and
  a retry message on error. `fetchArticles` must be stable (`useCallback`). Between two article
  cards is the hand-drawn `Rule`, 42pt from the date above and from the
  category below (measured to the letters). The first card has no line above
  it. Two portraits in a row get 90px of space instead.
- `ArticleCard.js` — a centred title page: category, title, excerpt,
  illustration, "de <author>", and the date in French, formatted by hand
  rather than with `Intl`.
  - The title shares `titleType` (theme.js) with the page title: NeighborFont
    35pt, -0.03em letter-spacing, 1.1 line height, Regular (Medium page
    titles were tried and rejected). It is balanced, and
    `maxFill={0.8}` breaks a single line wider than 80% of the card onto two
    lines.
  - The excerpt is balanced too, and sits right under the title with no gap.
  - The illustration is full width, with its height from the image's own
    proportions (`imageAspect`, from Sanity's metadata), so it is never
    cropped. It has 22px above and below.
  - Category: Averia Libre Regular, red, 18pt, -0.05em letter-spacing,
    1.1em line height.
  - Date: EB Garamond regular italic, lighter than the author's medium.
- `Masthead.js` — the fixed top bar: the wordmark between two equal slots,
  with an optional back arrow that fades with the page transition.
- `TabBar.js` — the custom bottom bar: hand-drawn PNG icons from
  `assets/icons/`, ink labels, and a red dot under the current tab.
- `Rule.js` — the hand-drawn rule (from the repo's `assets/path.svg`), drawn as
  SVG at any width.
- `BalancedText.js` — `text-wrap: balance` for React Native, found by binary
  searching the width. `maxFill` splits a too-wide single line into two.
- `motion.js` — all animation: `PAGE` (the crossfade), `PRESS` and
  `FadePressable` (touch feedback), and `APPEAR` (the delays and springs for
  how a page builds up). `Rise` and `RiseLines` play those steps when inside
  an `AppearContext`. Every animation honours Reduce Motion.
- `theme.js` — colours (paper `#FFFFF2`, ink, red `#FF1919`), font families,
  and shared text and layout styles (`pageTitle`, `rubriquesTitle`, `menu`).
- `rivers.js` / `River.js` — wavy "river" separators between articles,
  currently off (`SHOW_RIVERS = false`, plain spacing instead).
- `PortraitAnimation.js` — the website's portrait player ported to React
  Native. It reads the website's own spec (`../src/portraitAnimations.js`,
  through `../src/portraits.js`) and sprites (`../public/portraits/`); nothing
  is copied. `metro.config.js` adds those folders to `watchFolders`. The spec
  is written as CSS (percentages, `'px'` strings, translates relative to the
  layer's size), and `layerStyle` resolves it to numbers. A NaN that reaches
  expo-image crashes Expo Go natively, so keep every value finite. Drawn at
  Framer's 110px slot, as on the site (`PORTRAIT_SCALE` 1; tried 1.4 and
  0.75, both rejected).
- `PortraitCard.js` — the website's portrait card: the animation over a 300px
  column of category, title, excerpt and author, with the site's sizes and
  gaps (no date). `ArticleList` uses it for any article whose `section` is
  `portraits`, and puts 90px of space rather than a rule between two
  portraits. A portrait with no animation shows its whole `mainImage` at
  `PORTRAIT_SIZE`.
- `portraitSprites.js` — `require()` and pixel size for each sprite (Metro
  needs static requires; the sizes give height-only layers their width). A new
  sprite needs a line here.
- `ComingSoon.js` — the placeholder screen.
- `Dinkus.js` — three black asterisks in a row, 20pt apart (measured between
  the glyphs), in Averia Serif Libre 26pt. Each asterisk keeps a full line
  box, because iOS clips a glyph to its box and the asterisk sits at its top.
  (A red ⁂ triangle was tried first.)

## Spacing that depends on two places

These were measured in the simulator. If you change one half, re-measure and
change the other half too.

- **The page title's spacing.** `rubriquesTitle.marginTop` in `theme.js` (41.5)
  sets the space above the title. Below it, 36pt to the dinkus
  (`titleStyle.marginBottom`, 22.7) and 36pt from the dinkus to the first
  category (`styles.dinkus.marginBottom`, 17), both measured to the letters. `rubriquesTitle` also places the
  Rubriques list's and A Propos's titles, so all tabs move together.
- **The line between cards** sits 42pt from the date above and 42pt from the
  category below. The separator's margins in `ArticleList.js` (35.7 / 37.9)
  only make up the difference, because the date's and category's line boxes
  already hold 6.3pt and 4.1pt (the latter for Averia Libre at 18pt).
- **Category → title** is 15pt between the letters, set by the title's
  `marginTop` (1) in `ArticleCard.js`. It is that small because the title's
  8pt top padding (room for accents) and both line boxes already hold 14pt. Changing either font, size or line height
  means re-measuring.

To measure, screenshot the simulator (`xcrun simctl io booted screenshot`)
and look for the rows of ink and red. A second Metro server on another port
(`CI=1 npx expo start --port 8082`, opened with
`xcrun simctl openurl booted exp://127.0.0.1:8082/--/<route>`) leaves the
user's own server alone.

## Conventions

- Fonts: in React Native each weight is its own family. Use the names in
  `theme.js` `fonts`, not `fontWeight`. NeighborFont `.otf` files are bundled
  from `assets/fonts/`; the others come from `@expo-google-fonts/*`, loaded in
  `app/_layout.js`. A new font needs both.
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
