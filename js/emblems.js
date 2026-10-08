/* Code-drawn gold emblems for the three counters. Named parts so they can perform.
   Style follows the deco tiles: gold body, dark-brown outline, thin inner engraving;
   the paint on the brush tip, the tube label and the framed sun take --paint. */
(function () {
  'use strict';
  const { R, REDUCED } = window.Deco;
  const O = 'class="ol"', E = 'class="en"';

  const ICONS = {
    // Hacksaw brush: oak handle with saw-tooth engraving, crimped ferrule, loaded bristles
    brush: `
      <g class="em-brush"><g class="ib-tilt"><g transform="rotate(-36 50 50)">
        <path class="ol oak" d="M45.4 44h9.2l-1.3 46c-.4 4.4-6.2 4.4-6.6 0z"/>
        <path ${E} d="M48 50l2.4 3-2.4 3 2.4 3-2.4 3 2.4 3-2.4 3 2.4 3-2.4 3 2.4 3-2.4 3"/>
        <circle class="ol" cx="50" cy="86.6" r="1.7"/>
        <path ${O} d="M43.2 29h13.6l-1.2 15.4H44.4z"/>
        <path ${E} d="M43.8 33.6h12.4M44.1 38.2h11.8"/>
        <path class="bristle" d="M43.6 29.4C42.6 20.4 45.6 10.6 50 4.6c4.4 6 7.4 15.8 6.4 24.8z"/>
        <path class="tip" d="M45.4 16.4c1.4-5 3-8.8 4.6-11.8 1.6 3 3.2 6.8 4.6 11.8-3 1.8-6.2 1.8-9.2 0z"/>
        <path class="en lite" d="M48 27.6c-.4-6 .6-13 2-19M52 27.6c.4-6-.6-13-2-19"/>
      </g></g></g>`,
    // art frame: stepped corners, engraved inner rule, a small sunburst picture
    frame: `
      <g class="em-frame">
        <rect class="pic" x="27" y="27" width="46" height="46"/>
        <g class="if-rays" stroke="#e9cd86" stroke-width="1" opacity=".55">
          <path d="M50 64L28 40M50 64L37 28M50 64L50 27M50 64L63 28M50 64L72 40"/>
        </g>
        <circle class="sunpaint" cx="50" cy="64" r="9"/>
        <path class="hill" d="M27 73v-7h9v-5h7v-4h14v4h7v5h9v7z"/>
        <path ${O} fill-rule="evenodd" d="M14 14h72v72H14zM27 27v46h46V27z"/>
        <path ${E} d="M19.5 19.5h61v61h-61z"/>
        <path ${O} d="M9 9h13v6h-7v7H9zM91 9H78v6h7v7h6zM9 91h13v-6h-7v-7H9zM91 91H78v-6h7v-7h6z"/>
        <path class="if-shine" d="M18 82L82 18" stroke="#fff1c4" stroke-width="3" stroke-linecap="round" opacity="0"/>
      </g>`,
    // paint tube standing on its cap: crimped end, coloured label, ribbed cap
    tube: `
      <g class="em-tube">
        <g class="it-body">
          <rect ${O} x="31" y="10" width="38" height="9" rx="1"/>
          <path ${E} d="M35 11.5v6M39 11.5v6M43 11.5v6M47 11.5v6M51 11.5v6M55 11.5v6M59 11.5v6M63 11.5v6M67 11.5v6"/>
          <path ${O} d="M33 19h34l-3 51-7 8H43l-7-8z"/>
          <path class="label" d="M34.1 33h31.8l-1.3 23H35.4z"/>
          <path ${E} d="M34.1 33h31.8M35.4 56h29.2"/>
          <path class="lbl-dia" d="M50 37.5l7 7-7 7-7-7z"/>
          <path class="en lite" d="M38 22l1 46"/>
        </g>
        <rect ${O} x="44" y="78" width="12" height="4"/>
        <path ${O} d="M41 82h18v12c0 1.3-.7 2-2 2H43c-1.3 0-2-.7-2-2z"/>
        <path ${E} d="M44.5 84.5v9M48 84.5v9M52 84.5v9M55.5 84.5v9"/>
        <path class="it-drop tip" d="M50 74c2.2 3.2 3.3 5.2 3.3 6.8a3.3 3.3 0 0 1-6.6 0c0-1.6 1.1-3.6 3.3-6.8z" opacity="0"/>
      </g>`
  };
  function iconSVG(name) { return `<svg class="emblem" viewBox="0 0 100 100" aria-hidden="true">${ICONS[name] || ''}</svg>`; }
  function mountIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(n => { if (!n.firstElementChild) n.innerHTML = iconSVG(n.dataset.icon); });
  }

  /* idle performances */
  const anim = (n, kf, o) => (n && n.animate && !REDUCED) ? n.animate(kf, o) : null;
  function origin(n, x, y) { n.style.transformBox = 'view-box'; n.style.transformOrigin = `${x}px ${y}px`; }
  const PERFORM = {
    brush(svg) { // a quick dab: dip, press, flick
      const t = svg.querySelector('.ib-tilt'); origin(t, 73.5, 82.4);
      anim(t, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(12deg) translateY(3px)', offset: .3 }, { transform: 'rotate(-8deg) translateY(-2px)', offset: .6 }, { transform: 'rotate(0deg)' }], { duration: 1100, easing: 'ease-in-out' });
    },
    frame(svg) { // light crossing the glass
      const s = svg.querySelector('.if-shine');
      anim(s, [{ opacity: 0, transform: 'translate(-18px,18px)' }, { opacity: .9, offset: .4 }, { opacity: 0, transform: 'translate(18px,-18px)' }], { duration: 1300, easing: 'ease-in-out' });
      const r = svg.querySelector('.if-rays');
      anim(r, [{ opacity: .55 }, { opacity: 1, offset: .5 }, { opacity: .55 }], { duration: 1300 });
    },
    tube(svg) { // squeeze, one drop
      const b = svg.querySelector('.it-body'), d = svg.querySelector('.it-drop'); origin(b, 50, 78);
      anim(b, [{ transform: 'scale(1,1)' }, { transform: 'scale(.9,1.03)', offset: .35 }, { transform: 'scale(1.02,.99)', offset: .7 }, { transform: 'scale(1,1)' }], { duration: 900, easing: 'ease-in-out' });
      anim(d, [{ opacity: 0, transform: 'translateY(0)' }, { opacity: 1, transform: 'translateY(0)', offset: .35 }, { opacity: 1, transform: 'translateY(16px)', offset: .8 }, { opacity: 0, transform: 'translateY(22px)' }], { duration: 1500, easing: 'ease-in' });
    }
  };
  function perform(host) { const svg = host.querySelector('svg'), f = PERFORM[host.dataset.icon]; if (svg && f) f(svg); }
  function life(section) {
    const icons = [...section.querySelectorAll('[data-icon]')];
    if (!icons.length) return;
    window.Deco.every(section, 1800, 5200, () => perform(R.pick(icons)));
    icons.forEach(h => {
      const host = h.closest('.tile') || h;
      host.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') setTimeout(() => perform(h), 220); });
    });
  }

  mountIcons();
  window.DecoIcons = { ICONS, iconSVG, mountIcons, perform, life };
})();
