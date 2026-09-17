/* Derives the baked-in Philippine coastline for index.html.

   Source : Natural Earth 1:10m Admin 0 Countries, public domain, via the
            world-atlas TopoJSON build (countries-10m.json), feature id 608.
   Output : coastline.txt — the encoded string pasted into index.html as PH_COAST.

   Pipeline: decode TopoJSON arcs -> outer ring per island -> drop rings under
   minArea -> Douglas-Peucker at tol -> quantise to 1/100 deg -> delta-encode
   in base36. Re-run this to regenerate; it is not needed at run time.  */

import { writeFileSync } from 'node:fs';

const TOL = 0.020;      // Douglas-Peucker tolerance, degrees (~0.6 px on a 300px map)
const MIN_AREA = 0.002; // drop islands under ~1.6 px^2 — they cannot render legibly
const OUT = new URL('./coastline.txt', import.meta.url);

const topo = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json')).json();
const { scale, translate } = topo.transform, arcs = topo.arcs;

const decodeArc = i => {
  const rev = i < 0; if (rev) i = ~i;
  let x = 0, y = 0;
  const out = arcs[i].map(d => { x += d[0]; y += d[1];
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; });
  return rev ? out.reverse() : out;
};
const ringOf = idxs => idxs.reduce((p, a, n) => p.concat(n ? decodeArc(a).slice(1) : decodeArc(a)), []);
const area = r => { let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += r[j][0] * r[i][1] - r[i][0] * r[j][1];
  return Math.abs(a / 2); };

function dp(pts, tol) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  (function rec(s, e) {
    let md = -1, mi = -1;
    const [x1, y1] = pts[s], [x2, y2] = pts[e], dx = x2 - x1, dy = y2 - y1, dd = dx * dx + dy * dy;
    for (let i = s + 1; i < e; i++) {
      const [x, y] = pts[i];
      let t = dd ? ((x - x1) * dx + (y - y1) * dy) / dd : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = x1 + t * dx - x, ey = y1 + t * dy - y, d = ex * ex + ey * ey;
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol * tol) { keep[mi] = 1; rec(s, mi); rec(mi, e); }
  })(0, pts.length - 1);
  return pts.filter((_, i) => keep[i]);
}

const geom = topo.objects.countries.geometries.find(g => g.id === '608');
if (!geom) throw new Error('Philippines (608) not found in source');

const rings = geom.arcs.map(p => ringOf(p[0]))
  .filter(r => area(r) >= MIN_AREA)
  .sort((a, b) => area(b) - area(a))
  .map(r => { const s = dp(r, TOL); return s.length >= 4 ? s : r; })
  .filter(r => r.length >= 4);

const enc = n => (n < 0 ? '-' : '') + Math.abs(n).toString(36);
const blob = rings.map(r => {
  let px = Math.round(r[0][0] * 100), py = Math.round(r[0][1] * 100);
  const out = [enc(px), enc(py)];
  for (let i = 1; i < r.length; i++) {
    const x = Math.round(r[i][0] * 100), y = Math.round(r[i][1] * 100);
    if (x === px && y === py) continue;
    out.push(enc(x - px) + '.' + enc(y - py)); px = x; py = y;
  }
  return out.join(',');
}).join('|');

writeFileSync(OUT, blob);
console.log(JSON.stringify({
  islands: rings.length,
  points: rings.reduce((a, r) => a + r.length, 0),
  chars: blob.length,
  kb: +(blob.length / 1024).toFixed(1),
  largestAreasDeg2: rings.slice(0, 3).map(r => +area(r).toFixed(2))
}, null, 2));
