import PageStack from '../../../PageStack'

// The Rubriques tab (A La Une and the rubriques of texts), with an article
// pushed on top of it (PageStack.js). Its switch fades the cards out below
// itself, so the masthead's own fade is left out on its first page.
export default function CouvertureLayout() {
  return <PageStack root="" rootFade={false} />
}
