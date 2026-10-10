"""Draws the app's four tab icons with gently bent lines, so they look drawn
by hand rather than ruled, and writes them out twice:

  assets/icons/<name>.svg   to look at and share
  mobile/src/tabIcons.js    what the app draws (DrawnIcons.js)

Run it from anywhere: python3 assets/icons/make-icons.py

Each shape is first laid out clean (straight lines, true curves), then
1. every straight line is bowed sideways a little, by nothing at its two ends,
   so corners and joins stay where they were;
2. the whole drawing is warped by one smooth, slow displacement field, so
   strokes that touch keep touching.
The randomness is seeded, so the output is the same on every run. Wobble,
open loops and uneven line weight were tried and rejected.
"""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
APP_FILE = os.path.join(HERE, '..', '..', 'mobile', 'src', 'tabIcons.js')

BOW = 0.025             # a line's sideways bow, as a share of its length (at most)
WARP_PT = 0.3           # how far the field moves a point, in pt at the drawn size
WARP_WAVELENGTH_PT = 22 # how slowly it changes, in pt
SEED = 3

_bow_rnd = random.Random(11)


def cubic(p0, p1, p2, p3, n):
    pts = []
    for i in range(n + 1):
        t = i / n; m = 1 - t
        pts.append((m**3*p0[0] + 3*m*m*t*p1[0] + 3*m*t*t*p2[0] + t**3*p3[0],
                    m**3*p0[1] + 3*m*m*t*p1[1] + 3*m*t*t*p2[1] + t**3*p3[1]))
    return pts


def quad(p0, p1, p2, n):
    return [((1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0],
             (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1]) for t in (i / n for i in range(n + 1))]


def line(a, b, n):
    # Bowed to one side or the other, by a sine that is nothing at both ends.
    L = math.dist(a, b) or 1
    nx, ny = -(b[1] - a[1]) / L, (b[0] - a[0]) / L
    k = BOW * L * _bow_rnd.choice((-1, 1)) * _bow_rnd.uniform(0.6, 1)
    return [(a[0] + (b[0] - a[0]) * i / n + nx * k * math.sin(math.pi * i / n),
             a[1] + (b[1] - a[1]) * i / n + ny * k * math.sin(math.pi * i / n)) for i in range(n + 1)]


