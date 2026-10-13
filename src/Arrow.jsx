// A drawn chevron pointing left, "<" (the Portraits row's next one is mirrored in CSS; also an article's back arrow): one
// stroke, as if by pen, its arms a little uneven (the lower one longer, each
// wavering slightly) and its point slightly rounded. Between a ruled chevron
// and two crossing strokes, which looked too hand-drawn. Drawn at 80% of
// its 16×26, with a heavier stroke (it was 1.7 at full size).
export default function Arrow() {
  return (
    <svg width="13" height="21" viewBox="0 0 16 26" fill="none" aria-hidden="true">
      <path d="M12.1 3.1 C10.9 4.6 9.2 6.6 7.6 8.2 C6 9.9 4.4 11.4 2.9 12.8 C2.6 13.1 2.6 13.4 2.9 13.7 C4.6 15.3 6.4 17 8 18.8 C9.6 20.5 11.2 22.3 12.8 23.7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
