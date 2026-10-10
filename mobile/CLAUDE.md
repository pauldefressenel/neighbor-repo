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

- **French first.** `/` redirects to `/fr`, and the chrome (tab labels, dates,
  "de <author>", the A Propos copy) is hard-coded in French. The masthead's
  language selector switches to `/en`, which fetches the English articles
  and About page but keeps the French chrome; `i18n.js` holds only the few
  strings that already exist in both languages.
- **Articles** open from any card (`ArticleScreen.js`), laid out like the
  website's article page. Audio readings (`audioFile`) aren't played yet.
- **A Propos** shows the text of the Studio's `about-fr` document
  (`aboutPage` type), set like an article: the title where an article's
  heading starts, then `ArticleText`. The founders' avatars in that document
  are not shown.
- The design is mocked in Framer (e.g. "Mobile — Rubriques Playground"); timings
  and springs in `motion.js` are transcribed from it.

## Routes (`src/app/`)

```
_layout.js                  fonts, splash screen, the AccountProvider, a <Slot> (not a Stack) inside GestureHandlerRootView
index.js                    → /fr
[lang]/_layout.js           Tabs with the custom TabBar: (couverture), rubriques, a-propos, voisinage (in that order)
[lang]/(couverture)/_layout.js         a PageStack (PageStack.js)
[lang]/(couverture)/index.js           En Couverture (/fr) — articles whose `featured` is "French"
[lang]/(couverture)/articles/[slug].js an article opened from En Couverture (/fr/articles/<slug>)
[lang]/rubriques/_layout.js            a PageStack
[lang]/rubriques/index.js              the three rubriques as a table of contents; prefetches each one
[lang]/rubriques/[section]/index.js    one rubrique's articles (slug from sections.js)
[lang]/rubriques/[section]/[slug].js   an article opened from a rubrique
[lang]/a-propos.js          About: the about-<lang> text, set like an article
[lang]/voisinage.js         Voisinage: the sign-up form, or (signed up) the games, none built yet, and the account
```

Navigation details that are easy to break:
- The root is a `Slot` so that opening a rubrique doesn't push a second copy
  of the tabs.
- Screens inside the rubriques stack don't inherit the tab's params. Read
  `lang` with `useGlobalSearchParams()`, not `useLocalSearchParams()`. When it
  was read locally, links went to `/undefined/…`.
- En Couverture and Rubriques are each a `PageStack`: `expo-router/js-stack`
  (not the native stack), so the slide can use a custom easing, with the
  Masthead above it. The tabs are `expo-router/js-tabs`. The back arrow shows
  on any route deeper than the tab's own (`useSegments().length > 2`).
- Pressing the current tab again scrolls its list to the top, or pops a
  rubrique back to the list (`useScrollToTop` in `ArticleList`).

## Files (`src/`)

- `sections.js` — the three rubriques (`essais-critiques`, `prose-poesie`,
  `portraits`), each mapped to one or more of Sanity's four `section` values.
  `src/sections.js` (the website) and `studio/structure.js` duplicate this
  list, so change all three together.
- `sanity.js` — client (same project, dataset `production`, CDN on), `urlFor`,
  `getLatestArticles`, `getSectionArticles`, `prefetchSectionArticles`,
  `openArticle` / `getArticle` and `getAboutPage`. A
  prefetch is used once by the next fetch for that rubrique; pull to refresh
  fetches again.
- `PageStack.js` — a tab's stack: the Masthead (back arrow included) and the
  sliding transition.
- `ArticleText.js` — the running text of an article and of A Propos:
  paragraphs, the drop cap, poems, e-mail links, and `readingMinutes`.
- `ArticleScreen.js` — an article, after the website's `ArticlePage`: title,
  author and date centred, then the body (EB Garamond 21pt on 31pt lines,
  paragraphs 1.4em apart), then any poems. Only `normal` blocks and the `em`
  mark occur in the dataset; `strong` and `citation` are handled anyway. Hyphenation was tried and rejected. The
  first paragraph opens on a red NeighborFont drop cap over two lines: the
  paragraph is laid out invisibly at the width beside the letter, and the
  lines that fit there are drawn beside it, the rest full width below.
  `DROP.size` and `DROP.drop` were set in the simulator (64 and -7 for
  21pt text, 57 and -6 for 31pt lines, re-measured on an L, whose foot
  shows the baseline plainly; scaling them by proportion drifted) so the
  letter's top meets the first line's capitals and its foot sits on the
  second line. The cap overflows a two-line box, since iOS clips a glyph to
  its line box. Opening a card calls `openArticle` (sanity.js), which keeps
  the card's fields so the title and byline draw at once, and starts loading
  the body while the page slides in.
