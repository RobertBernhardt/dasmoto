/* The signal: the shop arrives over a line that doesn't quite hold.
   A reception value drifts; the weaker it gets, the more often something breaks:
   headings split into colour channels, pictures tear into sideways slices,
   gold lines lose register, macroblocks flash, a tracking band rolls down,
   words decode from noise, and now and then the picture drops out entirely.
   "Stabilize" locks the line (remembered per browser); reduced motion starts locked. */
(function () {
  'use strict';
  const { R, REDUCED, isOn, watch, frames } = window.Deco;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const body = document.body;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: fine */ } },
    seen() { try { return sessionStorage.getItem('dasmoto-boot') === '1'; } catch (e) { return false; } },
    see() { try { sessionStorage.setItem('dasmoto-boot', '1'); } catch (e) { /* fine */ } }
  };

  let stable = REDUCED || store.get('dasmoto-stable') === '1';
  let strength = 72, target = 72;
  const widget = $('.signal'), bars = $$('.bars i', widget), val = $('.sig-val', widget), state = $('.sig-state', widget), btn = $('.sig-btn', widget);
  const roll = $('.roll'), log = $('.log'), nosig = $('.nosig');
  const noise = $('#tearNoise'), map = $('#tearMap'), offR = $('#tearR'), offGB = $('#tearGB');

  /* ---------- reception ---------- */
  function paint() {
    const v = stable ? 100 : Math.round(strength);
    bars.forEach((b, i) => b.classList.toggle('on', v > i * 20 + 4));
    widget.classList.toggle('weak', !stable && v < 45);
    val.textContent = `Signal ${v}%`;
    state.textContent = stable ? 'Link locked' : v < 45 ? 'Link failing' : v < 70 ? 'Link unstable' : 'Link holding';
    btn.textContent = stable ? 'Let it flicker' : 'Stabilize';
    btn.setAttribute('aria-pressed', stable);
    body.classList.toggle('stable', stable);
  }
  setInterval(() => {
    if (R.chance(.12)) target = R.range(34, 96);
    strength += (target - strength) * .18 + (R() - .5) * 6;
    strength = Math.max(18, Math.min(99, strength));
    paint();
  }, 650);
  btn.addEventListener('click', () => {
    stable = !stable; store.set('dasmoto-stable', stable ? '1' : '0');
    if (!stable) { strength = 40; burst(3); }
    paint();
  });
  paint();

  /* ---------- helpers ---------- */
  const onScreen = n => { const b = n.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight && b.width > 0; };
  const pickVisible = sel => { const l = $$(sel).filter(onScreen); return l.length ? R.pick(l) : null; };

  /* ---------- effects ---------- */
  // 1) channel split on a heading
  function split() {
    const n = pickVisible('.gt'); if (!n) return false;
    n.classList.remove('split'); void n.offsetWidth; n.classList.add('split');
    if (R.chance(.35)) jolt(n);
    setTimeout(() => n.classList.remove('split'), 340);
    return true;
  }
  function jolt(n) { n.classList.remove('jolt'); void n.offsetWidth; n.classList.add('jolt'); setTimeout(() => n.classList.remove('jolt'), 240); }

  // 2) torn slices: the #tear filter on a picture, its noise re-seeded every few frames
  let tearing = null;
  function tear(n, dur) {
    if (!n || tearing || REDUCED) return false;
    tearing = n; n.classList.add('tearing');
    const t0 = performance.now(), D = dur || R.range(200, 520);
    let last = 0;
    const step = now => {
      if (now - t0 > D) { n.classList.remove('tearing'); tearing = null; return; }
      if (now - last > 45) {
        last = now;
        noise.setAttribute('seed', R.int(1, 999));
        noise.setAttribute('baseFrequency', `0.00008 ${R.range(.02, .08).toFixed(3)}`);
        map.setAttribute('scale', (R.range(20, 90) * (R.chance(.5) ? 1 : -1)).toFixed(0));
        offR.setAttribute('dx', -R.range(2, 9).toFixed(1));
        offGB.setAttribute('dx', R.range(2, 9).toFixed(1));
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return true;
  }
  function tearSomething() {
    if (window.DasmotoBusy) return false;
    return tear(pickVisible('[data-tear], .band, .slogan, .price'));
  }

  // 3) gold lines losing register
  function desync() {
    const on = frames.filter(f => isOn(f.section) && onScreen(f.host));
    if (!on.length) return false;
    R.pick(on).desync(); return true;
  }

  // 4) macroblocks: a few frames of compression garbage
  const cv = document.createElement('canvas'); cv.className = 'blocks'; cv.setAttribute('aria-hidden', 'true'); body.appendChild(cv);
  const cx = cv.getContext('2d');
  const BLOCK = ['#c9a24e', '#b8582a', '#1f5a50', '#6a2818', '#efe0bb', '#2f8f6e', '#d9725c', '#5fa9c6', '#ff3d7f', '#3df2ff', '#0a1f1b'];
  function blocks() {
    cv.width = innerWidth; cv.height = innerHeight;
    let n = 0; const frames = R.int(2, 4);
    const draw = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      if (n++ >= frames) return;
      const k = R.int(3, 9), y0 = R.range(0, cv.height * .85);
      for (let i = 0; i < k; i++) {
        const w = R.int(2, 14) * 16, h = R.int(1, 4) * 8, x = R.int(0, cv.width / 16) * 16, y = y0 + R.int(-6, 6) * 16;
        cx.globalAlpha = R.range(.5, .92); cx.fillStyle = R.pick(BLOCK); cx.fillRect(x, y, w, h);
        if (R.chance(.5)) { cx.fillStyle = R.pick(BLOCK); for (let s = 0; s < w; s += 4) cx.fillRect(x + s, y, 2, h); }
      }
      cx.globalAlpha = 1;
      setTimeout(draw, R.range(40, 90));
    };
    draw();
    return true;
  }

  // 5) a tracking band rolling down the screen
  function rollBand() {
    roll.style.setProperty('--dur', R.range(1.2, 2.4).toFixed(2) + 's');
    roll.classList.remove('go'); void roll.offsetWidth; roll.classList.add('go');
    return true;
  }
  roll.addEventListener('animationend', () => roll.classList.remove('go'));

  // 6) words decoding from noise (and, once in a while, a word that isn't theirs)
  const GLYPHS = '◆◇▲▼◢◣◤◥▚▞░▒▓#%&$@0123456789';
  const CORRUPT = { "Dasmoto's": ["D4SM0T0'S", 'DASM▒TO.EXE', "Dasm0t0's"], 'Hacksaw Brushes': ['H4CK SAW', 'hack;saw'], '$3.00': ['$0.00', '$3.0█'], '$2.00': ['$2.??'], '$5.00': ['$5.00?'] };
  function scramble(n, opts) {
    if (!n || n._scr) return false;
    const final = n.dataset.final || (n.dataset.final = n.textContent);
    if (!n.hasAttribute('aria-label') && n.tagName !== 'SPAN') n.setAttribute('aria-label', final);
    n._scr = true;
    const corrupt = opts && opts.corrupt && CORRUPT[final];
    const D = R.range(420, 760), t0 = performance.now();
    const step = now => {
      const k = (now - t0) / D;
      if (k >= 1) {
        if (corrupt) { n.textContent = R.pick(corrupt); setTimeout(() => { n.textContent = final; n._scr = false; }, R.range(160, 320)); }
        else { n.textContent = final; n._scr = false; }
        return;
      }
      let s = '';
      for (let i = 0; i < final.length; i++) {
        const c = final[i];
        s += (c === ' ' || i / final.length < k) ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      n.textContent = s;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return true;
  }
  function scrambleSomething() { return scramble(pickVisible('[data-scramble]'), { corrupt: R.chance(.3) }); }
  // hovering re-requests a word: it decodes again
  $$('[data-scramble]').forEach(n => n.addEventListener('pointerenter', e => { if (!stable && e.pointerType === 'mouse') scramble(n); }));

  // 7) the log: what the receiver thinks is happening
  const LINES = [
    '› packet 0x3F lost · re-requesting /brushes',
    '› rerouting via Helsinki · paint ok',
    '› checksum mismatch in frame/birch · patched',
    '› unknown host wrote 3 bytes to the header',
    '› clock drift +0.4 s · resyncing ornaments',
    '› 256/256 colours received',
    '› gold layer out of register · re-aligning',
    '› handshake renewed',
    '› 1 frame dropped · nobody saw that'
  ];
  let logBusy = false;
  function say(line) {
    if (logBusy) return false;
    logBusy = true; log.textContent = ''; log.classList.add('show');
    const txt = line || R.pick(LINES); let i = 0;
    const type = () => {
      log.textContent = txt.slice(0, ++i);
      if (i < txt.length) setTimeout(type, 18 + Math.random() * 30);
      else setTimeout(() => { log.classList.remove('show'); setTimeout(() => { logBusy = false; }, 400); }, 2200);
    };
    type();
    return true;
  }

  // 8) no signal, for a heartbeat
  let lastDrop = performance.now();
  function drop() {
    if (performance.now() - lastDrop < 45000) return false;
    lastDrop = performance.now();
    nosig.classList.add('on');
    setTimeout(() => nosig.classList.remove('on'), R.range(320, 520));
    setTimeout(() => say('› carrier lost for 0.4 s · reconnected'), 600);
    return true;
  }

  /* ---------- the scheduler ---------- */
  const EFFECTS = [[split, 28], [tearSomething, 22], [desync, 16], [blocks, 11], [scrambleSomething, 12], [rollBand, 6], [say, 4], [drop, 1.2]];
  const TOTAL = EFFECTS.reduce((a, e) => a + e[1], 0);
  function one() {
    let x = R() * TOTAL;
    for (const [fn, w] of EFFECTS) { x -= w; if (x <= 0) return fn(); }
    return false;
  }
  function burst(n) {
    for (let i = 0; i < n; i++) setTimeout(() => { if (!stable && !document.hidden) one(); }, i * R.range(60, 180));
  }
  function loop() {
    if (!stable && !document.hidden) {
      burst(R.chance(.25) ? R.int(2, 3) : 1);
      strength = Math.max(18, strength - R.range(4, 16));
    }
    // weaker reception, shorter gaps
    const k = 1.6 - (100 - strength) / 80;
    setTimeout(loop, R.range(1400, 4200) * Math.max(.45, k));
  }
  if (!REDUCED) setTimeout(loop, 2600);

  // scrolling fast is like moving the antenna
  let ly = scrollY, lt = performance.now();
  addEventListener('scroll', () => {
    const now = performance.now(), v = Math.abs(scrollY - ly) / Math.max(16, now - lt);
    ly = scrollY; lt = now;
    if (!stable && !REDUCED && v > 3.2 && R.chance(.08)) R.chance(.5) ? split() : desync();
  }, { passive: true });

  /* ---------- boot: the channel opening ---------- */
  (function boot() {
    if (REDUCED || store.seen()) return;
    store.see();
    const b = document.createElement('div'); b.className = 'boot'; b.setAttribute('aria-hidden', 'true');
    const pre = document.createElement('pre'); b.appendChild(pre); body.appendChild(b);
    const L = [
      ['DASMOTO/RX 2.6 · opening channel', ''],
      ['› handshake ................... ', 'ok'],
      ['› routing via Helsinki ........ ', 'ok'],
      ['› decoding ornaments .......... ', '73%', 'warn'],
      ['› three counters found ........ ', 'ok'],
      ['› signal acquired · reception may vary', '']
    ];
    let li = 0, ci = 0, done = false, html = '';
    const cur = '<span class="cursor"></span>';
    const finish = () => {
      if (done) return; done = true;
      b.classList.add('out');
      setTimeout(() => { b.remove(); split(); }, 600);
    };
    b.addEventListener('click', finish);
    const tick = () => {
      if (done) return;
      if (li >= L.length) { setTimeout(finish, 260); return; }
      const [t, tag, cls] = L[li];
      if (ci < t.length) { ci += 3; pre.innerHTML = html + t.slice(0, ci) + cur; setTimeout(tick, 14); return; }
      html += t + (tag ? `<span class="${cls || 'ok'}">${tag}</span>` : '') + '\n';
      pre.innerHTML = html + cur; li++; ci = 0;
      setTimeout(tick, li === 4 ? 200 : 90);
    };
    tick();
  })();

  /* a note for whoever opens the console */
  console.log('%cDASMOTO/RX', 'font: 700 22px Limelight, serif; color: #c9a24e; background: #0f2a25; padding: 6px 12px;');
  console.log('%cThe interference is generated live (js/signal.js). Nothing was harmed but the gold leaf.', 'color:#3df2ff');

  watch(body);
  window.Signal = { tear, split, blocks, desync, scramble, say, burst, get stable() { return stable; } };
})();
