// Portrait animations, transcribed from the Framer components.
//
// Sources: node XML from the Framer MCP (primary variants, layer geometry) and
// the published component chunks (cycle order, per-variant dwell, variant CSS
// overrides), cross-checked against recordings of the live site.
//
// Every portrait is a 110×110 slot. Inside it, a component loops through
// `steps`: each step names which layers are visible, whether the whole
// component (`root.flip`) or a single layer (`flip`) is mirrored, and any
// position/size/opacity/colour overrides. `ms` is how long the step holds.
// Feynman is the exception — a still body with four glyphs that each snap
// between two angles on their own timer (`loops`).
//
// Geometry is CSS inside the component box. `translate` is applied before the
// mirror, matching Framer's transformTemplate. Character bodies are flow
// children of a horizontal stack aligned to the end, i.e. centred and
// bottom-aligned; the offsets were checked against the live site.

export const SLUG_TO_PORTRAIT = {
  'alexis-zorba': 'zorba',
  'richard-feynman': 'feynman',
  'henry-miller': 'miller',
  'robert-sapolsky': 'sapolsky',
  'vera-chytilova': 'vera',
  'rick-rubin': 'rubin',
  'furtive-hedgehog': 'furtive',
}

// Sprites copied from Framer's CDN into public/portraits (the CDN goes away with the Framer site).
const IMG = '/portraits/'

// Zorba and Miller declare a spring on their flip, but every layer remounts
// on each step with `initial: false`, so on the live site the mirror is a
// hard cut — recordings show no intermediate frames. We cut too.

