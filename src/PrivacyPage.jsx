import { useParams } from 'react-router-dom'
import { ArticleHeading, ArticleText } from './ArticlePage'

// The privacy policy, which the App Store listing links to
// (/fr/privacy, /en/privacy). Set like About, but its text is written here
// rather than in Sanity: it must say exactly what the site and the app do,
// so it changes with the code. Update it before anything starts collecting
// data, such as Voisinage's accounts (VOISINAGE_OPEN in mobile/src/sections.js).
const UPDATED = { fr: '10 novembre 2026', en: 'November 10, 2026' }

const TEXT = {
  fr: {
    title: 'Confidentialité',
    byline: `Mis à jour le ${UPDATED.fr}.`,
    paragraphs: [
      [null, 'The Neighbor est un journal publié sur theneighborr.com et dans l’application iPhone The Neighbor. Cette page dit quelles données nous recueillons : presque aucune.'],
      ['L’application.', ' Elle ne demande ni compte, ni nom, ni adresse e-mail. Elle ne contient ni publicité, ni mesure d’audience, ni traceur, et ne recueille aucune donnée personnelle. Pour afficher les textes, elle les télécharge depuis Sanity, le service qui héberge nos articles ; comme toute connexion à Internet, ces demandes transmettent l’adresse IP de l’appareil, que nous ne conservons pas.'],
      ['Le site.', ' Il n’utilise pas de publicité. Il compte ses visites avec Vercel Web Analytics, sans cookie ni donnée permettant de vous identifier : nous voyons seulement combien de pages sont lues, lesquelles, d’où viennent les lecteurs (pays, site précédent) et sur quel type d’appareil. Il dépose un seul cookie, « lang », qui retient la langue choisie. Il est hébergé par Vercel, et ses polices viennent de Google Fonts ; comme tout hébergeur, ces services voient l’adresse IP des visiteurs.'],
      ['Ce qui pourrait changer.', ' Si nous proposons un jour des comptes de lecteurs, cette page sera mise à jour avant, pour dire ce qui est recueilli et pourquoi.'],
      ['Contact.', ' Écrivez à admin@theneighborr.com pour toute question sur vos données.'],
    ],
  },
  en: {
    title: 'Privacy',
    byline: `Updated ${UPDATED.en}.`,
    paragraphs: [
      [null, 'The Neighbor is a paper published at theneighborr.com and in The Neighbor iPhone app. This page says what data we collect: almost none.'],
      ['The app.', ' It asks for no account, no name and no e-mail address. It has no advertising, no analytics and no trackers, and collects no personal data. To show the texts, it downloads them from Sanity, the service that hosts our articles; like any connection to the internet, these requests carry the device’s IP address, which we do not keep.'],
      ['The website.', ' It uses no advertising. It counts its visits with Vercel Web Analytics, without cookies or anything that identifies you: we see only how many pages are read, which ones, where readers come from (country, previous site) and on what kind of device. It sets a single cookie, “lang”, which remembers the language chosen. It is hosted by Vercel, and its fonts come from Google Fonts; like any host, these services see visitors’ IP addresses.'],
      ['What could change.', ' If we ever offer reader accounts, this page will be updated first, to say what is collected and why.'],
      ['Contact.', ' Write to admin@theneighborr.com with any question about your data.'],
    ],
  },
}

// Each paragraph as a Portable Text block, so ArticleText sets it exactly as
// an article's text: a lead-in in italics, then the rest.
const blocks = (paragraphs) =>
  paragraphs.map(([lead, rest], i) => ({
    _type: 'block',
    _key: `p${i}`,
    style: 'normal',
    markDefs: [],
    children: [
      ...(lead ? [{ _type: 'span', _key: `p${i}l`, text: lead, marks: ['em'] }] : []),
      { _type: 'span', _key: `p${i}r`, text: rest, marks: [] },
    ],
  }))

export default function PrivacyPage() {
  const { lang } = useParams()
  const t = TEXT[lang] ?? TEXT.en
  return (
    <main className="article-page article-page--about" lang={lang}>
      <ArticleHeading byline={t.byline} title={t.title} />
      <ArticleText body={blocks(t.paragraphs)} />
    </main>
  )
}
