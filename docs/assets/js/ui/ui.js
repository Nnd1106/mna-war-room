/* ---------------------------------------------------------------------
 * ui.js: DOM helpers, saved profile, modal, toast and shared widgets.
 * Rendering only: every outcome comes from WR.sim.
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const UI = WR.ui;

  /* ---------------- element builder ---------------- */
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') e.className = v;
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? '' : v);
      });
    }
    kids.flat(Infinity).forEach((c) => {
      if (c === null || c === undefined || c === false) return;
      e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    });
    return e;
  }
  UI.h = h;

  const ICONS = {
    board: 'M4 20V6l8-3 8 3v14M9 20v-5h6v5M8 9h2M14 9h2M8 12h2M14 12h2',
    street: 'M3 17l5-5 4 3 8-9M15 6h5v5',
    people: 'M8 11a3 3 0 100-6 3 3 0 000 6zM2.5 20a5.5 5.5 0 0111 0M16.5 11a2.5 2.5 0 100-5M17 14.5a4.5 4.5 0 014.5 5.5',
    heat: 'M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-6 1-8z',
    days: 'M5 6h14v14H5zM5 10h14M9 3v4M15 3v4',
    lock: 'M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    cross: 'M6 6l12 12M18 6L6 18',
    star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z',
    flag: 'M6 21V4M6 5h11l-2 4 2 4H6',
    gem: 'M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l-1.5 5L12 20M15 4l1.5 5L12 20',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    back: 'M19 12H5M11 6l-6 6 6 6',
    book: 'M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h10',
    cap: 'M2 9l10-5 10 5-10 5zM6 11.5V16c2 2 10 2 12 0v-4.5M22 9v6',
    info: 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 100-18 9 9 0 000 18z',
    news: 'M4 5h13v14H6a2 2 0 01-2-2zM17 9h3v8a2 2 0 01-2 2M7 9h7M7 12h7M7 15h4',
    seed: 'M12 21c5-3 7-7 7-12-4 0-7 2-7 6 0-4-3-6-7-6 0 5 2 9 7 12z',
    coach: 'M12 3l2 4 4.5.6-3.3 3.1.8 4.5L12 13.1 8 15.200l.8-4.5L5.500 7.6 10 7z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.500-1-8-4-8-9V6z',
    sword: 'M14 4h6v6L9 21l-3-1-2-2-1-3zM5 13l6 6',
    coin: 'M12 20a8 8 0 100-16 8 8 0 000 16zM12 7v10M9.500 9.500c0-1 1-1.500 2.500-1.500s2.500.5 2.500 1.500-1 1.500-2.500 2-2.500 1-2.500 2 1 1.500 2.500 1.500 2.500-.5 2.500-1.500',
  };
  UI.icon = (name, cls) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'ic ' + (cls || ''));
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', ICONS[name] || ICONS.info);
    svg.appendChild(p);
    return svg;
  };

  /* ---------------- saved profile ---------------- */
  const KEY = 'wr.profile.v1';
  const blank = () => ({ best: {}, plays: 0, concepts: [], archetypes: {}, history: [] });
  UI.store = {
    load() {
      try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return blank(); }
    },
    save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* private mode: play on without saving */ } },
    reset() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } },
    xp(p) { return U.sum(Object.values(p.best).map((b) => b.xp || 0)); },
    /** Record a finished file. Returns what changed, for the debrief. */
    record(file, v) {
      const p = UI.store.load();
      const before = UI.store.xp(p);
      const prev = p.best[file.id];
      const improved = !prev || v.overall > prev.overall;
      if (improved) p.best[file.id] = { overall: v.overall, grade: v.grade, stars: v.stars, xp: v.xp, tag: v.outcome.tag, title: v.outcome.title, seed: v.seed };
      p.plays += 1;
      const fresh = v.concepts.filter((c) => !p.concepts.includes(c));
      p.concepts = p.concepts.concat(fresh);
      p.archetypes[v.archetype.id] = (p.archetypes[v.archetype.id] || 0) + 1;
      p.history.unshift({ file: file.id, seed: v.seed, grade: v.grade, overall: Math.round(v.overall), title: v.outcome.title, at: Date.now() });
      p.history = p.history.slice(0, 40);
      UI.store.save(p);
      const after = UI.store.xp(p);
      return { improved, first: !prev, fresh, xpBefore: before, xpAfter: after, rankBefore: WR.sim.score.rank(before), rankAfter: WR.sim.score.rank(after) };
    },
  };

  /* ---------------- modal and toast ---------------- */
  UI.modal = function (title, body, opts) {
    const rootEl = document.getElementById('modal-root');
    const close = () => { rootEl.innerHTML = ''; document.removeEventListener('keydown', onKey); if (opts && opts.onClose) opts.onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const box = h('div', { class: 'modal ' + ((opts && opts.cls) || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'modal-head' }, h('h3', null, title), h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: close }, UI.icon('cross'))),
      h('div', { class: 'modal-body' }, body));
    rootEl.innerHTML = '';
    rootEl.appendChild(h('div', { class: 'backdrop', onclick: (e) => { if (e.target.classList.contains('backdrop')) close(); } }, box));
    document.addEventListener('keydown', onKey);
    const first = box.querySelector('button');
    if (first) first.focus();
    return close;
  };

  UI.toast = function (text, opts) {
    const rootEl = document.getElementById('toast-root');
    const t = h('button', { class: 'toast ' + ((opts && opts.tone) || ''), onclick: () => { if (opts && opts.onclick) opts.onclick(); t.remove(); } },
      opts && opts.icon ? UI.icon(opts.icon) : null, h('span', null, text));
    rootEl.appendChild(t);
    setTimeout(() => t.classList.add('out'), (opts && opts.ms) || 4200);
    setTimeout(() => t.remove(), ((opts && opts.ms) || 4200) + 400);
  };

  /* ---------------- small widgets ---------------- */
  UI.btn = (label, onclick, cls, attrs) => h('button', Object.assign({ class: 'btn ' + (cls || ''), type: 'button', onclick }, attrs || {}), label);
  UI.chip = (text, cls) => h('span', { class: 'chip ' + (cls || '') }, text);
  UI.kv = (rows) => h('dl', { class: 'kv' }, rows.map(([k, v, cls]) => [h('dt', null, k), h('dd', { class: cls || '' }, v)]));

  /** A horizontal bar. opts: { max, mark, cls, label } */
  UI.bar = (value, opts) => {
    const o = opts || {};
    const max = o.max || 100;
    const bar = h('div', { class: 'bar ' + (o.cls || '') }, h('div', { class: 'fill', style: { width: U.clamp(100 * value / max, 0, 100) + '%' } }));
    if (o.mark !== undefined) bar.appendChild(h('div', { class: 'mark', style: { left: U.clamp(100 * o.mark / max, 0, 100) + '%' }, title: o.markLabel || '' }));
    return bar;
  };

  UI.signed = (x, dp) => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(dp || 0);

  const METERS = [['board', 'Board', 'Your own board\'s confidence in you'], ['street', 'Street', 'What investors and analysts think'], ['people', 'People', 'Employees, founders and the public'], ['heat', 'Heat', 'Hostility, press and regulatory attention. Lower is better.']];
  UI.METERS = METERS;

  /** The four-meter HUD. Shows the change since the last render. */
  UI.hud = function (run) {
    const prev = run._shown || Object.assign({}, run.deal.meters);
    const now = run.deal.meters;
    const el = h('div', { class: 'hud' }, METERS.map(([k, name, tip]) => {
      const d = Math.round(now[k] - prev[k]);
      const good = k === 'heat' ? d < 0 : d > 0;
      return h('div', { class: 'meter m-' + k, title: tip },
        h('div', { class: 'meter-top' }, UI.icon(k), h('span', { class: 'meter-name' }, name), h('span', { class: 'meter-val' }, Math.round(now[k])),
          d ? h('span', { class: 'delta ' + (good ? 'up' : 'down') }, UI.signed(d)) : null),
        UI.bar(now[k], { cls: k === 'heat' ? (now[k] >= 60 ? 'bad' : now[k] >= 40 ? 'warn' : 'cool') : (now[k] < 35 ? 'bad' : now[k] < 50 ? 'warn' : '') }));
    }), h('div', { class: 'meter m-days', title: 'Days since the file opened' }, h('div', { class: 'meter-top' }, UI.icon('days'), h('span', { class: 'meter-name' }, 'Day'), h('span', { class: 'meter-val' }, Math.round(run.deal.days)))));
    run._shown = Object.assign({}, now);
    return el;
  };

  /** Chips describing how meters moved between two snapshots. */
  UI.fxChips = function (before, after, extra) {
    const out = [];
    METERS.forEach(([k, name]) => {
      const d = Math.round(after[k] - before[k]);
      if (!d) return;
      const good = k === 'heat' ? d < 0 : d > 0;
      out.push(UI.chip(name + ' ' + UI.signed(d), good ? 'good' : 'bad'));
    });
    (extra || []).forEach((x) => out.push(x));
    return out.length ? h('div', { class: 'fx' }, out) : null;
  };

  UI.snap = (run) => Object.assign({}, run.deal.meters);

  /* ---------------- concepts ---------------- */
  UI.showConcept = function (id) {
    const c = WR.data.concepts[id];
    if (!c) return;
    const deals = (WR.data.library || []).filter((d) => d.concepts.includes(id));
    UI.modal(c.name, h('div', { class: 'concept-full' },
      h('div', { class: 'kicker' }, c.cat),
      h('p', { class: 'lede' }, c.short),
      h('p', null, c.body),
      deals.length ? h('div', { class: 'seen-in' }, h('div', { class: 'kicker' }, 'Seen in real deals'),
        deals.map((d) => h('a', { class: 'mini-deal', href: '#/library/' + d.id, onclick: () => { document.getElementById('modal-root').innerHTML = ''; } }, h('b', null, d.title), ' ', h('span', null, '(' + d.year + ')')))) : null));
  };
  UI.conceptChip = (id) => {
    const c = WR.data.concepts[id];
    return c ? h('button', { class: 'chip concept', type: 'button', onclick: () => UI.showConcept(id) }, UI.icon('cap'), c.name) : null;
  };

  /** Which files teach a concept (for the Academy's "where to unlock" hint). */
  UI.conceptFiles = function (id) {
    const out = [];
    Object.values(WR.data.files).sort((a, b) => a.n - b.n).forEach((f) => {
      const hit = f.stages.some((s) => ['teaches', 'teachesOnEnd', 'teachesOnClose', 'teachesOnLock'].some((k) => (s[k] || []).includes(id)) ||
        ['options', 'issues', 'cards', 'actions', 'initiatives', 'levers'].some((k) => Array.isArray(s[k]) && s[k].some((o) => (o.teaches || []).includes(id))));
      if (hit) out.push(f);
    });
    return out;
  };

  UI.STAGE = {
    brief: ['Briefing', 'news'], decision: ['Decision', 'flag'], diligence: ['Data room', 'eye'], pricing: ['Valuation', 'coin'],
    auction: ['Auction', 'street'], negotiation: ['Negotiation', 'people'], battle: ['Takeover fight', 'sword'], vote: ['Shareholder vote', 'board'],
    regulatory: ['Regulator', 'shield'], integration: ['Integration', 'gem'], lbo: ['Deal structure', 'coin'],
  };
  UI.Q = [['Poor call', 'bad'], ['Weak call', 'warn'], ['Reasonable', 'ok'], ['Strong call', 'good']];
  UI.qLabel = (q) => UI.Q[Math.max(0, Math.min(3, Math.round(q)))];

  UI.stars = (n) => h('span', { class: 'stars', 'aria-label': n + ' of 3 stars' }, [0, 1, 2].map((i) => UI.icon('star', i < n ? 'on' : 'off')));
  UI.money = (x, run) => U.money(x, run.file.unit);
  UI.stages = {};
})(typeof window !== 'undefined' ? window : globalThis);
