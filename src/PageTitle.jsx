import './PageTitle.css'

// A page's title closed by a dinkus (three asterisks, the old section break),
// as at the top of the app's pages (mobile/src/ArticleList.js).
export default function PageTitle({ children }) {
  return (
    <>
      <h2 className="page-title">{children}</h2>
      <p className="dinkus" aria-hidden="true">
        <span>*</span>
        <span>*</span>
        <span>*</span>
      </p>
    </>
  )
}
