/* Deal File 6: TWIN PEAKS. A merger of equals. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const S = () => WR.sim.score;
  const fl = (run) => run.deal.flags;
  const A = 5000, B_BOOK = 5000, SYN = 1500, COST = 350;

  function bTrue(run) {
    const dd = run.file.stages.find((s) => s.id === 'dd');
    if (!run.st.dd) { run.st.dd = {}; WR.sim.diligence.init(run, dd); }
    return B_BOOK + U.sum(dd.issues.filter((i) => run.st.dd.present[i.id]).map((i) => i.impact));
  }

  WR.data.files.twinpeaks = {
    id: 'twinpeaks', n: 6, code: 'TWIN PEAKS', title: 'Two Captains', type: 'Merger of equals',
    seat: 'Chief Executive, Aurora Air', difficulty: 3, unit: '$ m', image: 'twinpeaks.jpg',
    tagline: 'Two airlines of the same size, no cash changing hands, and one question nobody wants to ask first: who is in charge?',
    learn: ['Why a "merger of equals" is the hardest deal to do', 'Exchange ratios and relative value', 'Social issues: chief executive, chair, name, headquarters', 'Winning a shareholder vote', 'Slot remedies and a two-year integration'],
    truth(rng) { return { syn: rng.range(0.7, 1.05) }; },
    stages: [
      {
        id: 'brief', type: 'brief', title: 'A dinner in a neutral city',
        text: [
          '<b>Aurora Air</b>, which you run, flies from the north. <b>Solstice Airways</b> flies from the south. Each is worth about $5 billion; each is too small to match the three giants on fuel, aircraft orders and loyalty schemes. Together you would be the fourth giant.',
          'Neither side can afford to buy the other, and neither board would accept being bought. So the idea on the table is a merger of equals: no premium, all shares, one new company. Bankers put the savings at $1.5 billion in today\'s money, mostly from one network and one fleet.',
          'Mergers of equals rarely fail on the arithmetic. They fail on what the lawyers politely call the social issues: who is chief executive, who is chair, whose name is on the aircraft, which city keeps the head office. Every one of those is about to be yours to trade.',
        ],
        cast: [
          { name: 'Isabel Ferreira', role: 'Chief Executive, Solstice Airways', line: 'I am sure we can agree on everything. Except, possibly, the things that matter.' },
          { name: 'Captain Tom Okafor', role: 'Chair, Aurora pilots\' association', line: 'Whose seniority list? That is the only question my members will ask.' },
        ],
        teaches: ['merger_of_equals'],
      },
      {
        id: 'logic', type: 'decision', title: 'Why are we doing this?',
        prompt: 'Before the bankers start, your board asks for the case in one sentence. Which one do you give?',
        options: [
          { id: 'network', label: '"Our networks barely overlap. One schedule turns two regional airlines into a national one."', q: 3, effects: { board: 5, street: 3 }, set: { logic: 'network' },
            outcome: 'The board can repeat it, the analysts can model it, and the regulator will find it harder to object to routes that do not overlap.',
            coach: 'The best merger logic is specific and complementary. Each side brings what the other lacks.' },
          { id: 'cost', label: '"There is $1.5 billion of cost to take out, mostly people and head office."', q: 2, effects: { board: 3, people: -8 }, set: { logic: 'cost' },
            outcome: 'It is true, and it is in the newspapers by Thursday as "merger to cost 6,000 jobs". The unions on both sides start talking to each other.',
            coach: 'Cost synergies are the most reliable kind, but leading with them turns every employee into an opponent before the deal is signed.' },
          { id: 'scale', label: '"The industry is consolidating. We have to be bigger."', q: 0, effects: { board: -4, street: -5 }, set: { logic: 'scale' },
            outcome: 'A director asks what being bigger is for. You do not have a second sentence.',
            coach: 'Size is not a strategy. "Everyone else is merging" is how boards approve deals they cannot later explain.' },
        ],
      },
      {
        id: 'dd', type: 'diligence', title: 'Looking under each other\'s wings', days: 7,
        intro: 'In a merger of equals both sides open their books at once. The agreed starting point is that the two airlines are worth the same. Whatever you can prove about Solstice moves the exchange ratio in your favour; whatever you miss, your shareholders will own half of.',
        streams: [
          { id: 'fin', name: 'Balance sheet', desc: 'Aircraft leases, pensions, fuel hedges' },
          { id: 'ops', name: 'Fleet and maintenance', desc: 'Aircraft age, heavy checks, engines' },
          { id: 'com', name: 'Commercial', desc: 'Routes, slots, loyalty scheme, corporate accounts' },
          { id: 'ppl', name: 'Labour', desc: 'Union agreements, pay scales, seniority' },
        ],
        issues: [
          { id: 'pension', stream: 'fin', depth: 2, kind: 'flag', p: 0.55, impact: -260, chip: 120, title: 'Pension deficit', text: 'Solstice\'s closed pension scheme is $260 million short on a realistic discount rate. Its accounts use a kinder one.', teaches: ['red_flags'] },
          { id: 'hedge', stream: 'fin', depth: 1, kind: 'flag', p: 0.5, impact: -120, chip: 60, title: 'Fuel hedges under water', text: 'Solstice locked in fuel well above today\'s price for the next two years.' },
          { id: 'checks', stream: 'ops', depth: 2, kind: 'flag', p: 0.5, impact: -180, chip: 90, title: 'A wall of heavy maintenance', text: 'Twenty-two aircraft fall due for heavy checks in the same eighteen months. The cost is not provided for.' },
          { id: 'loyalty', stream: 'com', depth: 2, kind: 'gem', p: 0.5, impact: 220, title: 'An undervalued loyalty scheme', text: 'Solstice\'s frequent-flyer scheme sells points to two banks on contracts worth far more than the book shows.' },
          { id: 'slots', stream: 'com', depth: 1, kind: 'gem', p: 0.4, impact: 120, title: 'Slots at a full airport', text: 'Solstice holds forty peak slot pairs at an airport where none have been available for a decade.' },
          { id: 'scale', stream: 'ppl', depth: 1, kind: 'flag', p: 0.7, impact: -100, chip: 40, title: 'Higher pilot pay scale', text: 'Solstice pilots earn nine percent more for the same aircraft. A merged airline levels up, never down.', teaches: ['social_issues'] },
        ],
        coachPlan: ['fin', 'fin', 'ops', 'ops', 'ppl'],
        teaches: ['dd_scope'], teachesOnClose: ['exchange_ratio'],
      },
      {
        id: 'social', type: 'negotiation', title: 'The social issues', rounds: 5, probes: 2, failEnd: 'collapsed',
        threshold: (run) => 61 - Math.min(7, (run.deal.dd ? run.deal.dd.chips : 0) / 40),
        intro: 'Four issues: how the new company is split between the two sets of shareholders, and three questions about power. What you proved in diligence strengthens your hand. Beware the compromises that sound fair and decide nothing.',
        counterpart: { name: 'Isabel Ferreira', role: 'Chief Executive, Solstice Airways' },
        youWeights: { ratio: 2.5, ceo: 1.5, board: 1, home: 1 },
        issues: [
          { id: 'ratio', name: 'Ownership split', desc: 'The share of the combined airline held by Aurora\'s shareholders', options: [
            { id: 'r48', label: '48% Aurora, 52% Solstice', you: 0, them: 100, set: { share: 0.48 } }, { id: 'r50', label: '50 / 50', you: 45, them: 68, set: { share: 0.5 } },
            { id: 'r52', label: '52% Aurora, 48% Solstice', you: 80, them: 34, set: { share: 0.52 } }, { id: 'r54', label: '54% Aurora, 46% Solstice', you: 100, them: 5, set: { share: 0.54 } }] },
          { id: 'ceo', name: 'Chief executive', desc: 'Who runs the combined airline', options: [
            { id: 'you', label: 'You', you: 100, them: 15, set: { youCeo: true } }, { id: 'her', label: 'Isabel Ferreira', you: 50, them: 100 },
            { id: 'co', label: 'Co-chief executives', you: 25, them: 70, set: { coCeo: true } }] },
          { id: 'board', name: 'Chair and board', desc: 'Who holds the casting vote', options: [
            { id: 'yours', label: 'Aurora\'s chair, 7 of 12 seats', you: 100, them: 10 }, { id: 'even', label: 'An independent chair, six seats each', you: 75, them: 70 },
            { id: 'theirs', label: 'Solstice\'s chair, 7 of 12 seats', you: 20, them: 100 }] },
          { id: 'home', name: 'Name and head office', desc: 'Whose colours, whose city', options: [
            { id: 'aurora', label: 'Aurora name, your head office', you: 100, them: 5 }, { id: 'solstice', label: 'Solstice name, their head office', you: 45, them: 100 },
            { id: 'dual', label: 'A new combined name and two head offices', you: 30, them: 65, set: { dualHq: true } }] },
        ],
        profiles: [
          { id: 'ego', weights: { ceo: 3.5, ratio: 1.5, board: 1, home: 1 }, tell: 'She wanted the top job more than anything. Given it, she would have conceded the ownership split and the board.' },
          { id: 'holders', weights: { ratio: 3.5, ceo: 1, board: 1.5, home: 0.5 }, tell: 'Her largest shareholder had told her not to come back with less than half. She would have traded the title and the name for the ratio.' },
          { id: 'heritage', weights: { home: 3.5, board: 1.5, ratio: 1.5, ceo: 1 }, tell: 'Solstice is a national symbol in the south. The name on the tail and the city on the letterhead mattered more than who sat in which chair.' },
        ],
        teaches: ['social_issues', 'exchange_ratio'], teachesOnEnd: ['logrolling'],
      },
      {
        id: 'vote', type: 'vote', title: 'Your own shareholders', threshold: 66.7, want: 'pass', time: 4, noise: 0.07, failEnd: 'failed',
        question: 'Aurora\'s shareholders must approve the merger by a two-thirds majority',
        intro: 'You have four weeks before the meeting and each action takes time. Institutions marked as a block vote their whole holding one way. The published leanings are estimates.',
        blocs: [
          { id: 'index', name: 'Index funds', pct: 24, lean: 0.58, block: true, desc: 'Follow their governance teams and the proxy advisers.', cares: ['governance'] },
          { id: 'active', name: 'Active long-only funds', pct: 22, lean: 0.56, desc: 'Want to see the value, line by line.', cares: ['value'] },
          { id: 'arbs', name: 'Merger-arbitrage funds', pct: 12, lean: 0.72, block: true, desc: 'Bought in because of the deal. They want it done.', cares: ['value'] },
          { id: 'family', name: 'The Lindahl family trust', pct: 14, lean: 0.44, block: true, desc: 'Founded Aurora in 1952. Wary of losing it.', cares: ['heritage'] },
          { id: 'staff', name: 'Employee share scheme', pct: 10, lean: 0.4, desc: 'Pilots, crew and engineers.', cares: ['jobs'] },
          { id: 'retail', name: 'Retail shareholders', pct: 18, lean: 0.54, desc: 'Loyal, sentimental and unlikely to read the circular.', cares: ['heritage', 'value'] },
        ],
        mods: [
          { when: (run) => fl(run).share >= 0.52, sway: { value: 0.08 }, text: 'You won more than half the combined company. Value investors approve.' },
          { when: (run) => fl(run).share <= 0.48, sway: { value: -0.14 }, text: 'You gave away the majority with no premium. Value investors are unhappy.' },
          { when: (run) => !!fl(run).coCeo, sway: { governance: -0.16 }, text: 'Co-chief executives: governance teams have seen that film before.' },
          { when: (run) => !!fl(run).youCeo, sway: { heritage: 0.06, governance: 0.04 }, text: 'A single chief executive from Aurora reassures your own register.' },
          { when: (run) => !!fl(run).dualHq, sway: { heritage: 0.05, governance: -0.05 }, text: 'Two head offices please the sentimental and worry the practical.' },
          { when: (run) => fl(run).logic === 'scale', sway: { value: -0.06 }, text: 'Investors still cannot say what the merger is for.' },
          { when: (run) => fl(run).logic === 'network', sway: { value: 0.04 }, text: 'The network logic is easy to explain.' },
        ],
        actions: [
          { id: 'road', name: 'Roadshow with the synergy plan, route by route', cost: 1, sway: { value: 0.09 }, q: 3, desc: 'Show the active funds where every dollar comes from.' },
          { id: 'family', name: 'Private meeting with the Lindahl trustees', cost: 1, sway: { family: 0.1 }, q: 3, desc: 'A family seat on the board and the founder\'s name on the training academy.' },
          { id: 'gov', name: 'Governance package', cost: 1, sway: { governance: 0.12 }, q: 3, desc: 'An independent chair, a clear succession plan and no special rights for either side.', teaches: ['proxy_adviser'] },
          { id: 'solicit', name: 'Hire a proxy solicitor', cost: 1, reveals: true, sway: { retail: 0.04 }, q: 2, desc: 'Learn how each bloc really intends to vote, and get retail holders to return their forms.', teaches: ['shareholder_vote'] },
          { id: 'jobs', name: 'Promise no compulsory redundancies', cost: 1, sway: { jobs: 0.22 }, set: { jobsPledge: true }, effects: { people: 8 }, q: 2, desc: 'Wins the staff vote. Takes a third of the cost savings off the table.', coach: 'A cheap vote today, paid for with synergies for years. Sometimes worth it; know the price.' },
          { id: 'special', name: 'Special dividend if the deal completes', cost: 2, sway: { all: 0.06 }, effects: { spend: 150 }, set: { sweetener: true }, q: 1, desc: 'A $150 million sweetener to everyone.', coach: 'Paying your own shareholders with their own money to vote for something. It works, which says little for it.' },
          { id: 'attack', name: 'Brief against a dissident fund manager', cost: 1, sway: { active: -0.05, retail: 0.03 }, effects: { heat: 12 }, q: 0, desc: 'One fund has said publicly it will vote against. Suggest it is talking its own book.', coach: 'Institutional investors talk to each other. Attack one and you lose three.' },
        ],
        teaches: ['shareholder_vote'],
      },
      {
        id: 'reg', type: 'regulatory', title: 'Slots and monopoly routes', authority: 'The Aviation Competition Board',
        intro: 'The regulator worries about two things, and you cannot see exactly how much. Slots given away are gone for good.',
        concerns: [
          { id: 'hub', name: 'Peak slots at the capital\'s airport', desc: 'Together you would hold over half the peak-hour slots.', severity: [6, 20], shift: (run) => (fl(run).logic === 'network' ? -2 : 0) },
          { id: 'routes', name: 'Nine routes where you are the only two airlines', desc: 'After the merger these would have one carrier.', severity: [2, 12] },
        ],
        remedies: [
          { id: 's12', name: 'Give up 12 peak slot pairs', desc: 'To a low-cost rival chosen by the Board.', cost: 70, fixes: { hub: 10 } },
          { id: 's24', name: 'Give up a further 24 slot pairs', desc: 'Enough to base a competitor at your hub.', cost: 160, fixes: { hub: 12 } },
          { id: 'fare', name: 'Fare cap on the nine routes', desc: 'Fares frozen in real terms for five years.', cost: 40, fixes: { routes: 7 } },
          { id: 'code', name: 'Open your feeder flights to rivals', desc: 'Any airline may sell connections onto your regional network.', cost: 30, fixes: { routes: 6, hub: 2 } },
        ],
        intel: [
          { id: 'econ', name: 'Economists\' study of the hub', desc: 'How will the Board define the market?', days: 14, reveals: ['hub'] },
          { id: 'pre', name: 'Pre-notification meetings', desc: 'Listen to which routes the case team keeps asking about.', days: 10, reveals: ['routes'] },
        ],
        litigate: { p: 0.25, spend: 20 },
        teaches: ['antitrust'], teachesOnEnd: ['remedies'],
      },
      {
        id: 'int', type: 'integration', title: 'One airline, slowly', capacity: 3,
        intro: 'Airline mergers take two years, not a hundred days. You have three units of attention in each phase. The savings are in the network and the fleet; the risk is in the cockpit and the reservation system.',
        phases: ['Day 1', 'Month 6', 'Month 12', 'Month 24'],
        start: (run) => ({ capture: 0, morale: 56 - (fl(run).coCeo ? 8 : 0) + Math.round((run.deal.meters.people - 60) / 5), customers: 80 }),
        initiatives: [
          { id: 'top', name: 'Name one leadership team on Day 1', track: 'people', cost: 1, morale: 8, capture: 4, until: 0, when: (run) => !fl(run).coCeo, q: 3, desc: 'The best of both, chosen before closing, announced at 8 a.m.', teaches: ['integration_100'] },
          { id: 'seniority', name: 'Agree a single pilot seniority list', track: 'people', cost: 2, morale: 14, until: 1, q: 3, desc: 'Months of arbitration. Nothing else in the cockpit works until it is done.', teaches: ['culture'] },
          { id: 'cert', name: 'Single operating certificate', track: 'operations', cost: 1, capture: 14, q: 3, desc: 'One set of manuals, one regulator sign-off.' },
          { id: 'network', name: 'Rebuild the schedule as one network', track: 'synergy', cost: 2, capture: 30, from: 1, requires: ['cert'], q: 3, desc: 'The reason for the deal.' },
          { id: 'bigbang', name: 'Cut over to one reservation system now', track: 'systems', cost: 1, capture: 18, from: 1, until: 1, q: 1, desc: 'One weekend, one switch.', risk: { p: 0.55, text: 'The cut-over fails on a holiday weekend. Forty thousand passengers are stranded and the footage leads the news.', customers: -16, capture: -6 }, coach: 'Every airline that rushed its reservation cut-over has a documentary about it.' },
          { id: 'phased', name: 'Phased reservation cut-over with parallel running', track: 'systems', cost: 2, capture: 18, from: 2, q: 3, desc: 'Slower, dearer, dull.', risk: { p: 0.08, text: 'A minor fare-filing glitch. Nobody outside notices.', customers: -2 } },
          { id: 'loyalty', name: 'Merge the loyalty schemes on generous terms', track: 'customers', cost: 1, customers: 10, capture: 6, from: 1, q: 3, desc: 'Nobody loses status. Best of both tiers.' },
          { id: 'fleet', name: 'Simplify the fleet', track: 'synergy', cost: 1, capture: 16, from: 2, q: 3, desc: 'Retire the two oldest types; one maintenance base per type.' },
          { id: 'hq', name: 'Close the second head office', track: 'synergy', cost: 1, capture: 10, morale: -6, from: 1, when: (run) => !fl(run).dualHq, q: 2, desc: 'Fourteen hundred jobs move or go.' },
          { id: 'cuts', name: 'Announce 4,000 redundancies up front', track: 'synergy', cost: 1, capture: 14, morale: -18, until: 1, when: (run) => !fl(run).jobsPledge, q: 1, desc: 'Take the pain early.', coach: 'Sometimes necessary, but in an airline the people you unsettle are the ones flying the aircraft.' },
          { id: 'livery', name: 'Repaint the fleet in the new livery', track: 'customers', cost: 1, capture: 2, morale: -4, customers: -2, q: 0, desc: 'Three hundred aircraft, $80 million, before anything works as one.', coach: 'Paint is the easy part of a merger, which is why it gets done first and should be done last.' },
          { id: 'mixed', name: 'Mixed crews and joint training', track: 'people', cost: 1, morale: 8, from: 1, requires: ['seniority'], q: 2, desc: 'People stop saying "them" faster when they share a galley.' },
        ],
        events: [
          { id: 'stall0', phase: 0, when: (s, run) => !!fl(run).coCeo, p: 0.9, text: 'Two chief executives, two versions of the Day 1 memo. Staff forward both to the press.', fx: { morale: -6, capture: -4 } },
          { id: 'stall1', phase: 1, when: (s, run) => !!fl(run).coCeo, p: 0.85, text: 'Every decision now needs two signatures and two sets of advisers. The network plan slips a season.', fx: { capture: -10 } },
          { id: 'stall2', phase: 2, when: (s, run) => !!fl(run).coCeo, p: 0.8, text: 'The board finally asks one of the two chief executives to leave. It takes a quarter to recover.', fx: { capture: -6, morale: -4 } },
          { id: 'dual', phase: 2, when: (s, run) => !!fl(run).dualHq, p: 1, text: 'Two head offices: the overhead savings in the plan simply do not arrive.', fx: { capture: -9 } },
          { id: 'pledge', phase: 3, when: (s, run) => !!fl(run).jobsPledge, p: 1, text: 'The no-redundancy promise holds. So do the costs it protected.', fx: { capture: -9, morale: 4 } },
          { id: 'rule', phase: 1, when: (s) => s.morale < 50, p: 0.75, text: 'Pilots work to rule over the seniority dispute. Cancellations run at four percent for a month.', fx: { capture: -8, customers: -9 } },
          { id: 'flee', phase: 2, when: (s) => s.customers < 68, p: 0.7, text: 'Two large corporate accounts move their travel to a rival.', fx: { capture: -6, customers: -4 } },
          { id: 'pride', phase: 3, when: (s) => s.morale >= 66, p: 0.7, good: true, text: 'The combined airline tops the punctuality table for the first time. Crews from both sides claim the credit.', fx: { capture: 6, customers: 4 } },
        ],
        teaches: ['integration_100'], teachesOnEnd: ['culture', 'merger_of_equals'],
      },
    ],

    resolve(run) {
      const f = fl(run), ended = run.deal.ended, bt = bTrue(run);
      const share = f.share || 0.5;
      const fair = A / (A + bt);
      if (ended) {
        const tag = ended === 'failed' ? 'voted_down' : ended === 'blocked' ? 'blocked' : ended === 'walked' ? 'collapsed' : ended;
        const v = S().assemble(run, { price: 45, risk: S().riskBase(run, A) });
        v.overall = Math.min(v.overall, 56); v.grade = S().letter(v.overall); v.stars = v.overall >= 42 ? 1 : 0; v.xp = Math.round(v.overall * 1.4);
        const T = {
          collapsed: ['The dinner ends early', 'You could not agree who would run it, own it or name it. Most mergers of equals die exactly here.'],
          voted_down: ['Your own shareholders said no', 'Two-thirds was the bar and you fell short. The terms you brought back did not convince the people who own the airline.'],
          blocked: ['Grounded by the regulator', 'The Board would not clear the merger on the remedies you offered.'],
        }[tag] || ['No merger', 'The deal did not complete.'];
        v.outcome = { tag, title: T[0], text: T[1], tone: 'bad' };
        v.done = false; v.value = 0;
        v.facts = [['A fair split for Aurora, on true values', U.pct(fair, 1)], ['What Solstice was really worth', U.money(bt, '$ m')]];
        v.headline = { collapsed: 'Aurora and Solstice call off merger talks over "governance"', voted_down: 'Aurora investors reject Solstice merger', blocked: 'Competition Board blocks Aurora-Solstice tie-up' }[tag] || 'Aurora-Solstice merger abandoned';
        return v;
      }
      const g = run.deal.integ ? U.clamp(run.deal.integ.factor / 0.8, 0, 1.1) : 0.8;
      const syn = SYN * run.truth.syn * g;
      const costs = COST + (run.deal.reg ? run.deal.reg.cost : 0) + (f.sweetener ? 0 : 0);
      const combined = A + bt + syn - costs;
      const value = share * combined - A;
      const ratio = value / A;
      const price = 62 + ratio * 300;
      const tag = ratio > 0.06 ? 'triumph' : ratio >= 0 ? 'solid' : ratio > -0.06 ? 'diluted' : 'disaster';
      const v = S().assemble(run, { price, risk: S().riskBase(run, A) - (f.coCeo ? 15 : 0) });
      const T = {
        triumph: ['The fourth giant', 'You got a fair share of a bigger, better airline, settled who was in charge before it mattered, and then actually captured the savings.', 'good'],
        solid: ['A merger that worked', 'Your shareholders own a piece of something worth a little more than what they gave up. For a merger of equals, that is a rare result.', 'good'],
        diluted: ['Bigger, not better off', 'The combined airline exists, but your shareholders\' slice of it is worth less than the airline they had. The split, the remedies or the integration gave too much away.', 'bad'],
        disaster: ['A merger of unequals', 'Your shareholders gave up half their company and got back a share of a quarrel. Students will be assigned this one.', 'bad'],
      }[tag];
      v.outcome = { tag, title: T[0], text: T[1], tone: T[2] };
      v.done = true; v.value = value;
      v.facts = [
        ['Aurora shareholders\' share of the new airline', U.pct(share, 0)],
        ['A fair share on true values', U.pct(fair, 1)],
        ['What Solstice was really worth', U.money(bt, '$ m') + ' (book: ' + U.money(B_BOOK, '$ m') + ')'],
        ['Synergies captured', U.money(syn, '$ m') + ' of a claimed ' + U.money(SYN, '$ m')],
        ['Integration and remedy costs', U.money(costs, '$ m')],
        ['Value created for Aurora shareholders', U.money(value, '$ m')],
      ];
      v.headline = {
        triumph: 'Aurora Solstice posts record margin two years after "merger that worked"',
        solid: 'Combined airline on track as integration completes',
        diluted: 'Aurora holders count the cost of a merger that never quite paid',
        disaster: 'Boardroom feud and IT failures leave merged airline in a tailspin',
      }[tag];
      return v;
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