def arc(c, r, a0, a1, n):
    return [(c[0] + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             c[1] + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def circle(c, r, start=0):
    return arc(c, r, start, start + 360, 90)


def join(*parts):
    out = list(parts[0])
    for p in parts[1:]:
        out += p[1:]
    return out


def rot(pts, deg, c):
    a = math.radians(deg); ca, sa = math.cos(a), math.sin(a)
    return [(c[0] + (x - c[0]) * ca - (y - c[1]) * sa, c[1] + (x - c[0]) * sa + (y - c[1]) * ca) for x, y in pts]


def resample(pts, step):
    # Evenly spaced points along the polyline.
    d = [0]
    for i in range(1, len(pts)):
        d.append(d[-1] + math.dist(pts[i - 1], pts[i]))
    L = d[-1]; n = max(2, int(L / step)); out = []; j = 0
    for k in range(n + 1):
        s = L * k / n
        while j < len(d) - 2 and d[j + 1] < s:
            j += 1
        seg = d[j + 1] - d[j] or 1; t = (s - d[j]) / seg
        out.append((pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t))
    return out


# The shapes, each a list of strokes (polylines). Changing the order of the
# line() calls changes every bow after it, since they share one random series.

def crown():  # A La Une
    P = [(50, 85.8), (88, 84.5), (90, 23.5), (59.5, 51), (46.5, 16), (33, 55), (9.5, 30), (12, 85.5)]
    pts = line(P[0], P[1], 20)
    for a, b in zip(P[1:-1], P[2:]):
        pts = join(pts, line(a, b, 30))
    return [join(pts, quad((12, 85.5), (31, 85.9), (50, 85.8), 10))]


def ticket():  # Rubriques, tilted 25°
    R = lambda p: rot(p, -25, (50, 50))
    body = join(line((50, 30), (86, 30), 20), quad((86, 30), (90, 30), (90, 34), 6), line((90, 34), (90, 42), 6),
                arc((90, 50), 8, -90, -270, 20), line((90, 58), (90, 66), 6), quad((90, 66), (90, 70), (86, 70), 6),
                line((86, 70), (14, 70), 40), quad((14, 70), (10, 70), (10, 66), 6), line((10, 66), (10, 58), 6),
                arc((10, 50), 8, 90, -90, 20), line((10, 42), (10, 34), 6), quad((10, 34), (10, 30), (14, 30), 6),
                line((14, 30), (50, 30), 20))
    return [R(body), R(line((64, 40), (64, 60), 10))]


def people():  # Voisinage
    # The side figures' shoulders end on the middle figure's arch, and the
    # base line is bowed in three pieces that meet the arch's legs: bowed in
    # one piece, it let the legs run through it.
    return [circle((457.5, 150), 79, 150), circle((212, 250), 63, 170), circle((703, 250), 63, 190),
            join(cubic((283, 553), (283, 400), (360, 307), (457.5, 307), 40), cubic((457.5, 307), (555, 307), (632, 400), (632, 553), 40)),
            join(cubic((75, 553), (75, 440), (130, 368), (205, 368), 30), cubic((205, 368), (252, 368), (290, 385), (312, 408), 12)),
            join(cubic((840, 553), (840, 440), (785, 368), (710, 368), 30), cubic((710, 368), (663, 368), (625, 385), (603, 408), 12)),
            join(line((75, 553), (283, 553), 16), line((283, 553), (632, 553), 28), line((632, 553), (840, 553), 16))]


def palette():  # A Propos
    outline = join(cubic((8, 56), (8, 30), (28, 8), (56, 8), 30), cubic((56, 8), (78, 8), (94, 20), (94, 36), 20),
                   cubic((94, 36), (94, 48), (86, 52), (78, 54), 12), cubic((78, 54), (70, 56), (66, 60), (68, 68), 10),
                   cubic((68, 68), (70, 82), (62, 91), (46, 92), 16), cubic((46, 92), (24, 94), (8, 78), (8, 56), 20))
    return [outline, circle((62, 30), 6, 200), circle((36, 42), 6, 140), circle((30, 70), 6, 250)]


# viewBox, drawn height in pt of that viewBox (as in the tab bar), stroke width in viewBox
# units (about 1.7pt at that height for each; 1.45pt looked too light), and
# the strokes. Voisinage is drawn taller than its first 16.7pt, at which it
# looked smaller than the others; `warpAt` keeps it warped as it was
# approved at that height, since the warp is measured in pt.
ICONS = {
    'a-la-une': dict(viewBox=(0, 0, 100, 100), height=25, strokeWidth=6.8, strokes=crown()),
    'rubriques': dict(viewBox=(0, 0, 100, 100), height=25, strokeWidth=6.8, strokes=ticket()),
    'voisinage': dict(viewBox=(30, 40, 855, 560), height=18.5, warpAt=16.7, strokeWidth=51.5, strokes=people()),
    'a-propos': dict(viewBox=(0, 0, 100, 100), height=23, strokeWidth=7.4, strokes=palette()),
}


def warp():
    rnd = random.Random(SEED); waves = []
    for _ in range(2):
        ang = rnd.uniform(0, 2 * math.pi)
        f = 2 * math.pi / WARP_WAVELENGTH_PT
        waves.append((math.cos(ang) * f, math.sin(ang) * f, rnd.uniform(0, 6.3), rnd.uniform(0, 6.3)))

    def D(x, y):
        dx = sum(math.sin(fx * x + fy * y + p) for fx, fy, p, q in waves) / len(waves) * WARP_PT
        dy = sum(math.sin(fy * x - fx * y + q) for fx, fy, p, q in waves) / len(waves) * WARP_PT
        return dx, dy
    return D


def num(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


def draw(icon):
    u = icon['viewBox'][3] / icon.get('warpAt', icon['height'])  # viewBox units per pt
    D = warp(); parts = []; ink = []
    for pts in icon['strokes']:
        L = sum(math.dist(pts[i - 1], pts[i]) for i in range(1, len(pts)))
        pts = resample(pts, min(1.2 * u, L / 48))
        pts = [(x + D(x / u, y / u)[0] * u, y + D(x / u, y / u)[1] * u) for x, y in pts]
        parts.append('M' + ' '.join(num(x) + ' ' + num(y) for x, y in pts))
        ink += pts
    return ' '.join(parts), ink


app = {}
for name, icon in ICONS.items():
    d, ink = draw(icon)
    # The viewBox is cropped to the ink (the strokes and half their width
    # around them), so the tab bar can stand every icon on the same line
    # beneath it: each shape left a different margin in its original box.
    # The scale stays the one `height` gives the original box.
    pad = icon['strokeWidth'] / 2
    x0 = min(x for x, y in ink) - pad; x1 = max(x for x, y in ink) + pad
    y0 = min(y for x, y in ink) - pad; y1 = max(y for x, y in ink) + pad
    scale = icon['height'] / icon['viewBox'][3]
    vb = ' '.join(num(v) for v in (x0, y0, x1 - x0, y1 - y0))
    with open(os.path.join(HERE, name + '.svg'), 'w') as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" fill="none" stroke="currentColor" '
                f'stroke-width="{icon["strokeWidth"]}" stroke-linecap="round" stroke-linejoin="round"><path d="{d}"/></svg>\n')
    app[name] = dict(viewBox=vb, width=round((x1 - x0) * scale, 2), height=round((y1 - y0) * scale, 2),
                     strokeWidth=icon['strokeWidth'], d=d)

with open(APP_FILE, 'w') as f:
    f.write('// Written by assets/icons/make-icons.py; change that script and run it\n'
            '// again rather than editing this file. The tab icons, keyed by name:\n'
            '// viewBox, drawn size in pt, stroke width in viewBox units, and the path.\n')
    f.write('export default ' + json.dumps(app, indent=2) + '\n')
print('wrote', ', '.join(name + '.svg' for name in ICONS), 'and mobile/src/tabIcons.js')
