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

- **French first.** `/` goes to `/fr` when the phone's language is French or
  its region a French-speaking country (`app/index.js`, with
  `expo-localization`; the country list duplicates the website's
  `middleware.js`), else to `/en`. The chrome (tab labels, dates,
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
index.js                    → /fr or /en, from the phone's language and region
[lang]/_layout.js           Tabs with the custom TabBar: (couverture), rubriques, voisinage, a-propos (in that order)
[lang]/(couverture)/_layout.js         a PageStack (PageStack.js)
[lang]/(couverture)/index.js           En Couverture (/fr) — articles whose `featured` is "French"
[lang]/(couverture)/articles/[slug].js an article opened from En Couverture (/fr/articles/<slug>)
[lang]/rubriques/_layout.js            a PageStack
[lang]/rubriques/index.js              the three rubriques as a table of contents; prefetches each one
[lang]/rubriques/[section]/index.js    one rubrique's articles (slug from sections.js)
[lang]/rubriques/[section]/[slug].js   an article opened from a rubrique
[lang]/a-propos.js          About: the about-<lang> text, set like an article
[lang]/voisinage.js         Voisinage: the landing (NeighbourLanding), whose e-mail and code fields sign up or in; then the sign-up (SignUpForm) for a new account; signed in, the games, none built yet, and the account
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
  `portraits`), each mapped to one or more of Sanity's four `section` values,
  derived from `../shared/sections.js`, the list the website and the Studio
  read too.
- `sanity.js` — client (same project, dataset `production`, CDN on; the
  project and the queries are in `../shared/sanity.js`), `urlFor`,
  `getLatestArticles`, `getSectionArticles`, `prefetchSectionArticles`,
  `openArticle` / `getArticle` and `getAboutPage`. A
  prefetch is used once by the next fetch for that rubrique; pull to refresh
  fetches again.
- `LateSpinner.js` — the loading spinner of the article lists, an article
  and A Propos, shown only once loading has taken `SPINNER_DELAY` (700ms):
  shown at once, it flashed for an instant before the content arrived.
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
  closed by one asterisk centred under it (`titleMark` in
  `../shared/tokens.js`, as on the website; three asterisks, then a short
  drawn line, came first), a FlatList of cards, pull to refresh, and
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
    It is 20pt in from each side of the card (`card.excerptInset`, which
    the website's phone cards use too; it was a 240pt column whose short
    lines made it run long).
  - The illustration is full width in the same box as on the website, at
    the vignettes' shared proportions (`card.illustrationAspect`, about
    1818×572); a taller drawing is scaled down to fit inside it, never
    cropped. It has `card.imageGap` (30pt) above and below, less and more `GARAMOND_RISE`
    (1.5pt): iOS sets EB Garamond higher in its line than a browser, so
    without it the excerpt looked further from the illustration and the
    byline nearer than on the website (measured ink to ink). A portrait's
    drawing takes the same place.
  - Category: Averia Libre Regular, red, 18pt, -0.05em letter-spacing,
    1.1em line height.
  - Date: EB Garamond regular italic, lighter than the author's medium.
- `Masthead.js` — the fixed top bar (under its line, the paper fading out
  into the page, `PaperFade.js`, drawn over the page through the masthead's
  `zIndex`): the wordmark between two equal slots,
  with an optional back arrow that pops in (`BACK_POP`, `usePop`) as a rubrique opens,
  and the language on the right: "FR EN" side by side in the cards' category
  type at 16pt, the current one in ink, the other faint; a tap switches.
  The two slots are 64pt wide to hold it, the language ends 28pt from the
  edge, and it stands on the wordmark's baseline.
  (It replaced "Fr" opening a red "En" beside it.) Switching keeps the page, except that an article goes back to the
  list it was opened from (article slugs differ between languages).
- `NeighbourLanding.js` — Voisinage signed out, chosen on a comparison
  sheet (option B). Under the centred "Voisinage" title (no dinkus: it
  separates articles, and there are none here), 90pt down:
  - "S'inscrire" / "Se connecter" in the categories' capitals at 16pt, the
    chosen one red, with the e-mail field right under them (they stand in
    for its label; centring both was tried). Once the address is sent it stays, greyed, with
    "Modifier", and the code field opens under it on the same page (six
    digits, NeighborFont, iOS's one-time-code autofill; a whole code goes on
    by itself). Both links lead to the same two steps, checked by Supabase
    (account.js); whether the address is new or known will decide what
    follows the code;
  - a description set like a card's excerpt (Garamond 20/22) but flush left
    (centred Garamond was turned down), which follows the chosen link: what
    being a neighbour brings, or "Bon retour dans le voisinage";
  - the real neighbours one at a time, from Supabase: a 135pt avatar,
    centred, then flush left under it the first name (black), activity
    (grey) and "Depuis <mois>" (red, the activity's 14pt; grey was tried; both at the
    name's 20pt were tried; no year, since some neighbours
    predate the dates the old database kept), changing every 2.2s with a
    fade in place (`NEIGHBOUR` in motion.js; a 4pt drop was taken out). A tap doesn't stop it (that was tried).
    Only neighbours with an activity are shown, and only the next three
    avatars are prefetched. A scrolling street and a grid of faces were
    rejected: always one neighbour replacing another.
