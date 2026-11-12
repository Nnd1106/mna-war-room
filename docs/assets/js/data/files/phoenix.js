/* Deal File 9: PHOENIX. A bid for a company in insolvency. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const S = () => WR.sim.score;
  const fl = (run) => run.deal.flags;

  WR.data.files.phoenix = {
    id: 'phoenix', n: 9, code: 'PHOENIX', title: 'Cold Furnaces', type: 'Distressed acquisition',
    seat: 'Managing Director, Garuda Metals', difficulty: 3, unit: '₹ cr', image: 'phoenix.jpg',
    tagline: 'A steel plant in insolvency, lenders owed four times what it is worth, and a committee of creditors that votes on your plan. The sellers here are the people who lost money.',
    learn: ['How an insolvency sale differs from every other deal', 'Liquidation value as the floor', 'Designing a plan creditors will vote for', 'Haircuts, upfront cash and upside sharing', 'A turnaround in eighteen months'],
    stages: [
      {
        id: 'brief', type: 'brief', title: 'The plant at Vindhyanagar',
        text: [
          '<b>Vindhya Steel</b> built a three-million-tonne plant on borrowed money at the top of the cycle. Steel prices fell, the promoter family moved cash to places the auditors are still finding, and the company stopped paying its banks two years ago. One blast furnace is cold. Eleven thousand people have not been paid in full since the monsoon.',
          'The company is now in insolvency. A court-appointed resolution professional runs it, and a committee of its lenders will choose its future. They are owed ₹14,000 crore. Sold for scrap and land, the plant would fetch about ₹3,200 crore. Anyone who offers the lenders more than that, in a plan two-thirds of them will vote for, gets the company free of its old debts.',
          'You run Garuda Metals, a profitable mid-sized steelmaker with no blast furnace of its own. You are not buying from a willing seller. You are buying from creditors who will lose most of their money whatever happens, and want to lose as little as possible, as soon as possible, with as little blame as possible.',
        ],
        cast: [
          { name: 'R. Subramanian', role: 'Chief General Manager, lead lender', line: 'My bank has already written this loan down to nothing. What I need is a number I can defend to my vigilance department.' },
          { name: 'Kavita Deshmukh', role: 'Resolution professional', line: 'I have a statutory deadline, a cold furnace and four hundred claims. Please be brief.' },
        ],
        teaches: ['distress', 'creditor_committee'],
      },
      {
        id: 'route', type: 'decision', title: 'The way in',
        prompt: 'There is more than one way to end up owning a company in insolvency. Which do you take?',
        options: [
          { id: 'plan', label: 'Submit a resolution plan for the whole company as a going concern', q: 3, effects: { days: 10 },
            outcome: 'You register as a resolution applicant and receive the information memorandum. One other applicant has done the same: Carbon Ridge, a distressed-debt fund.',
            coach: 'A plan for the going concern keeps the licences, the workforce and the customers together, and gives you the company clean of its old liabilities.', teaches: ['resolution_plan'] },
          { id: 'debt', label: 'First buy a foreign bank\'s loans at a deep discount, then bid as a creditor', q: 2, effects: { days: 20, spend: 90 }, set: { debtHolder: true },
            outcome: 'A foreign bank sells you its ₹1,400 crore of loans for 42 paise in the rupee. You now have a vote on the committee that will judge your own plan, and the other lenders know it.',
            coach: 'Loan-to-own gives you a seat and information, and a recovery if you lose. It also ties up cash and makes the other lenders wonder whose side you are on.', teaches: ['loan_to_own'] },
          { id: 'wait', label: 'Wait for the process to fail and buy the plant cheaply in liquidation', q: 0, effects: { days: 60 },
            outcome: 'You stay out and wait for the deadline to pass.',
            roll: { p: 0.3, win: { text: 'The committee cannot agree and extends the deadline. You are allowed in late, on stiffer terms and with the lenders wary of you.', set: { late: true }, effects: { board: -4 } }, lose: { text: 'Carbon Ridge\'s plan is approved by 71 percent while you wait. You read about it in the newspaper.', end: 'lost', news: 'Lenders approve Carbon Ridge plan for Vindhya Steel' } },
            coach: 'Liquidation sells cold assets without licences or people, and only happens if every plan fails. Waiting for it is a bet that no one else will turn up.' },
        ],
      },
      {
        id: 'dd', type: 'diligence', title: 'The virtual data room', days: 8,
        intro: 'The information memorandum was assembled by people who arrived after the damage was done. The plant is half idle and the records are worse. Eight analyst-days; each level deeper in a workstream costs one day more.',
        streams: [
          { id: 'ops', name: 'Plant', desc: 'Furnaces, mills, maintenance backlog' },
          { id: 'leg', name: 'Licences and claims', desc: 'Mining leases, utilities, environmental orders' },
          { id: 'fin', name: 'Forensic accounts', desc: 'Related parties, diverted funds, receivables' },
          { id: 'com', name: 'Customers and people', desc: 'Approvals, order book, wage arrears' },
        ],
        issues: [
          { id: 'reline', stream: 'ops', depth: 1, kind: 'flag', p: 0.7, impact: -150, chip: 0, title: 'Furnace 2 needs a full reline', text: 'The cold furnace was shut down badly. Restarting it means a complete reline, not the patch repair in the memorandum.', teaches: ['turnaround'] },
          { id: 'env', stream: 'ops', depth: 2, kind: 'flag', p: 0.5, impact: -200, chip: 0, title: 'Slag dump clean-up order', text: 'The pollution board has ordered the removal of two decades of slag. The order attaches to the site, not to the old owner.', teaches: ['red_flags'] },
          { id: 'mine', stream: 'leg', depth: 2, kind: 'flag', p: 0.5, impact: -220, chip: 0, title: 'The iron-ore lease lapses on a change of control', text: 'The captive mine that makes the plant competitive must be re-auctioned if ownership changes, unless the plan is drafted to keep it.', teaches: ['clean_slate'] },
          { id: 'power', stream: 'leg', depth: 1, kind: 'flag', p: 0.45, impact: -90, chip: 0, title: 'Electricity arrears and a disconnection notice', text: 'The state utility is owed ₹90 crore and classes itself as an essential supplier that must be paid in full.' },
          { id: 'divert', stream: 'fin', depth: 3, kind: 'gem', p: 0.45, impact: 160, title: 'Diverted funds that can be clawed back', text: 'The forensic audit traces ₹400 crore to companies controlled by the promoter. A good part is recoverable for the new owner.' },
          { id: 'orders', stream: 'com', depth: 2, kind: 'gem', p: 0.5, impact: 120, title: 'Approvals are intact', text: 'Railway and automotive customers have kept Vindhya on their approved lists and would order again within a quarter.' },
          { id: 'wages', stream: 'com', depth: 1, kind: 'flag', p: 0.6, impact: -80, chip: 0, title: 'Wage and provident-fund arrears', text: 'Workers\' dues rank ahead of the banks and must be paid in full on day one.' },
        ],
        coachPlan: ['ops', 'ops', 'leg', 'leg', 'com'],
        teaches: ['dd_scope'], teachesOnClose: ['liquidation_value'],
      },
      {
        id: 'price', type: 'pricing', title: 'What is a cold steel plant worth?', ddStage: 'dd',
        intro: 'There are no synergies here in the usual sense, only the turnaround: what the plant could earn if it were run properly and fed with ore. Decide how much of that you believe, and where you stop.',
        market: 3200, standalone: { mid: 3600, noise: 0.05 }, cap: 6, integrationCost: 500, share: 0.55,
        synergies: [
          { id: 'restart', name: 'Restart furnace 2 and run the plant full', kind: 'cost', runRate: 150, range: [0.5, 1.0], coach: 0.7 },
          { id: 'ore', name: 'Captive ore and your own coke supply', kind: 'cost', runRate: 80, range: [0.4, 1.0], coach: 0.65 },
          { id: 'mix', name: 'Shift output to higher-value flat products', kind: 'revenue', runRate: 60, range: [0.2, 0.8], coach: 0.4 },
          { id: 'energy', name: 'Renegotiated power and freight', kind: 'cost', runRate: 40, range: [0.7, 1.1], coach: 0.85 },
        ],
        teaches: ['liquidation_value'], teachesOnLock: ['walkaway'],
      },
      {
        id: 'plan', type: 'negotiation', title: 'Drafting the plan with the lead bank', rounds: 5, probes: 2, failEnd: 'collapsed',
        threshold: (run) => 60 + (fl(run).late ? 5 : 0) - (fl(run).debtHolder ? 2 : 0),
        intro: 'A plan is not just a price. It is how much, how soon, in what form, and what happens to everyone else. The lead bank will carry about half the committee with it. Mr Subramanian will not tell you what his board most needs.',
        counterpart: { name: 'R. Subramanian', role: 'Chief General Manager, lead lender' },
        youWeights: { price: 3, upfront: 1.5, upside: 1.5, workers: 0.5, time: 1 },
        issues: [
          { id: 'price', name: 'Total value of the plan', desc: 'What the lenders receive for ₹14,000 crore of claims', options: [
            { id: 'p1', label: '₹3,700 crore (a 74% haircut)', you: 100, them: 10, price: 3700 }, { id: 'p2', label: '₹4,000 crore (71%)', you: 74, them: 45, price: 4000 },
            { id: 'p3', label: '₹4,300 crore (69%)', you: 44, them: 76, price: 4300, set: { richPlan: true } }, { id: 'p4', label: '₹4,600 crore (67%)', you: 10, them: 100, price: 4600, set: { richPlan: true } }] },
          { id: 'upfront', name: 'Cash on day one', desc: 'The rest is paid over four years', options: [
            { id: 'u1', label: '30 percent upfront', you: 100, them: 10, set: { upfront: 1 } }, { id: 'u2', label: '55 percent upfront', you: 70, them: 60, set: { upfront: 2 } }, { id: 'u3', label: '85 percent upfront', you: 30, them: 100, set: { upfront: 3 } }] },
          { id: 'upside', name: 'A share of the recovery', desc: 'Equity in the revived company for the lenders', options: [
            { id: 'e0', label: 'None', you: 100, them: 30 }, { id: 'e1', label: 'Lenders keep 10 percent of the equity', you: 70, them: 70, set: { lenderEq: 1 } }, { id: 'e2', label: 'Lenders keep 20 percent', you: 35, them: 100, set: { lenderEq: 2 } }] },
          { id: 'workers', name: 'Workers and small suppliers', desc: 'People with no vote on the committee', options: [
            { id: 'w0', label: 'The legal minimum', you: 100, them: 40, effects: { people: -8 } }, { id: 'w1', label: 'Wages in full, small suppliers at 50 percent', you: 80, them: 80, effects: { people: 8 }, set: { fairPlan: true } }] },
          { id: 'time', name: 'Implementation', desc: 'How quickly the money moves after approval', options: [
            { id: 't1', label: 'Within 30 days, backed by a bank guarantee', you: 60, them: 100, set: { certain: true } }, { id: 't2', label: 'Within 90 days, subject to the mining lease transferring', you: 100, them: 35 }] },
        ],
        profiles: [
          { id: 'cash', weights: { upfront: 3.5, time: 2, price: 1.5, upside: 0.5, workers: 0.5 }, tell: 'His bank needed cash this financial year. Money on day one, with a guarantee, was worth more to him than a higher headline paid over four years.' },
          { id: 'headline', weights: { price: 3.5, upside: 2, upfront: 1, time: 1, workers: 0.5 }, tell: 'He had to defend the haircut in public. The total, and a share of any recovery, mattered more than when it arrived.' },
          { id: 'cover', weights: { time: 2.5, workers: 2.5, price: 2, upfront: 1.5, upside: 1 }, tell: 'What he feared was an inquiry in five years. A plan that was certain, quick and fair to the workers was one nobody would question.' },
        ],
        teaches: ['haircut', 'resolution_plan'], teachesOnEnd: ['logrolling'],
      },
      {
        id: 'coc', type: 'vote', title: 'The committee of creditors', threshold: 66, want: 'pass', time: 4, noise: 0.08, failEnd: 'failed',
        question: 'The committee approves Garuda\'s resolution plan by 66 percent of voting share',
        intro: 'Votes are weighted by debt. Carbon Ridge has filed a rival plan with less money and more of it upfront. You have four weeks. The leanings are the resolution professional\'s informal count, and may be wrong.',
        blocs: [
          { id: 'psu', name: 'Public-sector bank consortium', pct: 44, lean: 0.58, desc: 'Follow the lead bank, mostly. Each has its own credit committee.', cares: ['upfront', 'cover'] },
          { id: 'arc', name: 'Kite Asset Reconstruction', pct: 18, lean: 0.42, block: true, desc: 'Bought its loans at a discount and wants the highest total recovery.', cares: ['recovery'] },
          { id: 'bonds', name: 'Bondholders\' trustee', pct: 14, lean: 0.5, desc: 'Thousands of small holders, one trustee, a great deal of caution.', cares: ['recovery', 'cover'] },
          { id: 'nbfc', name: 'Two non-bank lenders', pct: 12, lean: 0.48, block: true, desc: 'Short of liquidity themselves.', cares: ['upfront'] },
          { id: 'foreign', name: 'Foreign bank', pct: 12, lean: 0.55, block: true, desc: 'Wants out, cleanly.', cares: ['certainty'] },
        ],
        mods: [
          { when: (run) => fl(run).upfront === 3, sway: { upfront: 0.16 }, text: 'Your plan pays most of the money on day one.' },
          { when: (run) => fl(run).upfront === 1, sway: { upfront: -0.16 }, text: 'Only 30 percent upfront. Carbon Ridge is offering cash.' },
          { when: (run) => !!fl(run).richPlan, sway: { recovery: 0.14 }, text: 'Your total is clearly higher than the rival plan.' },
          { when: (run) => !fl(run).richPlan, sway: { recovery: -0.08 }, text: 'Your total barely beats the rival plan.' },
          { when: (run) => !!fl(run).lenderEq, sway: { recovery: 0.08 }, text: 'Lenders share in the recovery through their equity stake.' },
          { when: (run) => !!fl(run).certain, sway: { certainty: 0.2, cover: 0.05 }, text: 'A bank guarantee and a 30-day timetable.' },
          { when: (run) => !!fl(run).fairPlan, sway: { cover: 0.06 }, text: 'Nobody will be asked later why the workers were not paid.' },
          { when: (run) => !!fl(run).debtHolder, sway: { foreign: 0.5, recovery: -0.05 }, text: 'You hold the foreign bank\'s old loans and vote them yourself. Others note the conflict.' },
          { when: (run) => !!fl(run).late, sway: { all: -0.06 }, text: 'You came in late. The committee remembers.' },
        ],
        actions: [
          { id: 'present', name: 'Present the turnaround plan with your own plant managers', cost: 1, sway: { all: 0.05, cover: 0.04 }, q: 3, desc: 'Lenders have heard promises before. Show them people who have run a furnace.' },
          { id: 'guarantee', name: 'Parent guarantee on the deferred payments', cost: 1, sway: { certainty: 0.12, recovery: 0.08, cover: 0.06 }, q: 3, desc: 'Garuda\'s own balance sheet stands behind every instalment.', teaches: ['creditor_committee'] },
          { id: 'count', name: 'Ask the resolution professional for a real count', cost: 1, reveals: true, sway: {}, q: 2, desc: 'Find out how each lender actually intends to vote.' },
          { id: 'sweeten', name: 'Move ₹300 crore from deferred to upfront', cost: 1, sway: { upfront: 0.14 }, set: { sweetened: true }, q: 2, desc: 'Same total, more of it now.', coach: 'Changing the shape of an offer is cheaper than raising it. Find out who needs it before you pay for it.' },
          { id: 'kite', name: 'Buy Kite\'s loans at a small premium', cost: 2, sway: { arc: 0.4 }, effects: { spend: 60 }, set: { boughtKite: true }, q: 2, desc: 'Take the hardest vote off the table by owning it.' },
          { id: 'challenge', name: 'Challenge Carbon Ridge\'s eligibility', cost: 1, sway: { all: 0.03 }, effects: { heat: 10 }, q: 1, desc: 'One of its investors is said to be related to the old promoter.', coach: 'Legitimate if true, but it adds months and invites a counter-challenge.' },
          { id: 'scare', name: 'Brief the press that liquidation is imminent', cost: 1, sway: { bonds: 0.05, psu: -0.06 }, effects: { heat: 14 }, q: 0, desc: 'Frighten the small holders into line.', coach: 'Public-sector bankers answer to investigators. A press campaign makes them slower and more cautious, not quicker.' },
        ],
        teaches: ['creditor_committee'], teachesOnEnd: ['haircut'],
      },
      {
        id: 'tribunal', type: 'decision', title: 'The promoter returns',
        prompt: 'The committee has approved your plan. A week before the tribunal hearing, the former promoter files an objection and offers the lenders ₹150 crore more than you did, to keep his company.',
        options: [
          { id: 'hold', label: 'Hold your plan. The committee has voted and the law bars defaulting promoters from bidding', q: 3, effects: { days: 60 },
            outcome: 'The tribunal hears three days of argument and upholds the committee\'s decision. An appeal is dismissed two months later.',
            coach: 'Tribunals defer to the commercial judgment of the creditors, and a promoter who caused the default is not an eligible bidder. Patience is free; panic is not.', teaches: ['clean_slate'] },
          { id: 'match', label: 'Raise your plan by ₹150 crore to close the argument', q: 1, effects: { days: 20, board: -4 }, set: { topup: true },
            outcome: 'The lenders accept the extra money gratefully. You have paid ₹150 crore to answer a bid that was never allowed.',
            coach: 'You bid against someone who was not in the auction.' },
          { id: 'side', label: 'Offer the promoter a minority stake and a seat to withdraw', q: 0, effects: { heat: 14, days: 30 },
            outcome: 'Your lawyers draft a side agreement.',
            roll: { p: 0.35, win: { text: 'He withdraws. You now have as a partner the man who emptied the company.', set: { promoterIn: true }, effects: { people: -8 } }, lose: { text: 'The agreement reaches the tribunal, which finds the plan tainted by a back-door arrangement with an ineligible person and sets it aside.', end: 'blocked', news: 'Tribunal throws out Garuda plan over promoter side deal' } },
            coach: 'A side deal with an ineligible promoter puts the whole plan at risk and brings back the problem the process was meant to remove.' },
        ],
      },
      {
        id: 'int', type: 'integration', title: 'Relighting the furnace', capacity: 3,
        gauges: { capture: 'Turnaround progress', morale: 'Workforce', customers: 'Customers and suppliers' },
        intro: 'You own a plant where nobody has been paid properly for a year and suppliers deliver only against cash. A turnaround is won in the first weeks, on small things. Three units of attention per phase.',
        phases: ['Week 1', 'Month 3', 'Month 9', 'Month 18'],
        start: (run) => ({ capture: 0, morale: 42 + (fl(run).fairPlan ? 8 : 0) - (fl(run).promoterIn ? 8 : 0), customers: 58 }),
        initiatives: [
          { id: 'wages', name: 'Pay every rupee of wage arrears in week one', track: 'people', cost: 1, morale: 16, until: 0, q: 3, desc: 'In person, at the gate, before any speech about the future.', teaches: ['turnaround'] },
          { id: 'vendors', name: 'Settle the critical suppliers and restore credit', track: 'supply', cost: 1, customers: 14, capture: 8, until: 1, q: 3, desc: 'Coal, refractories, spares. Nothing runs on cash-and-carry.' },
          { id: 'safety', name: 'Shut down for a week and fix what is dangerous', track: 'people', cost: 1, morale: 8, capture: 4, until: 1, q: 2, desc: 'A year without maintenance money leaves marks.' },
          { id: 'cut', name: 'Lay off thirty percent of the workforce now', track: 'costs', cost: 1, capture: 12, morale: -22, until: 1, q: 0, desc: 'The plant is overmanned; everyone knows it.', risk: { p: 0.6, text: 'A six-week strike. The furnace you had just relit is banked again.', capture: -14, customers: -6 }, coach: 'The headcount may be too high, but a restart needs every experienced hand. Cut after the plant is running, with attrition and a fair scheme.' },
          { id: 'furnace', name: 'Reline and relight furnace 2', track: 'operations', cost: 2, capture: 28, from: 1, requires: ['vendors'], q: 3, desc: 'Half the plant\'s capacity, cold for two years.' },
          { id: 'ore', name: 'Secure the ore: lease, linkage and your own coke', track: 'supply', cost: 1, capture: 18, from: 1, q: 3, desc: 'A steel plant without cheap ore is a very large ornament.' },
          { id: 'energy', name: 'Renegotiate power and rail freight', track: 'costs', cost: 1, capture: 12, q: 3, desc: 'The utility would rather have a paying customer than a claim.' },
          { id: 'claw', name: 'Pursue the diverted funds', track: 'legal', cost: 1, capture: 10, from: 1, when: (run) => !!(run.deal.dd && run.deal.dd.found.includes('divert')), q: 3, desc: 'The forensic trail you found in diligence.' },
          { id: 'mix', name: 'Win back railway and automotive orders', track: 'customers', cost: 2, capture: 18, customers: 8, from: 2, q: 3, desc: 'Higher-value steel, once quality is steady.' },
          { id: 'vrs', name: 'A voluntary retirement scheme', track: 'costs', cost: 1, capture: 8, morale: -3, from: 2, q: 2, desc: 'Fair terms, no compulsion, once the plant is running.' },
          { id: 'expand', name: 'Announce a new five-million-tonne expansion', track: 'operations', cost: 2, capture: 3, q: 0, desc: 'Show the market your ambition.', coach: 'The last owner went bankrupt building capacity. Fix what is there first.' },
        ],
        events: [
          { id: 'gherao', phase: 0, when: (s) => !s.done.includes('wages'), p: 0.9, text: 'Workers surround the administration block. Your first week is spent negotiating your own way out of the building.', fx: { morale: -12, capture: -4 } },
          { id: 'supply', phase: 1, when: (s) => s.customers < 64, p: 0.8, text: 'The coal supplier stops deliveries until old bills are paid. The one working furnace runs at half blast.', fx: { capture: -10 } },
          { id: 'strike', phase: 2, when: (s) => s.morale < 44, p: 0.7, text: 'A wildcat strike in the rolling mill.', fx: { capture: -8, customers: -5 } },
          { id: 'first', phase: 3, when: (s) => s.capture >= 65, p: 0.8, good: true, text: 'The plant makes its first monthly profit in four years. Somebody paints the date on the furnace wall.', fx: { capture: 6, morale: 6 } },
        ],
        teaches: ['turnaround'], teachesOnEnd: ['distress'],
      },
    ],

    resolve(run) {
      return S().buyVerdict(run, {
        pricing: 'price',
        ask: () => 4300,
        extraCost: (r) => {
          const f = fl(r);
          return (f.sweetened ? 40 : 0) + (f.boughtKite ? 60 : 0) + (f.topup ? 150 : 0) + (f.lenderEq ? 130 * f.lenderEq : 0) + (f.upfront === 3 ? 60 : f.upfront === 1 ? -60 : 0) + (f.debtHolder ? -120 : 0) + (f.promoterIn ? 200 : 0);
        },
        texts: {
          triumph: ['Out of the ashes', 'You bought a broken plant for less than it is worth running, gave the creditors more than scrap value, and relit the furnace. Everyone who mattered came out better than the alternative.'],
          failed: ['The committee votes no', 'Your plan fell short of 66 percent. The lenders chose the rival plan, or no plan at all.'],
          blocked: ['Struck down', 'The tribunal set your plan aside. The side deal with the promoter was the one thing the process could not tolerate.'],
          collapsed: ['No plan', 'You and the lead bank could not agree on terms worth putting to a vote.'],
          lost_right: ['Beaten to it, luckily', 'Another bidder took Vindhya at a price that would not have worked for you.'],
          lost_wrong: ['Beaten to it', 'While you waited, someone else took a plant that would have been worth owning.'],
        },
        headline: (tag) => ({
          triumph: 'Vindhya Steel posts first profit under Garuda; furnace 2 back at full blast',
          solid: 'Garuda completes Vindhya takeover; lenders recover more than liquidation value',
          overpaid: 'Garuda\'s Vindhya bet looks expensive as turnaround costs climb',
          disaster: 'Garuda writes down Vindhya as revival stalls',
          failed: 'Lenders reject Garuda plan for Vindhya Steel',
          blocked: 'Tribunal sets aside Garuda\'s Vindhya plan',
          collapsed: 'Garuda withdraws from Vindhya Steel process',
          walked_right: 'Garuda walks away from Vindhya Steel',
          walked_wrong: 'Garuda walks away from Vindhya Steel',
        }[tag] || 'Vindhya Steel goes to rival bidder'),
      });
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
