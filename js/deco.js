/* Deco engine: seeded randomness, SVG helpers, the ornamental frame generator,
   light glints along the gold lines (and, this being a bad line, the odd desync),
   a scheduler that pauses off-screen, a frame registry, the 3D lift and the grain. */
(function () {
  'use strict';

  const qs = new URLSearchParams(location.search);
  const SEED = +(qs.get('seed') || (Date.now() % 1e9));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches || qs.has('still');

  // ---------- randomness ----------
  function rng(seed) {
    let a = seed >>> 0;
    const r = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.range = (lo, hi) => lo + r() * (hi - lo);
    r.int = (lo, hi) => Math.floor(r.range(lo, hi + 1));
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    r.chance = p => r() < p;
    return r;
  }
  const R = rng(SEED);

  // ---------- svg ----------
  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const pts = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

  // ---------- palettes (line colours per section) ----------
  const PAL = {
    teal:  { gold: '#c9a24e', goldHi: '#e7cc85', orange: '#b8582a', sage: 'rgba(143,170,112,.22)', under: 'rgba(4,16,13,.6)', lattice: 'rgba(0,0,0,.2)', lattice2: 'rgba(214,180,100,.045)' },
    jade:  { gold: '#cfa655', goldHi: '#f0d592', orange: '#b8582a', sage: 'rgba(127,214,174,.16)', under: 'rgba(2,20,14,.6)', lattice: 'rgba(0,0,0,.18)', lattice2: 'rgba(127,214,174,.05)' },
    coral: { gold: '#cfa655', goldHi: '#f0d592', orange: '#2f7a6d', sage: 'rgba(242,164,143,.18)', under: 'rgba(30,6,2,.55)', lattice: 'rgba(0,0,0,.16)', lattice2: 'rgba(240,200,120,.05)' },
    night: { gold: '#c9a24e', goldHi: '#f4dc9c', orange: '#c86a36', sage: 'rgba(169,220,239,.14)', under: 'rgba(0,4,10,.6)', lattice: 'rgba(0,0,0,.25)', lattice2: 'rgba(169,220,239,.04)' }
  };

  /* A frame is drawn into an <svg class="deco-frame"> covering its section.
     Lines are polylines over a dark underlay (embossed); lines that can carry light are kept. */
  function Frame(svg, pal) { this.svg = svg; this.pal = PAL[pal] || PAL.teal; this.glintables = []; }
  Frame.prototype.clear = function (w, h) {
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.svg.textContent = '';
    this.glintables = [];
    this.w = w; this.h = h;
    this.gUnder = el('g', { fill: 'none', 'stroke-linejoin': 'miter', 'stroke-linecap': 'square' }, this.svg);
    this.gTop = el('g', { fill: 'none', 'stroke-linejoin': 'miter', 'stroke-linecap': 'square' }, this.svg);
    this.gGlint = el('g', { fill: 'none', 'stroke-linecap': 'round' }, this.svg);
  };
  // kind: gold | thin | orange | othin | sage | hair
  Frame.prototype.line = function (p, kind, closed, opts) {
    const P = this.pal, o = opts || {};
    const spec = {
      gold: [P.gold, 3.2, true], thin: [P.gold, 1.6, true], orange: [P.orange, 3.2, true],
      othin: [P.orange, 1.6, true], sage: [P.sage, 11, false], hair: [P.gold, .8, false]
    }[kind] || [P.gold, 3, true];
    const tag = closed ? 'polygon' : 'polyline';
    const d = pts(p);
    if (spec[2]) el(tag, { points: d, stroke: P.under, 'stroke-width': spec[1] + 2.6 }, this.gUnder);
    const n = el(tag, { points: d, stroke: o.color || spec[0], 'stroke-width': o.width || spec[1], opacity: o.opacity }, kind === 'sage' ? this.gUnder : this.gTop);
    if (kind !== 'sage' && kind !== 'hair' && o.glint !== false) this.glintables.push(closed ? p.concat([p[0]]) : p);
    return n;
  };
  Frame.prototype.rect = function (x, y, w, h, kind) { return this.line([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], kind, true); };
  Frame.prototype.hex = function (x, y, w, h, tip, kind) {
    return this.line([[x + tip, y], [x + w - tip, y], [x + w, y + h / 2], [x + w - tip, y + h], [x + tip, y + h], [x, y + h / 2]], kind, true);
  };
  Frame.prototype.diamond = function (cx, cy, r, kind, ry) {
    ry = ry || r;
    return this.line([[cx, cy - ry], [cx + r, cy], [cx, cy + ry], [cx - r, cy]], kind, true);
  };
  // a pattern laid under everything: diagonal lattice, or fish-scale fans
  Frame.prototype._under = function (defs, id) {
    const r = el('rect', { x: 0, y: 0, width: this.w, height: this.h, fill: `url(#${id})` });
    this.svg.insertBefore(r, this.gUnder); this.svg.insertBefore(defs, r);
  };
  Frame.prototype.lattice = function (size, angle, fine) {
    const P = this.pal, id = 'lat' + Math.floor(R() * 1e9);
    const defs = el('defs', null);
    const pat = el('pattern', { id, width: size, height: size, patternUnits: 'userSpaceOnUse', patternTransform: `rotate(${angle})` }, defs);
    el('path', { d: `M0 0L${size} ${size}M${size} 0L0 ${size}`, stroke: P.lattice, 'stroke-width': 1.4, fill: 'none' }, pat);
    if (fine) {
      const s2 = size / fine; let d = '';
      for (let i = 1; i < fine; i++) d += `M${i * s2} 0V${size}M0 ${i * s2}H${size}`;
      el('path', { d, stroke: P.lattice2, 'stroke-width': .8, fill: 'none' }, pat);
    }
    this._under(defs, id);
  };
  Frame.prototype.fans = function (size, color, opacity) {
    const id = 'fan' + Math.floor(R() * 1e9), r = size / 2;
    const defs = el('defs', null);
    const p = el('pattern', { id, width: size, height: r, patternUnits: 'userSpaceOnUse' }, defs);
    el('path', { d: `M0 ${r}A${r} ${r} 0 0 1 ${size} ${r}M${-r} 0A${r} ${r} 0 0 1 ${r} 0M${r} 0A${r} ${r} 0 0 1 ${size + r} 0`, fill: 'none', stroke: color, 'stroke-width': 1, opacity }, p);
    el('path', { d: `M${r * .35} ${r}A${r * .65} ${r * .65} 0 0 1 ${size - r * .35} ${r}`, fill: 'none', stroke: color, 'stroke-width': .6, opacity: opacity * .6 }, p);
    this._under(defs, id);
  };
  // a horizontal rail that climbs in ziggurat steps somewhere in the middle
  Frame.prototype.stepBand = function (y, r, kind, amp) {
    const w = this.w, mid = w * r.range(.35, .65), a = amp || 14;
    const p = [[0, y]], n = r.int(2, 4), sw = r.range(26, 44);
    let x = mid - n * sw - r.range(40, 120);
    p.push([x, y]);
    for (let i = 0; i < n; i++) { p.push([x, y - a * (i + 1)]); x += sw; p.push([x, y - a * (i + 1)]); }
    x += r.range(40, 160); p.push([x, y - a * n]);
    for (let i = n; i > 0; i--) { p.push([x, y - a * (i - 1)]); x += sw; p.push([x, y - a * (i - 1)]); }
    p.push([w, y]);
    this.line(p, kind);
  };

  /* Corner motif: offset brackets and crossed L's in gold/orange, a diagonal with its
     translucent sage twin, stepped verticals, rivets. Corner-local coords mapped by sx/sy,
     so no two corners are mirror images. */
  Frame.prototype.corner = function (ox, oy, sx, sy, r, scale, opts) {
    const o = opts || {}, s = scale || 1;
    const M = p => p.map(([x, y]) => [ox + sx * x * s, oy + sy * y * s]);
    const L = (p, k) => this.line(M(p), k);
    const a = r.range(38, 52), b = r.range(150, 210);
    L([[a, o.short ? b : b + r.range(80, 200)], [a, a], [b + r.range(40, 140), a]], 'gold');
    const kinds = ['cross', 'bracket', 'notch', 'hatch', 'cross'];
    for (let i = r.int(0, 3), n = i + r.int(2, 3); i < n; i++) {
      const x = r.range(10, 80), y = r.range(10, 80), w = r.range(50, 120), h = r.range(70, 170);
      const flip = r.chance(.5), W2 = flip ? h : w, H2 = flip ? w : h, k = i % 2 ? 'orange' : 'gold';
      const ov = r.range(10, 28);
      switch (kinds[i % kinds.length]) {
        case 'cross':
          L([[x - ov, y], [x + W2, y]], k); L([[x, y - ov], [x, y + H2]], k);
          L([[x + W2 * r.range(.4, .8), y + H2 + ov * .6], [x + W2 * r.range(.4, .8), y + H2 * .45]], 'thin');
          break;
        case 'bracket':
          L([[x + W2 + ov, y], [x, y], [x, y + H2], [x + W2 * .6, y + H2]], k);
          break;
        case 'notch': {
          const q = Math.min(W2, H2) * .22;
          L([[x, y], [x + W2 - 2 * q, y], [x + W2 - 2 * q, y + q], [x + W2 - q, y + q], [x + W2 - q, y + 2 * q], [x + W2, y + 2 * q], [x + W2, y + H2], [x, y + H2], [x, y]], k);
          break;
        }
        case 'hatch': {
          const p = M([[x, y], [x + W2, y], [x + W2, y + H2 * .6], [x, y + H2 * .6]]);
          el('polygon', { points: pts(p), fill: this.pal.sage, opacity: .55 }, this.gUnder);
          for (let t = 12; t < W2 + H2 * .6; t += 9) {
            const a2 = [x + Math.min(t, W2), y + Math.max(0, t - W2)], b2 = [x + Math.max(0, t - H2 * .6), y + Math.min(t, H2 * .6)];
            this.line(M([a2, b2]), 'hair', false, { opacity: .5 });
          }
          L([[x - ov, y + H2 * .6], [x + W2 + ov, y + H2 * .6]], k);
          break;
        }
      }
    }
    const hb = r.range(56, 76);
    L([[r.range(2, 10), hb], [r.range(110, 160), hb]], 'orange');
    const vb = r.range(18, 30);
    L([[vb, r.range(30, 60)], [vb, o.short ? r.range(150, 210) : r.range(250, 420)]], r.chance(.5) ? 'gold' : 'orange');
    const d0 = r.range(150, 220), d1 = r.range(120, 170);
    L([[0, d0], [d1, d0 - d1]], 'gold');
    const off = r.range(20, 36);
    this.line(M([[off, d0 + off * .4], [d1 + off * .6, d0 - d1 + off * .4 + 10]]), 'sage');
    if (!o.noSteps) {
      let x = r.range(40, 60), y = r.range(240, 300);
      const p = [[x, y]];
      for (let i = 0; i < 2; i++) { y += r.range(30, 60); p.push([x, y]); x += r.range(22, 40); p.push([x, y]); }
      p.push([x, y + r.range(30, 70)]);
      L(p, 'orange');
      L([[p[0][0] + 18, p[0][1] + 20], [p[0][0] + 18, p[2][1] + 30]], 'othin');
    }
    for (let i = 0; i < r.int(1, 3); i++) {
      const x = r.range(10, 120), y = r.range(10, 120), q = r.range(6, 11);
      L([[x, y], [x + q, y], [x + q, y + q], [x, y + q], [x, y]], 'thin');
    }
  };

  /* Travelling light: a short bright dash running along a random gold line. */
  function polyLen(p) { let l = 0; for (let i = 1; i < p.length; i++) l += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return l; }
  Frame.prototype.glint = function () {
    if (!this.glintables.length) return;
    const p = R.pick(this.glintables), len = polyLen(p);
    if (len < 40) return;
    const g = el('g', null, this.gGlint);
    const dash = Math.min(len * .35, R.range(40, 110));
    const attrs = { points: pts(p), 'stroke-dasharray': `${dash} ${len + dash}`, 'stroke-dashoffset': dash };
    const halo = el('polyline', Object.assign({ stroke: this.pal.goldHi, 'stroke-width': 7, opacity: .22 }, attrs), g);
    const core = el('polyline', Object.assign({ stroke: '#fff4cf', 'stroke-width': 1.8 }, attrs), g);
    const dir = R.chance(.5), from = dir ? dash : -len, to = dir ? -len : dash;
    const dur = Math.max(900, len * R.range(2.2, 4.5));
    const kf = [{ strokeDashoffset: from, opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .8 }, { strokeDashoffset: to, opacity: 0 }];
    [halo, core].forEach(n => n.animate(kf, { duration: dur, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' }));
    setTimeout(() => g.remove(), dur + 50);
  };
  /* Desync: a few gold lines lose register for a moment and show their colour channels. */
  Frame.prototype.desync = function () {
    if (!this.glintables.length) return;
    const g = el('g', { style: 'mix-blend-mode:screen' }, this.gGlint);
    const n = R.int(2, 6), dx = R.range(4, 12) * (R.chance(.5) ? 1 : -1);
    for (let i = 0; i < n; i++) {
      const p = R.pick(this.glintables), d = pts(p);
      el('polyline', { points: d, stroke: '#ff3d7f', 'stroke-width': 2.4, transform: `translate(${dx} 0)`, opacity: .9 }, g);
      el('polyline', { points: d, stroke: '#3df2ff', 'stroke-width': 2.4, transform: `translate(${-dx * .6} ${R.range(-2, 2)})`, opacity: .9 }, g);
    }
    const t0 = performance.now(), dur = R.range(140, 360);
    const step = () => {
      const k = (performance.now() - t0) / dur;
      if (k >= 1) { g.remove(); return; }
      g.setAttribute('transform', `translate(${(R() - .5) * 10 * (1 - k)} 0)`);
      g.style.opacity = R.chance(.25) ? 0 : 1;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- visibility, random scheduler, rAF loop ---------- */
  const visible = new WeakMap();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
    es.forEach(e => { visible.set(e.target, e.isIntersecting); e.target.classList.toggle('in-view', e.isIntersecting); });
  }, { rootMargin: '80px 0px' }) : null;
  function watch(n) { if (io) io.observe(n); else visible.set(n, true); }
  function isOn(n) { return !document.hidden && visible.get(n) !== false; }
  function every(section, lo, hi, fn) {
    if (REDUCED) return;
    watch(section);
    const tick = () => {
      if (isOn(section)) { try { fn(); } catch (e) { console.error(e); } }
      setTimeout(tick, R.range(lo, hi));
    };
    setTimeout(tick, R.range(lo * .3, hi));
  }

  /* ---------- frame registry: each section draws its own frame, redrawn on resize with the same seed ---------- */
  const frames = [];
  function registerFrame(section, pal, draw, svgEl) {
    const svg = svgEl || section.querySelector(':scope > .deco-frame'); if (!svg) return null;
    const f = new Frame(svg, pal); f.section = section; f.host = svgEl || section; f.seed = Math.floor(R() * 1e9); f.draw = draw;
    frames.push(f); watch(section); redraw(f);
    return f;
  }
  function redraw(f) {
    const b = f.host.getBoundingClientRect();
    if (!b.width || !b.height) return;
    f.clear(b.width, b.height);
    const rel = n => { const r = n.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height, r: r.right - b.left, b: r.bottom - b.top }; };
    f.draw(f, b.width, b.height, rng(f.seed), rel);
  }
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => frames.forEach(redraw), 160); });
  addEventListener('load', () => frames.forEach(redraw));
  if (document.fonts) document.fonts.ready.then(() => frames.forEach(redraw));
  // light running along the gold lines of whichever frame is on screen
  every(document.body, 700, 2200, () => {
    const on = frames.filter(f => isOn(f.section));
    if (on.length) R.pick(on).glint();
    if (on.length && R.chance(.3)) R.pick(on).glint();
  });

  /* ---------- arches (used by the brush counter): zig | spire | hex | round ---------- */
  function archPts(type, x0, y0, x1, y1, ht) {
    const w = x1 - x0, m = (x0 + x1) / 2;
    if (type === 'zig') {
      const sw = w * .15, sh = ht / 3;
      return [[x0, y1], [x0, y0 + ht], [x0 + sw, y0 + ht], [x0 + sw, y0 + ht - sh], [x0 + 2 * sw, y0 + ht - sh], [x0 + 2 * sw, y0], [x1 - 2 * sw, y0],
        [x1 - 2 * sw, y0 + ht - sh], [x1 - sw, y0 + ht - sh], [x1 - sw, y0 + ht], [x1, y0 + ht], [x1, y1]];
    }
    if (type === 'spire') return [[x0, y1], [x0, y0 + ht], [m, y0], [x1, y0 + ht], [x1, y1]];
    if (type === 'hex') return [[x0, y1], [x0, y0 + ht * .55], [x0 + w * .26, y0], [x1 - w * .26, y0], [x1, y0 + ht * .55], [x1, y1]];
    const rr = w / 2, cy = y0 + rr, p = [[x0, y1], [x0, cy]];
    for (let i = 1; i < 24; i++) { const a = Math.PI + i / 24 * Math.PI; p.push([m + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    p.push([x1, cy]); p.push([x1, y1]);
    return p;
  }
  function drawArch(f, w, h, r, type, c) {
    const P = f.pal, inset = 6;
    const ht = type === 'round' ? w / 2 : Math.min(w * .62, 150);
    const outer = archPts(type, inset, inset, w - inset, h - inset, ht);
    const defs = el('defs', null);
    const gid = 'ag' + Math.floor(r() * 1e9), g = el('radialGradient', { id: gid, cx: .5, cy: .32, r: .8 }, defs);
    el('stop', { offset: 0, 'stop-color': c[0] }, g); el('stop', { offset: .55, 'stop-color': c[1] }, g); el('stop', { offset: 1, 'stop-color': c[2] }, g);
    const cid = 'ac' + Math.floor(r() * 1e9), clip = el('clipPath', { id: cid }, defs);
    el('polygon', { points: pts(outer) }, clip);
    const back = el('g', null); f.svg.insertBefore(back, f.gUnder); f.svg.insertBefore(defs, back);
    el('polygon', { points: pts(outer), fill: `url(#${gid})` }, back);
    const rays = el('g', { 'clip-path': `url(#${cid})`, stroke: P.gold, 'stroke-width': 1, opacity: .28 }, back);
    const cx = w / 2, cy = Math.min(h * .4, ht + 80), n = r.int(13, 19), spread = r.range(1.9, 2.6);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / (n - 1) - .5) * spread;
      el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * h, y2: cy + Math.sin(a) * h }, rays);
    }
    el('rect', { x: 0, y: inset + ht + r.range(8, 22), width: w, height: r.range(3, 7), fill: P.orange, opacity: .35, 'clip-path': `url(#${cid})` }, back);
    f.line(outer, 'gold');
    f.line(archPts(type, inset + 9, inset + 9, w - inset - 9, h - inset, Math.max(10, ht - 9)), 'thin');
    const d = r.range(-4, 4);
    f.line(archPts(type, inset - 7 + d, inset - 8, w - inset + 7 + d, h - inset - r.range(40, 120), ht + 4), 'othin');
    if (type === 'zig' || type === 'hex') f.diamond(w / 2, inset + 2, 9, 'gold');
    if (type === 'spire') f.line([[w / 2, inset - 18], [w / 2, inset + 20]], 'gold');
    f.line([[inset - 4, h - 4], [w - inset + 4, h - 4]], 'gold');
  }

  /* ---------- 3D lift: hover follows the pointer, a tap pins it ---------- */
  function initLift(root) {
    (root || document).querySelectorAll('.lift').forEach(n => {
      if (n._lift) return; n._lift = true;
      const fine = matchMedia('(hover: hover)').matches, max = +(n.dataset.tilt || 14);
      const set = (rx, ry) => { n.style.setProperty('--rx', rx.toFixed(2) + 'deg'); n.style.setProperty('--ry', ry.toFixed(2) + 'deg'); };
      const from = e => {
        const b = n.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)), y = Math.min(1, Math.max(0, (e.clientY - b.top) / b.height));
        set((.5 - y) * max, (x - .5) * max);
      };
      n.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && fine) { n.classList.add('is-lifted'); from(e); } });
      n.addEventListener('pointermove', e => { if (n.classList.contains('is-lifted') && e.pointerType === 'mouse') { n.classList.add('tracking'); from(e); } });
      n.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { n.classList.remove('is-lifted', 'tracking'); set(0, 0); } });
      n.querySelectorAll('[data-z]').forEach(c => c.style.setProperty('--z', c.dataset.z));
      set(0, 0);
    });
  }

  /* ---------- film grain tile ---------- */
  (function grain() {
    const n = document.querySelector('.grain'); if (!n) return;
    const c = document.createElement('canvas'); c.width = c.height = 180;
    const x = c.getContext('2d'), d = x.createImageData(180, 180);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 128 + (Math.random() - .5) * 190 * Math.random();
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    x.putImageData(d, 0, 0);
    n.style.backgroundImage = `url(${c.toDataURL()})`;
    if (!REDUCED) setInterval(() => { n.style.transform = `translate(${(Math.random() * 60) | 0}px,${(Math.random() * 60) | 0}px)`; }, 110);
  })();

  window.Deco = { SEED, REDUCED, R, rng, el, pts, PAL, Frame, every, watch, isOn, registerFrame, redrawAll: () => frames.forEach(redraw), frames, archPts, drawArch, initLift };
})();
