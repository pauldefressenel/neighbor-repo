import { Fragment, useContext, useLayoutEffect, useRef } from 'react'
import { appear } from '../shared/tokens.js'
import { AppearContext, delayLeft } from './appear'
import './PageTitle.css'

// A page's title closed by one asterisk centred under it (titleMark in
// shared/tokens.js; three asterisks, then a short drawn line, came first), as
// at the top of the app's pages (mobile/src/ArticleList.js). On a page that
// builds up (AppearContext), the title rises one line at a time and then the
// asterisk, as in the app: its words are measured to find the lines they fall
// on, and each word is given its line's delay.
export default function PageTitle({ children }) {
  const since = useContext(AppearContext)
  const title = useRef(null)
  const mark = useRef(null)
  const words = typeof children === 'string' ? children.split(' ') : null

  useLayoutEffect(() => {
    if (since == null || !words) return
    const spans = [...title.current.querySelectorAll('.rise-word')]
    const tops = [...new Set(spans.map((s) => s.offsetTop))].sort((a, b) => a - b)
    const { delay, stagger } = appear.titleLines
    for (const s of spans) {
      s.style.animationDelay = `${delayLeft(since, delay + tops.indexOf(s.offsetTop) * stagger)}ms`
      s.classList.add('rise-word--go')
    }
    mark.current.style.animationDelay = `${delayLeft(since, appear.titleMark.delay)}ms`
    mark.current.classList.add('title-mark--rise')
    // Measured once, when the title is set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, since])

  return (
    <>
      <h2 className="page-title" ref={title}>
        {since != null && words
          ? words.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <span className="rise-word">{w}</span>
              </Fragment>
            ))
          : children}
      </h2>
      <p className="title-mark" aria-hidden="true" ref={mark}>*</p>
    </>
  )
}
