/* ---------------------------------------------------------------------
 * screens.js: landing, hub, file intro, play shell, debrief, academy,
 * library and credits.
 * ------------------------------------------------------------------- */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const UI = WR.ui;
  const h = UI.h;
  const D = WR.sim.director;
  const Sc = WR.sim.score;
  const files = () => Object.values(WR.data.files).sort((a, b) => a.n - b.n);
  const img = (name) => 'assets/img/' + name;
  const go = (hash) => { location.hash = hash; };

  function nav(active) {
    const p = UI.store.load(), xp = UI.store.xp(p), rank = Sc.rank(xp);
    const link = (href, label, key) => h('a', { href, class: active === key ? 'on' : '' }, label);
    return h('header', { class: 'nav' },
      h('a', { class: 'brand', href: '#/' }, h('span', { class: 'brand-mark' }, 'W'), h('span', null, 'M&A War Room')),
      h('nav', null, link('#/hub', 'Deal files', 'hub'), link('#/academy', 'Academy', 'academy'), link('#/library', 'Deal library', 'library'), link('#/credits', 'Credits', 'credits')),
      h('a', { class: 'rank-badge', href: '#/hub', title: xp + ' XP' }, UI.icon('star', 'on'), h('span', null, rank.name)));
  }
  function page(active, ...kids) { return h('div', { class: 'page' }, nav(active), h('main', { class: 'wrap' }, kids), footer()); }
  function footer() {
    return h('footer', { class: 'foot' }, h('span', null, 'M&A War Room. A free teaching game: fictional companies, real lessons. Runs entirely in your browser.'),
      h('span', null, h('a', { href: '#/credits' }, 'Photo credits'), ' · ', h('a', { href: 'https://github.com/Nnd1106/mna-war-room', target: '_blank', rel: 'noopener' }, 'Source'), ' · Built by ', h('a', { href: 'https://nnd1106.github.io/', target: '_blank', rel: 'noopener' }, 'Niranjan Desai')));
  }
  const diff = (n) => h('span', { class: 'diff', title: 'Difficulty ' + n + ' of 3' }, [1, 2, 3].map((i) => h('i', { class: i <= n ? 'on' : '' })));

  /* ---------------- landing ---------------- */
  UI.landing = function () {
    const fs = files();
    return h('div', { class: 'landing' },
      h('section', { class: 'hero', style: { backgroundImage: 'linear-gradient(180deg, rgba(8,12,18,.55), rgba(8,12,18,.94)), url(' + img('hero.jpg') + ')' } },
        h('div', { class: 'hero-in' },
          h('div', { class: 'kicker gold' }, 'A strategy game about mergers and acquisitions'),
          h('h1', null, 'M&A War Room'),
          h('p', { class: 'hero-sub' }, 'Nine deals. Nine seats at the table. Buy a founder\'s brand, win an auction without overpaying, lay siege to a board, defend your own, borrow to buy, merge with an equal, cross a border, face an activist, and bid for a company in ruins.'),
          h('div', { class: 'actions' }, h('a', { class: 'btn primary big', href: '#/hub' }, 'Open the deal files'), h('a', { class: 'btn ghost big', href: '#/file/firefly' }, 'Start with File 1')),
          h('div', { class: 'hero-facts' }, h('span', null, h('b', null, '9'), ' deal files'), h('span', null, h('b', null, '10'), ' game mechanics'), h('span', null, h('b', null, String(Object.keys(WR.data.concepts).length)), ' concepts to unlock'), h('span', null, h('b', null, String(WR.data.library.length)), ' real deals in the library')))),
      h('section', { class: 'wrap pitch' },
        h('div', { class: 'pitch-card' }, UI.icon('seed'), h('h3', null, 'Every seed hides a different truth'), h('p', null, 'Skeletons in the data room, a rival\'s real ceiling, what the other side secretly cares about, the recession that arrives in year two. They are drawn fresh each game, so no two deals play the same.')),
        h('div', { class: 'pitch-card' }, UI.icon('flag'), h('h3', null, 'Walking away can be the winning move'), h('p', null, 'You are scored on value, not on closing. If the price passes what the business is worth and you stop, that is a top grade. If you win the auction by overpaying, the newspaper says so.')),
        h('div', { class: 'pitch-card' }, UI.icon('cap'), h('h3', null, 'A debrief that teaches'), h('p', null, 'After each file you see everything that was hidden, a grade on five dimensions, the coach\'s line on every call, and how the coach would have played the very same seed.'))),
      h('section', { class: 'wrap' }, h('h2', { class: 'sec' }, 'The nine files'),
        h('div', { class: 'strip' }, fs.map((f) => h('a', { class: 'strip-card', href: '#/file/' + f.id, style: { backgroundImage: 'linear-gradient(180deg, rgba(8,12,18,.2), rgba(8,12,18,.92)), url(' + img(f.image) + ')' } },
          h('span', { class: 'file-no' }, 'File ' + f.n), h('b', null, f.code), h('span', null, f.type))))),
      footer());
  };

  /* ---------------- hub ---------------- */
  UI.hub = function () {
    const p = UI.store.load(), xp = UI.store.xp(p), rank = Sc.rank(xp);
    const fs = files();
    const done = fs.filter((f) => p.best[f.id]).length;
    const nextUp = fs.find((f) => !p.best[f.id]);
    const top = Object.entries(p.archetypes).sort((a, b) => b[1] - a[1])[0];
    return page('hub',
      h('section', { class: 'career' },
        h('div', { class: 'career-main' },
          h('div', { class: 'kicker gold' }, 'Your career'),
          h('h1', null, rank.name),
          h('div', { class: 'xp' }, UI.bar(100 * rank.progress, { cls: 'gold' }), h('span', { class: 'mono' }, xp + ' XP' + (rank.next ? ' · ' + (rank.next - xp) + ' to ' + rank.nextName : ' · top rank'))),
          h('p', { class: 'muted' }, 'XP is your best result on each file. Replaying a file on a new seed can raise it; it can never lower it.')),
        h('div', { class: 'career-stats' },
          h('div', null, h('b', { class: 'mono' }, done + '/9'), h('span', null, 'files closed')),
          h('div', null, h('b', { class: 'mono' }, p.concepts.length + '/' + Object.keys(WR.data.concepts).length), h('span', null, 'concepts')),
          h('div', null, h('b', { class: 'mono' }, String(p.plays)), h('span', null, 'deals played')),
          h('div', null, h('b', null, top ? Sc.ARCHETYPES[top[0]][0].replace('The ', '') : 'Not yet known'), h('span', null, 'your style')))),
      h('h2', { class: 'sec' }, 'Deal files'),
      h('div', { class: 'file-grid' }, fs.map((f) => {
        const b = p.best[f.id];
        return h('a', { class: 'file-card' + (nextUp && nextUp.id === f.id ? ' next' : ''), href: '#/file/' + f.id },
          h('div', { class: 'file-img', style: { backgroundImage: 'linear-gradient(180deg, rgba(8,12,18,0) 30%, rgba(13,19,27,1)), url(' + img(f.image) + ')' } },
            h('span', { class: 'file-no' }, 'File ' + f.n), nextUp && nextUp.id === f.id ? h('span', { class: 'next-tag' }, 'Up next') : null,
            b ? h('span', { class: 'grade-badge g-' + b.grade[0] }, b.grade) : null),
          h('div', { class: 'file-body' },
            h('div', { class: 'file-code' }, f.code), h('h3', null, f.title),
            h('div', { class: 'file-type' }, f.type, ' ', diff(f.difficulty)),
            h('p', null, f.tagline),
            h('div', { class: 'file-foot' }, h('span', { class: 'muted small' }, 'You are: ' + f.seat), b ? UI.stars(b.stars) : null)));
      })),
      p.history.length ? h('section', null, h('h2', { class: 'sec' }, 'Recent deals'),
        h('div', { class: 'history-list' }, p.history.slice(0, 8).map((x) => {
          const f = WR.data.files[x.file];
          return f ? h('a', { class: 'hist-row', href: '#/play/' + f.id + '/' + encodeURIComponent(x.seed) }, h('span', { class: 'grade-badge small g-' + x.grade[0] }, x.grade), h('b', null, f.code), h('span', null, x.title), h('span', { class: 'muted mono small' }, 'seed ' + x.seed), h('span', { class: 'muted small' }, 'replay')) : null;
        }))) : null,
      h('div', { class: 'reset' }, UI.btn('Reset all progress', () => {
        UI.modal('Reset progress?', h('div', null, h('p', null, 'This clears your rank, grades and unlocked concepts on this device. It cannot be undone.'),
          h('div', { class: 'actions' }, UI.btn('Reset everything', () => { UI.store.reset(); document.getElementById('modal-root').innerHTML = ''; WR.app.render(); }, 'danger'), UI.btn('Keep my progress', () => { document.getElementById('modal-root').innerHTML = ''; }, 'ghost'))));
      }, 'ghost tiny')));
  };

  /* ---------------- file intro ---------------- */
  UI.fileIntro = function (id) {
    const f = WR.data.files[id];
    if (!f) return UI.hub();
    const p = UI.store.load(), b = p.best[f.id];
    const seedIn = h('input', { type: 'text', class: 'seed-in', placeholder: 'random', maxlength: 24, 'aria-label': 'Seed (optional)' });
    const start = () => go('#/play/' + f.id + '/' + encodeURIComponent((seedIn.value || '').trim().toUpperCase() || U.newSeed()));
    const kinds = f.stages.filter((s) => s.type !== 'brief').map((s) => s.type).filter((t, i, a) => a.indexOf(t) === i);
    const deals = WR.data.library.filter((d) => (d.files || []).includes(f.id));
    return page('hub',
      h('a', { class: 'back', href: '#/hub' }, UI.icon('back'), 'All files'),
      h('section', { class: 'file-hero', style: { backgroundImage: 'linear-gradient(90deg, rgba(11,16,23,.96) 35%, rgba(11,16,23,.55)), url(' + img(f.image) + ')' } },
        h('div', { class: 'kicker gold' }, 'File ' + f.n + ' · ' + f.type), h('div', { class: 'file-code big' }, f.code), h('h1', null, f.title),
        h('p', { class: 'hero-sub' }, f.tagline),
        h('div', { class: 'seat' }, h('span', { class: 'muted' }, 'Your seat'), h('b', null, f.seat), diff(f.difficulty)),
        h('div', { class: 'start-row' }, UI.btn('Open the file', start, 'primary big'), h('label', { class: 'seed-label' }, UI.icon('seed'), 'Seed', seedIn),
          b ? h('span', { class: 'best' }, 'Your best: ', h('b', { class: 'grade-badge small g-' + b.grade[0] }, b.grade), ' ', b.title) : null)),
      h('div', { class: 'two' },
        h('section', { class: 'panel' }, h('h3', null, 'What you will learn'), h('ul', { class: 'learn' }, f.learn.map((x) => h('li', null, UI.icon('check'), x)))),
        h('section', { class: 'panel' }, h('h3', null, 'How it plays'), h('div', { class: 'kinds' }, kinds.map((t) => h('span', { class: 'kind-chip' }, UI.icon(UI.STAGE[t][1]), UI.STAGE[t][0]))),
          h('p', { class: 'muted' }, f.stages.length + ' stages, about ' + Math.max(8, Math.round(f.stages.length * 1.8)) + ' minutes. A seed fixes every hidden fact, so you can replay the same deal or share it with a friend. Leave it blank for a new one.'))),
      deals.length ? h('section', { class: 'panel' }, h('h3', null, 'The real thing'), h('div', { class: 'mini-deals' }, deals.map((d) => h('a', { class: 'mini-deal', href: '#/library/' + d.id }, h('b', null, d.title), h('span', null, ' ' + d.year + ' · ' + d.type))))) : null);
  };

  /* ---------------- play ---------------- */
  UI.play = function (id, seed) {
    const f = WR.data.files[id];
    if (!f) return UI.hub();
    const run = D.create(f, seed);
    let shownConcepts = 0, shownNews = 0;
    const hudBox = h('div', { class: 'hud-box' });
    const stageBox = h('section', { class: 'stage' });
    const ticker = h('div', { class: 'ticker', 'aria-live': 'polite' });
    const progress = h('div', { class: 'progress' });
    const shell = h('div', { class: 'page play' },
      h('header', { class: 'play-top' },
        h('a', { class: 'back', href: '#/file/' + f.id, title: 'Leave this deal', onclick: (e) => { if (!run.done && run.idx > 0 && !confirm('Leave this deal? Your progress in it will be lost.')) e.preventDefault(); } }, UI.icon('back'), 'Leave'),
        h('div', { class: 'play-title' }, h('span', { class: 'file-code' }, f.code), h('span', { class: 'muted' }, f.type)),
        h('button', { class: 'seed-tag mono', type: 'button', title: 'Copy the seed', onclick: () => { if (navigator.clipboard) navigator.clipboard.writeText(run.seed).then(() => UI.toast('Seed copied: ' + run.seed), () => {}); } }, UI.icon('seed'), run.seed)),
      progress, hudBox, h('main', { class: 'wrap narrow' }, stageBox), ticker);

    function sync() {
      hudBox.innerHTML = ''; hudBox.appendChild(UI.hud(run));
      run.deal.concepts.slice(shownConcepts).forEach((cid) => { const c = WR.data.concepts[cid]; if (c) UI.toast('Concept unlocked: ' + c.name, { icon: 'cap', tone: 'gold', onclick: () => UI.showConcept(cid) }); });
      shownConcepts = run.deal.concepts.length;
      if (run.deal.news.length > shownNews) {
        ticker.innerHTML = '';
        const n = run.deal.news[run.deal.news.length - 1];
        ticker.appendChild(h('div', { class: 'tick ' + n.tone }, h('span', { class: 'tick-tag' }, 'Newswire'), h('span', null, n.headline)));
        shownNews = run.deal.news.length;
      }
    }
    function drawProgress() {
      progress.innerHTML = '';
      f.stages.forEach((s, i) => progress.appendChild(h('span', { class: 'dot ' + (i < run.idx || run.done ? 'done' : i === run.idx ? 'now' : ''), title: s.title })));
    }
    function showStage() {
      drawProgress();
      stageBox.innerHTML = '';
      if (run.done) { finish(); return; }
      const stage = D.stage(run);
      const meta = UI.STAGE[stage.type];
      const ctx = {
        sync,
        advance: () => { if (!run.done) { const st = run.st[stage.id]; D.next(run, (st && st.goto) || undefined); } showStage(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
        next: (label) => h('div', { class: 'actions next' }, UI.btn([label || 'Continue', UI.icon('arrow')], () => ctx.advance(), 'primary')),
      };
      stageBox.appendChild(h('div', { class: 'stage-head' }, h('div', { class: 'kicker gold' }, UI.icon(meta[1]), meta[0] + ' · stage ' + (run.idx + 1) + ' of ' + f.stages.length), h('h2', null, stage.title),
        (stage.teaches || []).length ? h('div', { class: 'chips' }, stage.teaches.map(UI.conceptChip)) : null));
      stageBox.appendChild(UI.stages[stage.type](run, stage, ctx));
      sync();
    }
    function finish() {
      const v = D.verdict(run);
      const rec = UI.store.record(f, v);
      hudBox.innerHTML = ''; ticker.innerHTML = '';
      stageBox.appendChild(UI.debrief(run, v, rec));
      if (rec.rankAfter.index > rec.rankBefore.index) UI.toast('Promoted to ' + rec.rankAfter.name, { icon: 'star', tone: 'gold', ms: 6000 });
    }
    showStage();
    return shell;
  };

  /* ---------------- debrief ---------------- */
  const DIMS = [['strategy', 'Strategy', 'The quality of your judgment calls'], ['price', 'Price', 'The value you got for what you paid or accepted'], ['execution', 'Execution', 'How well you played each stage'], ['stakeholders', 'Stakeholders', 'Board, investors, people and heat at the end'], ['risk', 'Risk', 'What you missed and what you left exposed']];
  const KIND = { flag: ['Hidden problem', 'flag'], gem: ['Hidden upside', 'gem'], synergy: ['Synergy', 'coin'], rival: ['Rival bidder', 'street'], mind: ['The other side', 'people'], reg: ['Regulator', 'shield'], macro: ['The economy', 'street'], lever: ['Lever', 'coin'], bloc: ['Shareholders', 'board'], move: ['Their move', 'sword'] };

  UI.debrief = function (run, v, rec) {
    const f = run.file;
    const cf = D.counterfactual(f, run.seed);
    const cv = cf.verdict;
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const deals = WR.data.library.filter((d) => (d.files || []).includes(f.id)).slice(0, 3);
    const mine = {};
    v.judgment.forEach((j) => { mine[j.stage + '|' + j.title] = j; });
    const differs = cf.choices.filter((c) => { const m = mine[c.stage + '|' + c.title]; return !m || m.option !== c.option; }).slice(0, 8);
    return h('div', { class: 'debrief' },
      h('article', { class: 'paper ' + v.outcome.tone },
        h('div', { class: 'paper-head' }, h('span', null, 'The Financial Courier'), h('span', null, date)),
        h('h1', null, v.headline),
        h('div', { class: 'paper-body' }, h('p', null, h('b', null, v.outcome.title + '. '), v.outcome.text))),
      h('section', { class: 'verdict' },
        h('div', { class: 'grade-box g-' + v.grade[0] }, h('div', { class: 'grade' }, v.grade), UI.stars(v.stars), h('div', { class: 'mono' }, Math.round(v.overall) + ' / 100')),
        h('div', { class: 'dims' }, DIMS.map(([k, name, tip]) => h('div', { class: 'dim', title: tip }, h('span', { class: 'dim-name' }, name), UI.bar(v.dims[k], { cls: v.dims[k] >= 74 ? '' : v.dims[k] >= 50 ? 'warn' : 'bad' }), h('b', { class: 'mono' }, v.grades[k])))),
        h('div', { class: 'xp-box' },
          h('div', { class: 'kicker' }, rec.improved ? (rec.first ? 'First result on this file' : 'New personal best') : 'Your best on this file stands'),
          h('b', { class: 'mono big' }, '+' + (rec.xpAfter - rec.xpBefore) + ' XP'),
          h('div', { class: 'muted small' }, rec.rankAfter.name + (rec.rankAfter.next ? ' · ' + (rec.rankAfter.next - rec.xpAfter) + ' XP to ' + rec.rankAfter.nextName : '')),
          UI.bar(100 * rec.rankAfter.progress, { cls: 'gold' }))),
      h('div', { class: 'two' },
        h('section', { class: 'panel' }, h('h3', null, 'The numbers'), UI.kv(v.facts)),
        h('section', { class: 'panel archetype' }, h('div', { class: 'kicker' }, 'How you played it'), h('h3', null, v.archetype.name), h('p', null, v.archetype.text),
          h('div', { class: 'muted small' }, 'Closed in ' + Math.round(v.days) + ' days · seed ' + v.seed))),
      v.reveal.length ? h('section', { class: 'panel' }, h('h3', null, 'What the seed was hiding'),
        h('div', { class: 'reveal' }, v.reveal.map((r) => { const k = KIND[r.kind] || KIND.flag; return h('div', { class: 'rev ' + (r.found ? 'found' : 'missed') }, UI.icon(k[1]), h('div', null, h('div', { class: 'kicker' }, k[0]), h('b', null, r.text), r.note ? h('span', { class: 'muted' }, ' ' + r.note) : null)); }))) : null,
      v.judgment.length ? h('section', { class: 'panel' }, h('h3', null, 'Your calls, and the coach\'s view'),
        h('div', { class: 'calls' }, v.judgment.map((j) => { const q = UI.qLabel(j.q); return h('div', { class: 'call' }, h('div', { class: 'call-head' }, h('span', { class: 'muted' }, j.title), h('span', { class: 'q ' + q[1] }, q[0])), h('b', null, j.label), j.coach ? h('p', { class: 'muted' }, j.coach) : null); }))) : null,
      h('section', { class: 'panel coach-panel' }, h('h3', null, UI.icon('cap'), ' The coach, on the same seed'),
        h('p', null, 'Facing exactly the same hidden facts, the coach finished with ', h('b', { class: 'grade-badge small g-' + cv.grade[0] }, cv.grade), ' (' + Math.round(cv.overall) + '/100): ', h('b', null, cv.outcome.title), '. ',
          v.overall >= cv.overall - 0.5 ? 'You matched or beat it.' : 'That is ' + Math.round(cv.overall - v.overall) + ' points better than your result.'),
        h('p', { class: 'muted small' }, 'The coach is a rule-based player that takes the textbook line at each step. It can still be unlucky, and it can be beaten.'),
        differs.length ? h('details', null, h('summary', null, 'Where the coach chose differently (' + differs.length + ')'), h('div', { class: 'calls' }, differs.map((c) => h('div', { class: 'call' }, h('span', { class: 'muted' }, c.title), h('b', null, c.label), mine[c.stage + '|' + c.title] ? h('span', { class: 'muted small' }, 'You: ' + mine[c.stage + '|' + c.title].label) : null)))) : null),
      v.concepts.length ? h('section', { class: 'panel' }, h('h3', null, 'Concepts in this deal' + (rec.fresh.length ? ' (' + rec.fresh.length + ' new)' : '')), h('div', { class: 'chips' }, v.concepts.map(UI.conceptChip))) : null,
      deals.length ? h('section', { class: 'panel' }, h('h3', null, 'It happened for real'), h('div', { class: 'mini-deals' }, deals.map((d) => h('a', { class: 'mini-deal', href: '#/library/' + d.id }, h('b', null, d.title), h('span', null, ' ' + d.year + ': ' + d.lesson))))) : null,
      h('div', { class: 'actions end' },
        UI.btn('Play it again on a new seed', () => go('#/play/' + f.id + '/' + encodeURIComponent(U.newSeed())), 'primary'),
        UI.btn('Replay this exact deal', () => { go('#/play/' + f.id + '/' + encodeURIComponent(run.seed) + '/r' + Date.now()); }, 'ghost'),
        h('a', { class: 'btn ghost', href: '#/hub' }, 'Back to the deal files')));
  };

  /* ---------------- academy ---------------- */
  UI.academy = function () {
    const p = UI.store.load();
    const all = WR.data.concepts, cats = WR.data.conceptCats;
    const total = Object.keys(all).length;
    return page('academy',
      h('section', { class: 'sub-hero', style: { backgroundImage: 'linear-gradient(90deg, rgba(11,16,23,.97) 40%, rgba(11,16,23,.6)), url(' + img('library.jpg') + ')' } },
        h('div', { class: 'kicker gold' }, 'The Academy'), h('h1', null, 'Seventy-odd ideas that decide deals'),
        h('p', { class: 'hero-sub' }, 'Each card is unlocked by meeting the idea in play. You have ' + p.concepts.length + ' of ' + total + '.'),
        h('div', { class: 'xp' }, UI.bar(100 * p.concepts.length / total, { cls: 'gold' }))),
      cats.map((cat) => {
        const list = Object.values(all).filter((c) => c.cat === cat);
        return h('section', null, h('h2', { class: 'sec' }, cat, h('span', { class: 'muted small' }, ' ' + list.filter((c) => p.concepts.includes(c.id)).length + '/' + list.length)),
          h('div', { class: 'concept-grid' }, list.map((c) => {
            const open = p.concepts.includes(c.id);
            const where = open ? [] : UI.conceptFiles(c.id);
            return h('button', { type: 'button', class: 'concept-card ' + (open ? 'open' : 'locked'), onclick: () => { if (open) UI.showConcept(c.id); else UI.toast('Play ' + (where.length ? where.map((f) => f.code).join(' or ') : 'the files') + ' to unlock "' + c.name + '"', { icon: 'lock' }); } },
              h('div', { class: 'concept-top' }, UI.icon(open ? 'cap' : 'lock'), h('b', null, c.name)),
              h('p', null, c.short),
              open ? null : h('div', { class: 'muted small' }, where.length ? 'Unlock in ' + where.map((f) => f.code).join(', ') : 'Unlock in play'));
          })));
      }));
  };

  /* ---------------- library ---------------- */
  UI.library = function (focus) {
    const VERD = { worked: ['It worked', 'good'], failed: ['It failed', 'bad'], mixed: ['Mixed result', 'warn'] };
    const el = page('library',
      h('section', { class: 'sub-hero', style: { backgroundImage: 'linear-gradient(90deg, rgba(11,16,23,.97) 40%, rgba(11,16,23,.6)), url(' + img('library.jpg') + ')' } },
        h('div', { class: 'kicker gold' }, 'The Deal Library'), h('h1', null, 'It happened for real'),
        h('p', { class: 'hero-sub' }, WR.data.library.length + ' real transactions, what happened and what each one teaches. Figures are approximate and as widely reported; this is a teaching summary, not a source of record.')),
      h('div', { class: 'lib' }, WR.data.library.slice().sort((a, b) => a.year - b.year).map((d) => h('article', { class: 'deal' + (focus === d.id ? ' focus' : ''), id: 'deal-' + d.id },
        h('div', { class: 'deal-head' }, h('span', { class: 'year mono' }, d.year), h('div', null, h('h3', null, d.title), h('div', { class: 'muted small' }, d.type + ' · ' + d.value)), UI.chip(VERD[d.verdict][0], VERD[d.verdict][1])),
        h('p', null, d.story),
        h('p', { class: 'lesson' }, h('b', null, 'The lesson. '), d.lesson),
        h('div', { class: 'chips' }, d.concepts.map((cid) => { const c = WR.data.concepts[cid]; return h('button', { class: 'chip concept', type: 'button', onclick: () => UI.showConcept(cid) }, c.name); }),
          (d.files || []).map((fid) => h('a', { class: 'chip play', href: '#/file/' + fid }, 'Play ' + WR.data.files[fid].code)))))));
    if (focus) setTimeout(() => { const t = document.getElementById('deal-' + focus); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60);
    return el;
  };

  /* ---------------- credits ---------------- */
  UI.credits = function () {
    return page('credits',
      h('h1', { class: 'plain' }, 'Credits'),
      h('section', { class: 'panel' }, h('h3', null, 'Photographs'),
        h('p', { class: 'muted' }, 'All photographs are from Unsplash and published under the Unsplash Licence, which allows free use without permission or attribution. The photographers are credited here with thanks.'),
        h('div', { class: 'credit-grid' }, WR.data.credits.map((c) => h('a', { class: 'credit', href: c.url, target: '_blank', rel: 'noopener' },
          h('div', { class: 'credit-img', style: { backgroundImage: 'url(' + img(c.file) + ')' } }), h('div', null, h('b', null, c.by), h('span', { class: 'muted small' }, c.what), h('span', { class: 'muted small' }, c.used + ' · ' + c.licence)))))),
      h('section', { class: 'panel' }, h('h3', null, 'About the game'),
        h('p', null, 'M&A War Room was designed and built by Niranjan Desai as a teaching tool. Every company you play is fictional. The deals in the library are real, summarised from public reporting, with approximate figures.'),
        h('p', null, 'There are no accounts, no tracking and no servers: the game is a set of static files, your progress is stored only in this browser, and every opponent is a small rule-based engine written in plain JavaScript. The buyout arithmetic uses the tested engine from the Valuation & Deal Lab.'),
        h('p', { class: 'muted' }, 'Nothing here is investment, legal or financial advice.')));
  };
})(typeof window !== 'undefined' ? window : globalThis);
