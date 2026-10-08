/* The shop: hero window, the three counters and the footer.
   Each section composes its own seeded deco frame around its measured layout;
   each counter has one thing you can actually do with the product. */
(function () {
  'use strict';
  const { R, rng, el, pts, every, REDUCED, registerFrame, archPts, drawArch, initLift } = window.Deco;
  const { life, perform } = window.DecoIcons;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const anim = (n, kf, o) => (n && n.animate && !REDUCED) ? n.animate(kf, o) : null;
  const press = (group, btn) => $$('.chip', group).forEach(b => b.setAttribute('aria-pressed', b === btn));

  /* ================= HERO ================= */
  const hero = $('.hero');
  function topOrnament(f, cx, y, r, s) {
    f.diamond(cx, y, 40 * s, 'gold', 34 * s);
    f.diamond(cx, y + 2 * s, 24 * s, 'orange', 20 * s);
    f.diamond(cx, y + 3 * s, 10 * s, 'thin');
    for (const side of [-1, 1]) {
      const k = side < 0 ? 1 : r.range(.9, 1.12);
      f.line([[cx + side * 52 * s * k, y - 30 * s], [cx + side * 84 * s * k, y + 2 * s], [cx + side * 160 * s * k, y + 2 * s]], 'orange');
      f.line([[cx + side * 44 * s, y - 40 * s], [cx + side * 70 * s, y - 40 * s], [cx + side * 98 * s * k, y - 12 * s], [cx + side * 250 * s * k, y - 12 * s]], 'gold');
    }
  }
  function fitName() {
    const c = $('.cartouche', hero), n = $('.shop-name', hero);
    n.style.fontSize = '';
    const ch = c.getBoundingClientRect().height, tip = Math.min(70, ch * .5);
    const avail = c.getBoundingClientRect().width - 2 * tip - 12, tw = n.getBoundingClientRect().width;
    if (tw > avail) n.style.fontSize = (parseFloat(getComputedStyle(n).fontSize) * avail / tw).toFixed(1) + 'px';
  }
  registerFrame(hero, 'teal', (f, w, h, r, rel) => {
    fitName();
    const s = Math.min(1, Math.max(.5, w / 1500)), small = w < 720, I = small ? 8 : 12;
    f.lattice(small ? 90 : 150, 0, 5);
    const cart = rel($('.cartouche', hero)), nav = rel($('.nav', hero)), win = rel($('.window', hero));
    const btn = rel($('.hero-copy .btn', hero)), tiles = $$('.tile', hero).map(rel), title = rel($('.rule-title', hero));
    f.rect(I, I, w - 2 * I, h - 2 * I, 'gold');
    f.rect(I + 7, I + 7, w - 2 * I - 14, h - 2 * I - 14, 'thin');
    const tY = Math.max(I + 22, cart.y - 26 * s);
    f.line([[I + 60 * s, tY], [w - I - 60 * s, tY]], 'gold');
    f.line([[I + 110 * s, tY + 12 * s], [w / 2 - 90 * s, tY + 12 * s]], 'thin');
    f.line([[w / 2 + 90 * s, tY + 12 * s], [w - I - 140 * s, tY + 12 * s]], 'thin');
    if (!small) topOrnament(f, w / 2 + r.range(-6, 6), tY - 4 * s, r, s);
    // the cartouche: a double elongated hexagon, rails out of its tips
    const cx0 = cart.x - 10, cw = cart.w + 20, ch = cart.h, tip = Math.min(70, ch * .5);
    f.hex(cx0, cart.y, cw, ch, tip, 'gold');
    f.hex(cx0 + 12 * s, cart.y + 10 * s, cw - 24 * s, ch - 20 * s, tip - 6 * s, 'thin');
    f.line([[I + 7, cart.y + ch / 2], [cx0 - 8, cart.y + ch / 2]], 'hair');
    f.line([[cx0 + cw + 8, cart.y + ch / 2], [w - I - 7, cart.y + ch / 2]], 'hair');
    // nav band
    f.line([[I + 40 * s, nav.y - 8], [w - I - 40 * s, nav.y - 8]], 'gold');
    f.line([[I + 7, nav.b + 8], [w - I - 7, nav.b + 8]], 'gold');
    f.line([[I + 60 * s, nav.b + 16], [w * r.range(.28, .36), nav.b + 16]], 'othin');
    // side rails that jog inward below the band
    const jog = r.range(26, 44) * s;
    if (!small) f.line([[I + 26 * s, tY + 50 * s], [I + 26 * s, nav.b + 38], [I + 26 * s + jog * .5, nav.b + 38 + jog * .5], [I + 26 * s + jog * .5, h - 150 * s]], 'gold');
    if (!small) f.line([[w - I - 26 * s, tY + 40 * s], [w - I - 26 * s, nav.b + 58], [w - I - 26 * s - jog * .7, nav.b + 58 + jog * .7], [w - I - 26 * s - jog * .7, h - 190 * s]], 'orange');
    const cs = small ? .5 : s;
    if (!small) {
      f.corner(I + 6, I + 6, 1, 1, r, cs, { noSteps: true, short: true });
      f.corner(w - I - 6, I + 6, -1, 1, r, cs, { noSteps: true, short: true });
    }
    f.corner(I + 6, h - I - 6, 1, -1, r, cs * .9, { noSteps: true });
    f.corner(w - I - 6, h - I - 6, -1, -1, r, cs * .85, { noSteps: true });
    // the shop window: an offset outer frame and a rail running into the copy
    f.line([[win.x - 14, win.y + win.h * r.range(.55, .7)], [win.x - 14, win.b + 14], [win.r + 14, win.b + 14]], 'othin');
    if (!small) f.line([[win.r - 4, win.y + 60], [w - I - 7, win.y + 60]], 'orange');
    f.line([[btn.x - 9, btn.y - 9], [btn.r + 9, btn.y - 9], [btn.r + 9, btn.b + 9], [btn.x - 9, btn.b + 9]], 'thin', true);
    f.line([[btn.x - 40 * s, btn.y + btn.h / 2], [btn.x - 16, btn.y + btn.h / 2]], 'hair');
    if (tiles.length) {
      const t0 = tiles[0], tl = tiles[tiles.length - 1];
      f.line([[I + 7, tl.b + 14], [w - I - 7, tl.b + 14]], 'gold');
      f.line([[t0.x - 16, t0.y - 14], [tl.r + 16, t0.y - 14], [tl.r + 16, tl.b + 14]], 'thin');
      for (let i = 0; i < tiles.length - 1; i++) { const a = tiles[i], b = tiles[i + 1], y = a.y + a.h * .78; f.line([[a.r + 5, y], [b.x - 5, y]], 'gold'); }
    }
    if (!small) {
      f.line([[I + 7, h - 230 * s], [I + 150 * s, h - I - 7]], 'orange');
      f.line([[I + 40 * s, h - 250 * s], [I + 200 * s, h - I - 20]], 'sage');
    }
    f.line([[title.x - 30 * s, title.b + 6], [title.x + title.w * .25, title.b + 6]], 'hair');
  });

  /* the shop window: brush, frame and tube on a stepped plinth in front of a sunburst */
  (function stillLife() {
    const svg = $('.window .still'); if (!svg) return;
    const W = 640, H = 560, cx = 320, cy = 300;
    const defs = el('defs', null, svg);
    const outer = archPts('zig', 60, 16, 580, 476, 150);
    const clip = el('clipPath', { id: 'winClip' }, defs); el('polygon', { points: pts(outer) }, clip);
    const g0 = el('radialGradient', { id: 'winBg', cx: .5, cy: .5, r: .75 }, defs);
    el('stop', { offset: 0, 'stop-color': '#2d6d61' }, g0); el('stop', { offset: .6, 'stop-color': '#173f39' }, g0); el('stop', { offset: 1, 'stop-color': '#0b2420' }, g0);
    const back = el('g', { 'clip-path': 'url(#winClip)' }, svg);
    el('rect', { width: W, height: H, fill: 'url(#winBg)' }, back);
    // rays
    const cols = ['#c9a24e', '#b8582a', '#efe0bb', '#2f8f6e', '#c9a24e', '#d9725c'];
    const rays = el('g', { opacity: .34 }, back), N = 30;
    for (let i = 0; i < N; i++) {
      const a = -Math.PI + (i + .5) / N * Math.PI * 2, wd = Math.PI * 2 / N * (i % 3 === 0 ? .5 : .22), L = 620;
      el('polygon', { points: pts([[cx, cy], [cx + Math.cos(a - wd / 2) * L, cy + Math.sin(a - wd / 2) * L], [cx + Math.cos(a + wd / 2) * L, cy + Math.sin(a + wd / 2) * L]]), fill: cols[i % cols.length] }, rays);
    }
    // stepped sun, slightly off register
    [[150, '#c9a24e', .5], [128, '#efe0bb', .85], [120, '#b8582a', .6], [96, '#efe0bb', .9], [88, '#1f5a50', .65], [58, '#c9a24e', .75]]
      .forEach(([rr, c, o], j) => el('circle', { cx: cx + (j % 2 ? 3 : 0), cy, r: rr, fill: c, opacity: o }, back));
    for (let i = 0; i < 3; i++) el('circle', { cx, cy, r: 170 + i * 24, fill: 'none', stroke: i % 2 ? '#b8582a' : '#c9a24e', 'stroke-width': 1.2, opacity: .45, 'stroke-dasharray': i === 1 ? '2 7' : null }, back);
    // floor
    el('rect', { x: 0, y: 420, width: W, height: 80, fill: '#0b2420', opacity: .55 }, back);
    // arch outlines
    el('polygon', { points: pts(outer), fill: 'none', stroke: 'rgba(4,16,13,.6)', 'stroke-width': 8 }, svg);
    el('polygon', { points: pts(outer), fill: 'none', stroke: '#c9a24e', 'stroke-width': 4 }, svg);
    el('polyline', { points: pts(archPts('zig', 74, 30, 566, 476, 136)), fill: 'none', stroke: '#c9a24e', 'stroke-width': 1.5 }, svg);
    el('polyline', { points: pts(archPts('zig', 46, 4, 596, 380, 160)), fill: 'none', stroke: '#b8582a', 'stroke-width': 1.8 }, svg);
    // plinth: three steps
    [[110, 456, 420, 22, '#1f5a50'], [70, 478, 500, 26, '#6a2818'], [36, 504, 568, 34, '#173f39']].forEach(([x, y, w, h, c]) => {
      el('rect', { x, y, width: w, height: h, fill: c }, svg);
      el('path', { d: `M${x} ${y}h${w}`, stroke: '#e2c277', 'stroke-width': 2.4 }, svg);
      el('path', { d: `M${x + 6} ${y + 6}h${w - 12}`, stroke: '#c9a24e', 'stroke-width': .8, opacity: .6 }, svg);
    });
    el('path', { d: 'M300 517l20-8 20 8-20 8z', fill: 'none', stroke: '#e2c277', 'stroke-width': 1.6 }, svg);
    // the three products (emblem markup, scaled up)
    const put = (name, tf, paint) => {
      const g = el('g', { transform: tf, class: 'emblem still-' + name, style: `--paint:${paint}` }, svg);
      g.innerHTML = window.DecoIcons.ICONS[name];
      return g;
    };
    el('ellipse', { cx: 300, cy: 458, rx: 150, ry: 9, fill: '#04100d', opacity: .45 }, svg);
    put('frame', 'translate(166 196) rotate(-4 50 91) scale(2.66)', '#d9725c');
    put('tube', 'translate(372 222) scale(2.44)', '#5fa9c6');
    put('brush', 'translate(18 236) scale(3.2)', '#2f8f6e');
    // a gold drip from the brush, still wet
    el('path', { d: 'M150 304c4 7 6 11 6 14a6 6 0 0 1-12 0c0-3 2-7 6-14z', fill: '#2f8f6e', stroke: '#0c2a22', 'stroke-width': 1.2, class: 'still-drip' }, svg);
    const drip = $('.still-drip', svg);
    every(hero, 3200, 7000, () => anim(drip, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(0)', opacity: 1, offset: .3 }, { transform: 'translateY(140px)', opacity: 0 }], { duration: 1500, easing: 'cubic-bezier(.5,0,1,.6)' }));
  })();
  life(hero);

  /* minibar + the brass button tilt */
  const bar = $('.minibar');
  const onScroll = () => bar.classList.toggle('show', scrollY > hero.offsetHeight * .75);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $$('.btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--ty', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(1) + 'deg');
      b.style.setProperty('--tx', ((.5 - (e.clientY - r.top) / r.height) * 18).toFixed(1) + 'deg');
    });
    b.addEventListener('pointerleave', () => { b.style.setProperty('--tx', '0deg'); b.style.setProperty('--ty', '0deg'); });
  });
  initLift();

  /* shared: a rail under a counter's band heading */
  function underBand(f, sec, r) {
    const b = $('.band', sec), hb = b && b.getBoundingClientRect(), sb = sec.getBoundingClientRect();
    if (!hb) return;
    const x = hb.left - sb.left, y = hb.bottom - sb.top;
    f.line([[x - 40, y + 16], [x + hb.width * 1.25, y + 16]], 'gold');
    f.line([[x - 40, y + 24], [x + hb.width * r.range(.5, .8), y + 24]], 'othin');
  }

  /* ================= I. BRUSHES ================= */
  const brushes = $('.brushes');
  (function () {
    const sec = brushes; if (!sec) return;
    registerFrame(sec, 'jade', (f, w, h, r, rel) => {
      f.fans(w < 700 ? 44 : 64, '#9be0c0', .08);
      const s = Math.min(1, w / 1500);
      f.stepBand(30, r, 'gold', 12);
      f.line([[0, 42], [w, 42]], 'othin');
      if (w > 720) f.corner(w - 8, 60, -1, 1, r, s * .8);
      f.corner(8, h - 8, 1, -1, r, s * .75, { noSteps: true });
      underBand(f, sec, r);
      const pad = rel($('.pad', sec));
      f.line([[pad.x - 12, pad.y + 30], [pad.x - 12, pad.b + 12], [pad.r - 60, pad.b + 12]], 'thin');
      f.line([[pad.r + 12, pad.y - 12], [pad.r + 12, pad.b - 40]], 'orange');
      f.line([[0, h - 30], [w * .3, h - 30], [w * .3 + 20, h - 10], [w, h - 10]], 'thin');
    });
    const arch = $('.brush-arch', sec), archSvg = $('.arch-frame', arch);
    registerFrame(arch, 'jade', (f, w, h, r) => drawArch(f, w, h, r, 'zig', ['#2d7f63', '#17503f', '#0c2e25']), archSvg);
    life(sec);

    // the test sheet
    const pad = $('.pad', sec), cv = $('canvas', pad), ctx = cv.getContext('2d');
    const ico = $('.arch-ico', arch), loadEl = $('.load', arch), loadN = $('.load-n', arch);
    let size = 6, paint = '#2f8f6e', load = 1, drawing = null, refill = 0;
    function fit() {
      const b = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      const W = Math.round(b.width * dpr), H = Math.round(b.height * dpr);
      if (!W || !H || (cv.width === W && cv.height === H)) return;
      const keep = document.createElement('canvas'); keep.width = cv.width; keep.height = cv.height;
      if (cv.width && cv.height) keep.getContext('2d').drawImage(cv, 0, 0);
      cv.width = W; cv.height = H;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (keep.width) ctx.drawImage(keep, 0, 0, W, H);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit(); addEventListener('resize', fit);
    const setLoad = v => { load = Math.max(0, Math.min(1, v)); loadEl.style.setProperty('--load', load.toFixed(3)); loadN.textContent = Math.round(load * 100) + '%'; };
    const setPaint = c => { paint = c; ico.style.setProperty('--paint', c); loadEl.style.setProperty('--paint', c); };
    setPaint(paint); setLoad(1);
    const at = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    pad.addEventListener('pointerdown', e => {
      fit(); refill++;
      pad.setPointerCapture(e.pointerId); pad.classList.add('used');
      // each stroke gets its own bristles: offsets across the width, a weight and a tone each
      const n = Math.max(6, Math.round(size * 1.7)), wd = size * 2.2 + 4;
      drawing = { p: at(e), bristles: Array.from({ length: n }, (_, i) => ({ o: (i / (n - 1) - .5) * wd + (Math.random() - .5) * 1.4, w: .8 + Math.random() * 2.2, a: .35 + Math.random() * .6, dry: Math.random() })) };
      window.DasmotoBusy = true;
    });
    pad.addEventListener('pointermove', e => {
      if (!drawing) return;
      const q = at(e), p = drawing.p, dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy);
      if (d < 1.5) return;
      const nx = -dy / d, ny = dx / d;
      ctx.lineCap = 'round'; ctx.strokeStyle = paint;
      for (const b of drawing.bristles) {
        if (b.dry > load * 1.6 + .05) continue; // a thirsty brush drags dry: bristles drop out
        ctx.globalAlpha = b.a * (.3 + .7 * Math.min(1, load * 1.4));
        ctx.lineWidth = b.w;
        ctx.beginPath(); ctx.moveTo(p[0] + nx * b.o, p[1] + ny * b.o); ctx.lineTo(q[0] + nx * b.o, q[1] + ny * b.o); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      setLoad(load - d * (.55 + size / 18) / 2600); // oak holds a lot: one dip lasts a long way
      drawing.p = q;
    });
    const end = () => { drawing = null; window.DasmotoBusy = false; };
    pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
    $('.pad-clear', sec).addEventListener('click', () => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.restore(); pad.classList.remove('used'); });
    const sizes = $('.sizes', sec);
    sizes.addEventListener('click', e => {
      const b = e.target.closest('[data-size]'); if (!b) return;
      press(sizes, b); size = +b.dataset.size;
      $('svg', ico).style.transform = `scale(${(.8 + size / 50).toFixed(3)})`;
      perform(ico);
    });
    const dips = $('.dips', sec);
    dips.addEventListener('click', e => {
      const b = e.target.closest('[data-paint]'); if (!b) return;
      press(dips, b); setPaint(b.dataset.paint);
      const from = load;
      if (REDUCED) setLoad(1);
      else { // fills up over half a second, unless a new stroke starts first
        const t0 = performance.now(), id = ++refill;
        const up = () => { if (id !== refill) return; const k = Math.min(1, (performance.now() - t0) / 500); setLoad(from + (1 - from) * k); if (k < 1) requestAnimationFrame(up); };
        requestAnimationFrame(up);
      }
      perform(ico);
    });
    $('svg', ico).style.transform = `scale(${(.8 + size / 50).toFixed(3)})`;
  })();

  /* ================= II. FRAMES ================= */
  (function () {
    const sec = $('.frames'); if (!sec) return;
    registerFrame(sec, 'coral', (f, w, h, r, rel) => {
      f.lattice(w < 700 ? 80 : 120, 0, 4);
      const s = Math.min(1, w / 1500);
      f.line([[0, 22], [w, 22]], 'gold'); f.line([[0, 30], [w * r.range(.4, .7), 30]], 'othin');
      f.stepBand(h - 26, r, 'gold', 10);
      if (w > 720) f.corner(8, 44, 1, 1, r, s * .85);
      f.corner(w - 8, h - 40, -1, -1, r, s * .7, { noSteps: true });
      underBand(f, sec, r);
      const v = rel($('.frame-view', sec));
      f.line([[v.x - 20, v.y + v.h * .3], [v.x - 20, v.b + 20], [v.r + 20, v.b + 20]], 'othin');
      f.line([[v.r + 12, v.y + v.h * .2], [v.r + 12, v.b + 12], [v.x + v.w * .2, v.b + 12]], 'thin');
    });

    const view = $('.frame-view', sec), svg = $('svg', view), note = $('.frame-note', sec);
    const X0 = 30, Y0 = 26, X1 = 470, Y1 = 500, M = 64; // outer box, molding width
    const MATS = {
      mdf: { base: '#b39570', name: 'MDF', note: 'MDF: dense and smooth all the way through. Sand lightly, then paint.' },
      birch: { base: '#e2c793', name: 'Birchwood', note: 'Birchwood: pale, fine grain that takes a stain or a coat.' },
      pde: { base: '#24242b', name: 'PDE', note: 'PDE: comes finished from the mould. Not one for sanding.' }
    };
    let mat = 'birch', coat = '', picSeed = 7;
    const defs = el('defs', null, svg);
    defs.innerHTML = `
      <pattern id="texMdf" width="40" height="40" patternUnits="userSpaceOnUse">${Array.from({ length: 34 }, () => `<circle cx="${(R() * 40).toFixed(1)}" cy="${(R() * 40).toFixed(1)}" r="${(R() * .9 + .3).toFixed(2)}" fill="${R.chance(.5) ? '#5e4526' : '#e9d6b2'}" opacity=".45"/>`).join('')}</pattern>
      <pattern id="texBirch" width="160" height="24" patternUnits="userSpaceOnUse">
        <path d="M0 5c30-4 50 4 80 0s50-4 80 0M0 13c40 3 60-3 90 1s50 2 70-1M0 20c25-2 55 3 85 0s55-3 75 1" fill="none" stroke="#8a6436" stroke-width="1" opacity=".55"/>
        <ellipse cx="118" cy="12" rx="9" ry="2.6" fill="none" stroke="#8a6436" stroke-width=".9" opacity=".5"/></pattern>
      <linearGradient id="texPde" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a5a66"/><stop offset=".22" stop-color="#1a1a20"/><stop offset=".5" stop-color="#2c2c35"/><stop offset=".53" stop-color="#8a8a98"/><stop offset=".56" stop-color="#2c2c35"/><stop offset="1" stop-color="#101014"/></linearGradient>
      <clipPath id="moldClip"><path id="moldPath" fill-rule="evenodd"/></clipPath>
      <clipPath id="picClip"><rect x="${X0 + M + 26}" y="${Y0 + M + 26}" width="${X1 - X0 - 2 * M - 52}" height="${Y1 - Y0 - 2 * M - 52}"/></clipPath>`;
    // outer outline with stepped (ziggurat) corners
    const q = 13;
    const outerPts = [[X0 + 2 * q, Y0], [X1 - 2 * q, Y0], [X1 - 2 * q, Y0 + q], [X1 - q, Y0 + q], [X1 - q, Y0 + 2 * q], [X1, Y0 + 2 * q],
      [X1, Y1 - 2 * q], [X1 - q, Y1 - 2 * q], [X1 - q, Y1 - q], [X1 - 2 * q, Y1 - q], [X1 - 2 * q, Y1],
      [X0 + 2 * q, Y1], [X0 + 2 * q, Y1 - q], [X0 + q, Y1 - q], [X0 + q, Y1 - 2 * q], [X0, Y1 - 2 * q],
      [X0, Y0 + 2 * q], [X0 + q, Y0 + 2 * q], [X0 + q, Y0 + q], [X0 + 2 * q, Y0 + q]];
    const ix0 = X0 + M, iy0 = Y0 + M, ix1 = X1 - M, iy1 = Y1 - M;
    const moldD = 'M' + outerPts.map(p => p.join(' ')).join('L') + `Z M${ix0} ${iy0}V${iy1}H${ix1}V${iy0}Z`;
    $('#moldPath', svg).setAttribute('d', moldD);
    el('ellipse', { cx: 250, cy: Y1 + 14, rx: 210, ry: 10, fill: '#1a0603', opacity: .5 }, svg);
    // the picture behind the mat
    const mat0 = el('rect', { x: ix0, y: iy0, width: ix1 - ix0, height: iy1 - iy0, fill: '#efe3c6' }, svg);
    el('rect', { x: ix0 + 8, y: iy0 + 8, width: ix1 - ix0 - 16, height: iy1 - iy0 - 16, fill: 'none', stroke: '#c9b48a', 'stroke-width': 1 }, svg);
    const pic = el('g', { 'clip-path': 'url(#picClip)', class: 'pic-btn', tabindex: 0, role: 'button', 'aria-label': 'Show another picture' }, svg);
    el('rect', { x: ix0 + 26, y: iy0 + 26, width: ix1 - ix0 - 52, height: iy1 - iy0 - 52, fill: 'none', stroke: '#2a1d14', 'stroke-width': 2 }, svg);
    // molding: material fill, texture, coat, bevel faces, lines
    const mold = el('g', { 'clip-path': 'url(#moldClip)' }, svg);
    const fillR = el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0 }, mold);
    const texR = el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0 }, mold);
    const coatR = el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, opacity: 0 }, mold);
    const grainOver = el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, fill: 'url(#texBirch)', opacity: 0, style: 'mix-blend-mode:multiply' }, mold);
    const face = (d, c, o) => el('path', { d, fill: c, opacity: o }, mold);
    face(`M${X0} ${Y0}H${X1}L${ix1} ${iy0}H${ix0}Z`, '#fff', .2);
    face(`M${X0} ${Y0}L${ix0} ${iy0}V${iy1}L${X0} ${Y1}Z`, '#fff', .08);
    face(`M${X1} ${Y0}V${Y1}L${ix1} ${iy1}V${iy0}Z`, '#000', .16);
    face(`M${X0} ${Y1}H${X1}L${ix1} ${iy1}H${ix0}Z`, '#000', .28);
    // a stepped inner profile: two rebates toward the picture
    for (const k of [18, 36]) el('rect', { x: X0 + k, y: Y0 + k, width: X1 - X0 - 2 * k, height: Y1 - Y0 - 2 * k, fill: 'none', stroke: 'rgba(0,0,0,.28)', 'stroke-width': 2 }, mold);
    for (const k of [20, 38]) el('rect', { x: X0 + k, y: Y0 + k, width: X1 - X0 - 2 * k, height: Y1 - Y0 - 2 * k, fill: 'none', stroke: 'rgba(255,255,255,.18)', 'stroke-width': 1 }, mold);
    el('path', { d: moldD, fill: 'none', stroke: '#2a0d06', 'stroke-width': 2.4, 'fill-rule': 'evenodd' }, svg);
    const lip = el('rect', { x: ix0 - 3, y: iy0 - 3, width: ix1 - ix0 + 6, height: iy1 - iy0 + 6, fill: 'none', stroke: '#e2c277', 'stroke-width': 3 }, svg);
    const dust = el('g', null, svg);

    function drawPic() {
      pic.textContent = '';
      const r = rng(picSeed), x0 = ix0 + 26, y0 = iy0 + 26, w = ix1 - ix0 - 52, h = iy1 - iy0 - 52;
      const skies = [['#173f39', '#2d6d61'], ['#3a130b', '#8a3a28'], ['#0c1b26', '#255d7c'], ['#e9dcc0', '#d8c08a']];
      const [s0, s1] = r.pick(skies), light = s0 === '#e9dcc0';
      const gid = 'pg' + picSeed, g = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': s0 }, g); el('stop', { offset: 1, 'stop-color': s1 }, g);
      el('rect', { x: x0, y: y0, width: w, height: h, fill: `url(#${gid})` }, pic);
      const cx = x0 + w * r.range(.3, .7), cy = y0 + h * r.range(.5, .68), sun = r.pick(['#c99a45', '#d9725c', '#e9cd86', '#5fa9c6']);
      const rays = el('g', { stroke: light ? '#8a6a2c' : '#e9cd86', 'stroke-width': 1.2, opacity: .5 }, pic);
      const n = r.int(9, 17);
      for (let i = 0; i < n; i++) { const a = Math.PI + (i + .5) / n * Math.PI; el('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * 400, y2: cy + Math.sin(a) * 400 }, rays); }
      for (let i = 3; i > 0; i--) el('circle', { cx, cy, r: i * r.range(16, 22), fill: i % 2 ? sun : (light ? '#efe3c6' : s0), opacity: .95 }, pic);
      // a ziggurat skyline in front
      let x = x0, p = [[x0, y0 + h]];
      while (x < x0 + w) { const bw = r.range(16, 46), bh = r.range(.12, .42) * h; p.push([x, y0 + h - bh], [x + bw, y0 + h - bh]); if (r.chance(.4)) { p.push([x + bw, y0 + h - bh * .7]); } x += bw; }
      p.push([x0 + w, y0 + h]);
      el('polygon', { points: pts(p), fill: light ? '#1f5a50' : '#07120f', opacity: .92 }, pic);
      el('path', { d: `M${x0} ${y0 + h * .86}H${x0 + w}`, stroke: '#c9a24e', 'stroke-width': 1.4, opacity: .7 }, pic);
    }
    function render() {
      const m = MATS[mat];
      fillR.setAttribute('fill', mat === 'pde' ? 'url(#texPde)' : m.base);
      texR.setAttribute('fill', mat === 'mdf' ? 'url(#texMdf)' : mat === 'birch' ? 'url(#texBirch)' : 'none');
      coatR.setAttribute('fill', coat || 'none');
      coatR.setAttribute('opacity', coat ? .9 : 0);
      grainOver.setAttribute('opacity', coat && mat === 'birch' ? .35 : 0);
      lip.setAttribute('stroke', mat === 'pde' ? '#e2c277' : '#c9a24e');
      const c = $$('.coats .chip', sec);
      c.forEach(b => { if (b.dataset.coat) b.disabled = mat === 'pde'; });
      note.textContent = m.note + (coat ? ` Sanded and painted: ${$$('.coats .chip', sec).find(b => b.dataset.coat === coat).textContent.trim()}.` : '');
    }
    function sandDust() {
      if (REDUCED) return;
      for (let i = 0; i < 26; i++) {
        const side = R.int(0, 3), t = R();
        const x = side === 0 ? X0 + t * (X1 - X0) : side === 1 ? X1 : side === 2 ? X0 + t * (X1 - X0) : X0;
        const y = side === 0 ? Y0 : side === 1 ? Y0 + t * (Y1 - Y0) : side === 2 ? Y1 : Y0 + t * (Y1 - Y0);
        const c = el('circle', { cx: x, cy: y, r: R.range(1, 3), fill: MATS[mat].base }, dust);
        const a = c.animate([{ transform: 'translate(0,0)', opacity: .9 }, { transform: `translate(${R.range(-40, 40)}px,${R.range(-30, 50)}px)`, opacity: 0 }], { duration: R.range(500, 900), easing: 'ease-out' });
        a.onfinish = () => c.remove();
      }
    }
    const mats = $('.mats', sec), coats = $('.coats', sec);
    mats.addEventListener('click', e => {
      const b = e.target.closest('[data-mat]'); if (!b) return;
      press(mats, b); mat = b.dataset.mat;
      if (mat === 'pde' && coat) { coat = ''; press(coats, $('[data-coat=""]', coats)); }
      render();
    });
    coats.addEventListener('click', e => {
      const b = e.target.closest('[data-coat]'); if (!b || b.disabled) return;
      press(coats, b);
      view.classList.remove('sanding'); void view.offsetWidth; view.classList.add('sanding');
      sandDust();
      setTimeout(() => { coat = b.dataset.coat; render(); }, REDUCED ? 0 : 380);
    });
    const reroll = () => { picSeed = R.int(1, 1e6); drawPic(); window.Signal && window.Signal.tear(view, 260); };
    pic.addEventListener('click', reroll);
    pic.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reroll(); } });
    drawPic(); render();
  })();

  /* ================= III. PAINT ================= */
  (function () {
    const sec = $('.paint'); if (!sec) return;
    registerFrame(sec, 'night', (f, w, h, r, rel) => {
      f.lattice(w < 700 ? 70 : 110, 45, 4);
      const s = Math.min(1, w / 1500);
      f.stepBand(30, r, 'gold', 12);
      f.line([[0, 42], [w * r.range(.5, .8), 42]], 'othin');
      f.corner(w - 8, h - 8, -1, -1, r, s * .8, { noSteps: true });
      if (w > 720) f.corner(8, 60, 1, 1, r, s * .7, { noSteps: true, short: true });
      underBand(f, sec, r);
      const wall = rel($('.wall', sec)), cap = rel($('.wall-cap', sec));
      f.rect(wall.x - 12, wall.y - 12, wall.w + 24, wall.h + 24, 'thin');
      if (w > 720) f.line([[wall.r + 22, wall.y + 40], [wall.r + 22, cap.b + 14], [wall.x + wall.w * .3, cap.b + 14]], 'orange');
    });

    // 256 colours: 16 hue columns x 16 tone rows
    const hex = (h, s, l) => {
      s /= 100; l /= 100;
      const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
    };
    const COLS = [];
    for (let row = 0; row < 16; row++) for (let col = 0; col < 16; col++) {
      const h = (col * 22.5 + 8 + row * 1.2) % 360, l = 15 + row * 4.7, s = 70 - Math.abs(row - 8) * 3.6 - (col % 3) * 4;
      COLS.push(hex(h, s, l));
    }
    const wall = $('.wall', sec);
    wall.innerHTML = COLS.map((c, i) => `<i id="sw${i}" role="option" aria-selected="false" aria-label="No. ${String(i + 1).padStart(3, '0')}, ${c}" style="--c:${c}"></i>`).join('');
    const sw = $$('i', wall), tube = $('.tube-ico', sec), no = $('.tube-no', sec), hx = $('.tube-hex', sec);
    let cur = -1;
    function pick(i, quiet) {
      i = Math.max(0, Math.min(255, i));
      if (cur >= 0) { sw[cur].classList.remove('sel'); sw[cur].setAttribute('aria-selected', 'false'); }
      cur = i; sw[i].classList.add('sel'); sw[i].setAttribute('aria-selected', 'true');
      wall.setAttribute('aria-activedescendant', sw[i].id);
      tube.style.setProperty('--paint', COLS[i]);
      no.textContent = 'No. ' + String(i + 1).padStart(3, '0'); hx.textContent = COLS[i];
      if (!quiet) perform(tube);
    }
    wall.addEventListener('click', e => { const i = sw.indexOf(e.target); if (i >= 0) pick(i); });
    wall.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 16, ArrowUp: -16, Home: -cur, End: 255 - cur }[e.key];
      if (d == null) return;
      e.preventDefault(); pick(cur + d);
    });
    pick(103, true);
    const oz = $('.oz', sec), ozScale = { 1: .62, 2: .74, 4: .87, 8: 1 };
    const sizeTube = v => { const s = $('svg', tube); if (s) s.style.transform = `scale(${ozScale[v]})`; };
    oz.addEventListener('click', e => { const b = e.target.closest('[data-oz]'); if (!b) return; press(oz, b); sizeTube(b.dataset.oz); perform(tube); });
    sizeTube(2);
    life(sec);
    // packet loss on the colour wall: a block of swatches shows the wrong colours for a moment
    every(sec, 2600, 7200, () => {
      if (document.body.classList.contains('stable')) return;
      const c0 = R.int(0, 13), r0 = R.int(0, 14), cw = R.int(2, 4), rh = R.int(1, 3), shift = R.int(17, 200);
      const hit = [];
      for (let y = r0; y < Math.min(16, r0 + rh); y++) for (let x = c0; x < Math.min(16, c0 + cw); x++) {
        const i = y * 16 + x; sw[i].style.setProperty('--j', COLS[(i + shift) % 256]); sw[i].classList.add('junk'); hit.push(sw[i]);
      }
      setTimeout(() => hit.forEach(n => n.classList.remove('junk')), R.range(140, 420));
    });
  })();

  /* ================= FOOTER ================= */
  (function () {
    const sec = $('.foot'); if (!sec) return;
    registerFrame(sec, 'teal', (f, w, h, r, rel) => {
      f.lattice(w < 700 ? 90 : 140, 0, 5);
      f.stepBand(20, r, 'gold', 10);
      f.line([[0, 30], [w, 30]], 'othin');
      const m = rel($('.foot-mono', sec)), cx = m.x + m.w / 2, cy = m.y + m.h / 2;
      const d = m.h * .62, L = Math.min(330, w / 2 - 20);
      f.diamond(cx, cy, d, 'gold'); f.diamond(cx + 3, cy + 2, d * 1.18, 'othin');
      f.line([[cx - L, cy], [cx - d - 18, cy]], 'gold'); f.line([[cx + d + 18, cy], [cx + L, cy]], 'gold');
      f.line([[cx - L * .8, cy + 9], [cx - d - 26, cy + 9]], 'thin'); f.line([[cx + d + 26, cy - 9], [cx + L * .88, cy - 9]], 'orange');
      if (w > 720) { f.corner(10, h - 10, 1, -1, r, .55, { noSteps: true, short: true }); f.corner(w - 10, h - 10, -1, -1, r, .55, { noSteps: true, short: true }); }
    });
  })();
})();
