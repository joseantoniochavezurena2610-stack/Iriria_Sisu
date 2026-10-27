// choices.js — turns a hidden <select> into tappable cards (a radio group).
// The <select> stays the single source of truth: links, the engine and the farm bar keep reading it.
// Each <option> may carry data-art (a picture key below, or "ic:<icon name>"), data-sub (a short hint)
// and data-tone (a CSS colour for the card).
import { icon } from './icons.js?v=8';

const slope = (d) => `<svg class="ic slope" viewBox="0 0 32 24" aria-hidden="true"><path d="${d} V24 H0Z" fill="currentColor" opacity=".22"/><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const ART = {
  'drops-0': () => icon('cloud-rain'),
  'drops-1': () => icon('droplet'),
  'drops-3': () => `<span class="drops">${icon('droplet')}${icon('droplet')}${icon('droplet')}</span>`,
  'tex-sandy': () => '<span class="swatch tex sandy"></span>',
  'tex-loam': () => '<span class="swatch tex loam"></span>',
  'tex-clay': () => '<span class="swatch tex clay"></span>',
  'slope-flat': () => slope('M0 17 H32'),
  'slope-moderate': () => slope('M0 20 L32 9'),
  'slope-steep': () => slope('M2 23 L28 2'),
  'om-low': () => '<span class="swatch om low"></span>',
  'om-medium': () => '<span class="swatch om medium"></span>',
  'om-high': () => '<span class="swatch om high"></span>',
  unknown: () => icon('circle-dashed'),
  none: () => icon('circle-dashed'),
};
const art = (key) => {
  if (!key) return '';
  if (key.startsWith('ic:')) return icon(key.slice(3));
  return ART[key] ? ART[key]() : '';
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Builds (or rebuilds) the cards of a select. kind: "cards" (picture + label), "grid" (compact names), "pills". */
export function choices(select, kind = 'cards') {
  let box = select.parentElement.querySelector(`.choices[data-for="${select.id}"]`);
  if (!box) {
    box = document.createElement('div');
    box.dataset.for = select.id;
    box.setAttribute('role', 'radiogroup');
    const lab = select.parentElement.querySelector('.flabel');
    if (lab) { lab.id = lab.id || `lab-${select.id}`; box.setAttribute('aria-labelledby', lab.id); }
    select.insertAdjacentElement('afterend', box);
    // The plain list stays visible until the cards exist, so the page still works if this script fails.
    select.hidden = true;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.choice');
      if (b) pick(select, b.dataset.v);
    });
    box.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const opts = [...select.options];
      const i = Math.max(0, opts.findIndex((o) => o.value === select.value));
      const next = opts[(i + keys[e.key] + opts.length) % opts.length];
      pick(select, next.value);
      box.querySelector(`.choice[data-v="${CSS.escape(next.value)}"]`)?.focus();
    });
  }
  box.className = `choices ${kind}`;
  box.style.setProperty('--n', select.options.length);
  box.innerHTML = [...select.options].map((o) => {
    const tone = o.dataset.tone ? ` style="--tone:${o.dataset.tone}"` : '';
    const pic = kind === 'cards' ? `<span class="art">${art(o.dataset.art)}</span>` : '';
    return `<button type="button" role="radio" class="choice" data-v="${esc(o.value)}"${tone}>${pic}<b>${esc(o.textContent)}</b>${o.dataset.sub ? `<small>${esc(o.dataset.sub)}</small>` : ''}</button>`;
  }).join('');
  sync(box, select);
  return box;
}

function pick(select, value) {
  if (select.value === value) return;
  select.value = value;
  select.dispatchEvent(new Event('input', { bubbles: true }));
  syncChoices();
}

function sync(box, select) {
  box.querySelectorAll('.choice').forEach((b) => {
    const on = b.dataset.v === select.value;
    b.setAttribute('aria-checked', on);
    b.tabIndex = on ? 0 : -1;
  });
}

/** Marks the card of every select's current value (call after the code changes a value). */
export function syncChoices(root = document) {
  root.querySelectorAll('.choices[data-for]').forEach((box) => {
    const select = document.getElementById(box.dataset.for);
    if (select) sync(box, select);
  });
}