- `ArticleList.js` — shared by En Couverture and each rubrique: a page title
  closed by a dinkus (`Dinkus.js`), a FlatList of cards, pull to refresh, and
  a retry message on error. `fetchArticles` must be stable (`useCallback`). Between two article
  cards is the hand-drawn `Rule`, 54pt from the date above and from the
  category below (measured to the letters). The first card has no line above
  it. Portraits are ruled off the same way.
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
  with an optional back arrow that pops in (`BACK_POP`, `usePop`) as a rubrique opens,
  and the language selector on the right ("Fr", which shows "En" beside it
  in red). Switching keeps the page, except that an article goes back to the
  list it was opened from (article slugs differ between languages).
- `account.js` — signing up (an e-mail address and the newsletter tick box),
  which opens Voisinage's games. A design mock-up for now: the account lives
  in memory and nothing is sent. Provided above `[lang]`, so switching
  language keeps it.
- `DrawnIcons.js` — SVG stand-ins (Voisinage's house, the tick box) until
  hand-drawn PNGs exist.
- `TabBar.js` — the custom bottom bar: hand-drawn PNG icons from
  `assets/icons/`, ink labels, and a red dot under the current tab.
- `Rule.js` — the hand-drawn rule (from the repo's `assets/path.svg`), drawn as
  SVG at any width.
- `BalancedText.js` — `text-wrap: balance` for React Native, found by binary
  searching the width. `maxFill` splits a too-wide single line into two.
- `motion.js` — all animation: `PAGE` (the slide between the list and a rubrique; `slide: false` for the old crossfade), `PRESS` and
  `FadePressable` (touch feedback), and `APPEAR` (the delays and springs for
  how a page builds up). `Rise` and `RiseLines` play those steps when inside
  an `AppearContext`. Every animation honours Reduce Motion.
  A page builds up only the first time it is shown (tabs stay mounted, so
  switching tabs and back shows it as it was), and when it slides in: a
  rubrique or an article each time it opens. Coming back to a page (the
  Rubriques list included) shows it as it was. A Propos is the exception: it
  builds up again, from the top, every time its tab is entered.
- `theme.js` — colours (paper `#FFFFF2`, ink, red `#FF1919`), font families,
  and shared text and layout styles (`pageTitle`, `rubriquesTitle`, `menu`).
  The Rubriques list sets its block names ("1. Essais & Critiques") in
  `titleType`, like the page title, and their red subtitles in
  `categoryType`, like the cards' categories, but at 16pt.
- `rivers.js` / `River.js` — wavy "river" separators between articles,
  currently off (`SHOW_RIVERS = false`, plain spacing instead).
- `PortraitAnimation.js` — the website's portrait player ported to React
  Native. It reads the website's own spec (`../src/portraitAnimations.js`,
  through `../src/portraits.js`) and sprites (`../public/portraits/`); nothing
  is copied. `metro.config.js` adds those folders to `watchFolders`. The spec
  is written as CSS (percentages, `'px'` strings, translates relative to the
  layer's size), and `layerStyle` resolves it to numbers. A NaN that reaches
  expo-image crashes Expo Go natively, so keep every value finite. Drawn at
  100pt, in Framer's 110px slot scaled down (`PORTRAIT_SCALE`; 1.4, 1, 0.85
  and 0.75 were tried).
- `PortraitCard.js` — a portrait: the same `ArticleCard` as every other
  article, with the animation passed as `picture`, at the top of the card
  (above the category) rather than in the illustration's place. (It was the website's own portrait card, a 300px column in other
  sizes, until it was brought in line with the other rubriques.) A portrait
  with no animation shows its whole `mainImage` at `PORTRAIT_SIZE`.
- `portraitSprites.js` — `require()` and pixel size for each sprite (Metro
  needs static requires; the sizes give height-only layers their width). A new
  sprite needs a line here.
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
- **The line between cards** sits 54pt from the date above and 54pt from the
  category below. The separator's margins in `ArticleList.js` (47.7 / 49.9)
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
user's own server alone. `CI=1` turns off file watching, so that server keeps
serving the bundle it built at startup: restart it (and Expo Go) after every
edit, or the screenshot shows the old code.

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