- `SignUpForm.js` — the sign-up, for a signed-in account without a profile
  (a new address, right after its code). It fits the screen and doesn't scroll. Under
  "S'inscrire": the first name and surname side by side ("Victor", "Hugo"
  as grey placeholders), the country ("France" in grey until chosen; iOS's
  wheel in a sheet opens on the phone's region; `countries.js` holds the
  French names shown and the English ones stored), then "Avatar de voisin",
  optional. Before a photo, a breathing dashed frame ("+ IMPORTER UN
  SELFIE", written in capitals: with `textTransform` iOS laid the lines out
  off centre) opens iOS's action sheet (a front-camera selfie or a library
  photo, cut square), and an arrow points to the landing's stream in its
  `example` mode (84pt avatar, the name and the whole activity centred, no
  month). Once a photo is taken the example goes: the photo on the left,
  "Activité*" (then required) and "Reprendre la photo" beside it. The
  avatar part keeps one height (`AVATAR_PART`) either way, so the drawn
  line and the envelope under it never move. The envelope and "Envoyer mon
  profil" breathe softly, ink until the profile can be sent, then red; a
  tap too soon shakes them, a ready one asks with iOS's alert, then
  `saveProfile` (account.js) saves the profile and the photo (private
  `photos` bucket). Typing the activity lifts the page just over the
  keyboard (`useKeyboardLift`), since the page can't scroll.
- `supabase.js` — the neighbours' Supabase project: its public key,
  `avatarUrl` and `getNeighbours` (the public `neighbours` view, over plain
  REST), and the supabase-js client for signing in, its session kept in
  AsyncStorage (an encrypted store is worth adding before release) and
  refreshed only while the app is in front.
- `account.js` — the reader's account, from Supabase Auth: `sendCode` (an
  e-mailed six-digit code; only "S'inscrire" may create the account, so
  signing in with an unknown address is refused with `otp_disabled`),
  `verifyCode`, `signOut`, and the profile's first name and newsletter.
  The code's e-mail is written and sent by the `send-email` Edge Function
  (repo-root `supabase/functions/send-email/`, Supabase's Send Email Hook),
  in the language `sendCode` stores in the user's metadata (`lang`). Provided above `[lang]`, so switching
  language keeps it.
- `DrawnIcons.js` — `TabIcon`, the tab bar's four icons (a crown for A La
  Une, a ticket for Rubriques, three people for Voisinage, a palette for
  A Propos), and the sign-up tick box. The icons' lines are gently bent so
  they look hand-drawn (wobble, open loops and uneven weight were tried and
  rejected). Their paths and sizes are generated into `tabIcons.js` by the
  repo-root `assets/icons/make-icons.py`, which also writes the `.svg`
  copies beside it: change the script and run it, never the outputs.
- `PaperFade.js` — the paper fading out over `headerFade` (`../shared/tokens.js`,
  as under the website's header) from a bar's line into the page: below the
  masthead (`edge="top"`) and above the tab bar (`edge="bottom"`).
- `TabBar.js` — the custom bottom bar: the masthead's hand-drawn `Rule` along its top, turned upside down so the two differ, with the paper fading out above it (`PaperFade`), the icons from `DrawnIcons.js`, labels in the cards' category type (ink, 14pt, -0.06em), and a red dot under the current tab.
- `Rule.js` — the hand-drawn rule (from the repo's `assets/path.svg`), drawn as
  SVG at any width.
- `BalancedText.js` — `text-wrap: balance` for React Native, found by binary
  searching the width. `maxFill` splits a too-wide single line into two.
- `motion.js` — all animation: `PAGE` (the slide between the list and a rubrique; `slide: false` for the old crossfade), `PRESS`, `CARD_PRESS` (an article card: a 0.98
  shrink in 0.22s and a 0.38s release, from `../shared/tokens.js`) and `FadePressable` (touch feedback), and `APPEAR` (the delays and springs for
  how a page builds up). `Rise` and `RiseLines` play those steps when inside
  an `AppearContext`. Every animation honours Reduce Motion.
  A page builds up only the first time it is shown (tabs stay mounted, so
  switching tabs and back shows it as it was), and when it slides in: a
  rubrique or an article each time it opens. Coming back to a page (the
  Rubriques list included) shows it as it was. A Propos is the exception: it
  builds up again, from the top, every time its tab is entered, and so
  does Voisinage.
- `theme.js` — colours (paper `#FFFFF2`, ink, red `#FF1919`), font families,
  and shared text and layout styles (`pageTitle`, `rubriquesTitle`, `menu`).
  The values the website uses too (paper, red, the title and category type)
  come from `../shared/tokens.js`; change them there.
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
  article, with the animation passed as `picture`, in the illustration's
  place (`card.imageGap` above and below), as on the website's phones; at the top of
  the card, above the category, it ran all the text together. The drawing
  stays still on press while the text above and below it shrinks. (It was the website's own portrait card, a 300px column in other
  sizes, until it was brought in line with the other rubriques.) A portrait
  with no animation shows its whole `mainImage` at `PORTRAIT_SIZE`.
- `portraitSprites.js` — `require()` and pixel size for each sprite (Metro
  needs static requires; the sizes give height-only layers their width). A new
  sprite needs a line here.

## Spacing that depends on two places

These were measured in the simulator. If you change one half, re-measure and
change the other half too.

- **The page title's spacing.** `rubriquesTitle.marginTop` in `theme.js` (41.5)
  sets the space above the title. Below it, the asterisk: `titleMark.above`
  between the title's box and the asterisk's (a 26pt line box, so iOS
  doesn't clip it), `titleMark.below` between that and the first card's,
  as on the website (`../shared/tokens.js`). `rubriquesTitle` also places the
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
- The repo-root `assets/icons/` holds `make-icons.py`, the `.svg` copies it
  writes, and the earlier hand-drawn PNGs. The app draws the icons from
  `tabIcons.js`, which the same script writes.

---

Generic Expo guidance follows (installed by the Expo template). Where it
conflicts with the above (TypeScript, `_layout.tsx`), the above wins.

@AGENTS.md