export const PORTRAIT_ANIMATIONS = {
  zorba: {
    box: { w: 94, h: 91 },
    clip: true,
    layers: {
      key1: { src: IMG + 'njVUuWh9jgD1cFuEQSmiAV4CcI.png', w: 90, h: 89, left: '49%', top: '50%', translate: '-50%, -50%', z: 0 },
      key2: { src: IMG + 'xweK0I63iBZT5sivfMLH0ojnCUo.png', w: 90, h: 90, left: '48%', top: '50%', translate: '-50%, -50%', z: 2 },
    },
    steps: [
      { ms: 150, show: ['key1'] },
      { ms: 500, show: ['key2'] },
      { ms: 150, show: ['key1'], layers: { key1: { flip: true } } },
      { ms: 500, show: ['key2'], layers: { key2: { flip: true, left: '53%' } } },
    ],
  },

  miller: {
    box: { w: 110, h: 110 },
    layers: {
      key1: { src: IMG + 'pORBBdem5SbxYKEi23TvGBvQE.png', h: 102, left: '50%', bottom: '0px', translate: '-50%, 0', z: 0 },
      key2: { src: IMG + 'vqxgUnVkHQQ3afDfiLa0wb0oZ84.png', w: 102, h: 101, left: '49%', top: '54%', translate: '-50%, -50%', z: 1 },
    },
    steps: [
      { ms: 300, show: ['key1'] },
      { ms: 500, show: ['key2'] },
      { ms: 300, show: ['key1'], layers: { key1: { flip: true } } },
      { ms: 500, show: ['key2'], layers: { key2: { flip: true } } },
    ],
  },

  sapolsky: {
    box: { w: 110, h: 110 },
    layers: {
      key1: { src: IMG + '7kuxwEuviOZYIhtjAMj70uZB48.png', h: 100, left: '50%', bottom: '0px', translate: '-50%, 0', z: 0 },
      key2: { src: IMG + 'Ukz3bzxROeRXyxNI8dg4fboi8I.png', w: 85, h: 101, left: '53%', bottom: '0px', translate: '-50%, 0', z: 1 },
    },
    steps: [
      { ms: 1000, show: ['key1'] },
      { ms: 1000, show: ['key1'], root: { flip: true } },
      { ms: 1000, show: ['key2'] },
      { ms: 1000, show: ['key2'], layers: { key2: { flip: true, h: 100 } } },
    ],
  },

  vera: {
    box: { w: 110, h: 110 },
    layers: {
      key1: { src: IMG + 'aksXRJ5iEyXNB32uS2zS08ZnF4.png', h: 100, left: '50%', bottom: '0px', translate: '-50%, 0', z: 0 },
      key2: { src: IMG + 'uw6rUT3WCiQVMJjxsnwZPGazs20.png', w: 58, h: 101, left: '50%', bottom: '-1px', translate: '-50%, 0', z: 1 },
    },
    steps: [
      { ms: 1000, show: ['key1'] },
      { ms: 1000, show: ['key1'], root: { flip: true } },
      { ms: 1000, show: ['key2'] },
      { ms: 1000, show: ['key2'], layers: { key2: { flip: true } } },
    ],
  },

  rubin: {
    box: { w: 110, h: 110 },
    clip: true,
    layers: {
      body: { src: IMG + 'dE7RZF3YChcPfVBJErsaATG4s.png', w: 63, h: 83, left: '50%', bottom: '-0.5px', translate: '-50%, 0', z: 0 },
      note1: { src: IMG + '9jpwpPd88qZgMON1vH1A6oJCtMg.png', w: 14, h: 19, right: '22px', top: '12px', z: 1, opacity: 0 },
      note2: { src: IMG + 'mtXPQQprLUrFpz0kD6Wvg2lyRw.png', w: 11, h: 17, right: '16px', top: '21px', z: 1, opacity: 0 },
    },
    steps: [
      { ms: 1000, show: ['body', 'note1', 'note2'] },
      { ms: 200, show: ['body', 'note1', 'note2'], layers: {
        note1: { opacity: 1 },
        note2: { opacity: 1, right: '18px', top: '19px' } } },
      { ms: 700, show: ['body', 'note1', 'note2'], layers: {
        note1: { opacity: 1, right: '21px', top: '6px' },
        note2: { opacity: 1, top: '13px' } } },
      { ms: 1000, show: ['body', 'note1', 'note2'] },
      // The notes cross to Rubin's other side as mirrored glyphs; he himself
      // keeps facing the same way (live: KEY1 never carries the mirror).
      { ms: 200, show: ['body', 'note1', 'note2'], layers: {
        note1: { flip: true, opacity: 1, left: '24px', right: 'auto', top: '14px' },
        note2: { flip: true, opacity: 1, h: 16, left: '22px', right: 'auto', top: '25px' } } },
      { ms: 700, show: ['body', 'note1', 'note2'], layers: {
        note1: { flip: true, opacity: 1, left: '21px', right: 'auto', top: '9px' },
        note2: { flip: true, opacity: 1, h: 16, left: '19px', right: 'auto', top: '19px' } } },
    ],
  },

  furtive: {
    box: { w: 110, h: 110 },
    clip: true,
    layers: {
      body: { src: IMG + 'zCLDnjIHxmJcJ5SVStRowD1IE.png', w: 61, h: 89, left: '50%', bottom: '-0.5px', translate: '-50%, 0', z: 0 },
      // Pinned inside the body's 61×89 frame (right/top from its edge); given
      // here in slot coordinates. Live: (76,52) (71,47) (71,55).
      dot1: { color: 'rgb(237, 165, 40)', w: 4, h: 5, left: '75.5px', top: '52.5px', opacity: 0 },
      dot2: { color: 'rgb(237, 165, 40)', w: 4, h: 5, left: '70.5px', top: '47.5px', opacity: 0 },
      dot3: { color: 'rgb(237, 165, 40)', w: 4, h: 6, left: '70.5px', top: '55.5px', opacity: 0 },
    },
    steps: [
      { ms: 1000, show: ['body', 'dot1', 'dot2', 'dot3'] },
      { ms: 200, show: ['body', 'dot1', 'dot2', 'dot3'], layers: {
        dot1: { opacity: 1 }, dot2: { opacity: 1 }, dot3: { opacity: 1 } } },
      { ms: 1000, show: ['body', 'dot1', 'dot2', 'dot3'], layers: {
        dot1: { opacity: 1, color: 'rgb(255, 162, 0)', left: '76.5px', top: '47.5px' },
        dot2: { opacity: 1, color: 'rgb(255, 162, 0)', top: '43.5px' },
        dot3: { opacity: 1, color: 'rgb(255, 162, 0)', h: 5, left: '71.5px', top: '51.5px' } } },
    ],
  },

  feynman: {
    box: { w: 110, h: 110 },
    layers: {
      body: { src: IMG + 'rHgaD5dsXQ54nAPXqcmliqNsQ.png', h: 92, left: '50%', bottom: '0px', translate: '-50%, 0', z: 0 },
      pi1: { src: IMG + 'Nww4R9zBn2FZJ25uKFF4Tc7MU.png', h: 21, left: '8px', top: '7px', z: 1, rotate: -5 },
      pi2: { src: IMG + 'Nww4R9zBn2FZJ25uKFF4Tc7MU.png', h: 21, left: '0px', top: '30px', z: 1, rotate: -22 },
      pi3: { src: IMG + 'Nww4R9zBn2FZJ25uKFF4Tc7MU.png', h: 21, right: '10px', top: '19px', z: 1, rotate: 10 },
      pi4: { src: IMG + 'Nww4R9zBn2FZJ25uKFF4Tc7MU.png', h: 21, right: '5px', top: '50%', translate: '0, -50%', z: 1, rotate: 25 },
    },
    // Each glyph is a Framer loop effect: duration 0, repeatType "mirror" —
    // a hard snap to the target angle and back, every `ms`. Targets are ±15°
    // from the base angle; measured on the live wrappers.
    loops: [
      { layer: 'pi1', to: 10, ms: 600 },
      { layer: 'pi2', to: -37, ms: 600 },
      { layer: 'pi3', to: 25, ms: 800 },
      { layer: 'pi4', to: 10, ms: 800 },
    ],
  },
}
