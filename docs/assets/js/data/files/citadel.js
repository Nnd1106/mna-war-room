/* Deal File 4: CITADEL. A takeover defence from the target's chair. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const U = WR.util;
  const S = () => WR.sim.score;
  const OFFER = 5200;
  const V = (run) => run.truth.V;
  const settled = (run) => !!(run.deal.battle && run.deal.battle.tag === 'settled');
  const independent = (run) => !!(run.deal.battle && !run.deal.battle.tag && !run.deal.battle.bidderWins);

  WR.data.files.citadel = {
    id: 'citadel', n: 4, code: 'CITADEL', title: 'The Unwelcome Letter', type: 'Takeover defence',
    seat: 'Chief Executive, Lumen Devices', difficulty: 3, unit: '$ m', image: 'citadel.jpg',
    tagline: 'A rival has offered your shareholders a 30 percent premium for the company you run. Your job is not to keep your job.',
    learn: ['What a board owes its shareholders', 'Every takeover defence, and what each one costs', 'When "no" is right and when it is entrenchment', 'Negotiating a price from the defending side', 'White knights and white squires'],
    truth(rng) {
      return { V: rng.range(4300, 6300), noise: rng.range(-0.04, 0.04) };
    },
    stages: [
      {
        id: 'brief', type: 'brief', title: 'Friday, 6.40 p.m.',
        text: [
          'The letter arrives by courier as the office empties. <b>Arcturus Holdings</b>, a serial acquirer twice your size, proposes to buy every share of Lumen Devices for $5.2 billion in cash: 30 percent above this afternoon\'s closing price. It will make the letter public on Monday morning.',
          'You have run Lumen for six years. It makes the sensors inside half the world\'s insulin pumps, it has a new product two years from launch, and its share price has gone sideways while you invested in it. You believe the market undervalues the company. So does every chief executive who has ever received a letter like this.',
          'Here is the uncomfortable part. The directors do not work for you, and you do not work for Lumen\'s independence. You both work for the shareholders. If $5.2 billion is more than Lumen is really worth on its own, the right answer is to get the best price and sell. If it is less, the right answer is to fight. You do not know for certain which it is.',
        ],
        cast: [
          { name: 'Victor Lang', role: 'Chief Executive, Arcturus Holdings', line: 'We would prefer to do this with you. We are prepared to do it without you.' },
          { name: 'Dame Eleanor Voss', role: 'Your chair', line: 'I need to know what we are worth. Not what we hope we are worth.' },
        ],
        teaches: ['fiduciary_duty', 'hostile_bid'],
      },
      {
        id: 'first', type: 'decision', title: 'The first forty-eight hours',
        prompt: 'The letter goes public on Monday. What do you do this weekend?',
        options: [
          { id: 'board', label: 'Convene the full board with independent advisers, and say only that the offer is being considered', q: 3, effects: { board: 6, days: 2 }, set: { process: true },
            outcome: 'The board meets on Sunday with its own lawyers and a bank that has no other business with you. Monday\'s statement is three sentences long. Shareholders note that nobody panicked.',
            coach: 'A proper process protects the directors legally and keeps every option open, including the option to say yes.' },
          { id: 'reject', label: 'Reject the offer within the hour as "derisory"', q: 1, effects: { street: -6, heat: 6 }, set: { hasty: true },
            outcome: 'The rejection reaches the wires before most directors have read the letter. Two large shareholders call the chair to ask how the board valued the company in forty minutes.',
            coach: 'A reflex "no" looks like a chief executive defending a job. It costs credibility you will need later, even if "no" turns out to be right.' },
          { id: 'leak', label: 'Leak that Arcturus plans to shut your research centre', q: 0, effects: { heat: 14, people: 4, board: -8 }, set: { leaked: true },
            outcome: 'The story runs on Sunday. Arcturus denies it by lunchtime and publishes its letter early. Your chair asks who spoke to the newspaper.',
            coach: 'Fighting dirty before the board has even met hands the moral high ground to the bidder.' },
        ],
      },
      {
        id: 'worth', type: 'decision', title: 'What are we worth?',
        prompt: 'The whole defence turns on one number: what Lumen is worth if it stays independent. Who works it out?',
        options: [
          { id: 'indep', label: 'Commission a valuation from a bank paid a flat fee, whatever the outcome', q: 3, effects: { spend: 6, board: 4, days: 6 }, set: { valued: true },
            outcome: (run) => 'The bank works for a week and reports to the board without you in the room. Its central estimate of Lumen\'s stand-alone value is ' + U.money(Math.round(V(run) * (1 + run.truth.noise) / 10) * 10, '$ m') + ', give or take five percent. The offer on the table is ' + U.money(OFFER, '$ m') + '.',
            coach: 'An adviser whose fee does not depend on the answer is the only one whose answer you can use.', teaches: ['fairness_opinion'] },
          { id: 'house', label: 'Ask your long-standing house bank, which earns its fee if the bid is defeated', q: 1, effects: { days: 4 }, set: { flattered: true },
            outcome: (run) => 'Your house bank reports in three days. It values Lumen at ' + U.money(Math.round(V(run) * 1.14 / 10) * 10, '$ m') + ' and calls the offer "wholly inadequate". It would say that: its success fee is paid only if Arcturus goes away.',
            coach: 'Look at how an adviser is paid before you look at its number.' },
          { id: 'gut', label: 'No need. Nobody knows this company better than you do', q: 0, effects: { board: -6 },
            outcome: 'You tell the board the company is worth "at least seven billion". Asked for the working, you describe the product pipeline with great feeling.',
            coach: 'Managers are systematically optimistic about their own plans. That is why boards ask someone else.' },
        ],
      },
      {
        id: 'fight', type: 'battle', title: 'The defence', side: 'defend', rounds: 5, threshold: 50, chest: 100, price: OFFER,
        support0: (run) => 42 + (run.deal.flags.hasty ? 3 : 0) + (run.deal.flags.leaked ? 2 : 0) - (run.deal.flags.process ? 2 : 0),
        intro: (run) => 'Arcturus needs acceptances from half the shares. Each week it makes a move and you play one card. The bar shows the share of your register leaning its way.' +
          (run.deal.flags.valued ? ' Keep the independent valuation in mind: if the offer climbs past it, the honest move is to negotiate.' : ' You are fighting without a valuation you can trust.'),
        cards: [
          { id: 'doc', name: 'Defence document', type: 'investors', cost: 10, support: [-7, -4], desc: 'Seventy pages on the pipeline, the margins to come and why the offer undervalues them.', counters: ['roadshow'],
            q: (run, st) => (V(run) > st.price ? 3 : 1), coach: 'The classic defence is an argument about value. It works when it is true.', teaches: ['just_say_no'] },
          { id: 'forecast', name: 'Bring forward results and raise guidance', type: 'investors', cost: 0, support: [-6, -3], desc: 'Publish numbers you can stand behind for the next two years.', counters: ['raise1'],
            q: (run, st) => (V(run) > st.price ? 3 : 1), coach: 'Hard numbers beat adjectives, but you will be held to them.' },
          { id: 'staff', name: 'Rally customers and employees', type: 'pr', cost: 0, support: [-4, -2], effects: { people: 6 }, desc: 'Letters from pump makers and clinicians; a town hall on the research campus.', counters: ['paygate'],
            q: 2, coach: 'Useful background noise. Shareholders decide, and they decide on price.' },
          { id: 'squire', name: 'Place 9% with a friendly long-term investor', type: 'board', cost: 20, support: [-8, -5], effects: { street: -3 }, desc: 'A "white squire": a pension fund buys new shares and promises to back the board.', counters: ['tender'],
            q: (run, st) => (V(run) > st.price ? 2 : 1), coach: 'A white squire blocks the bidder without selling the company, but issuing shares to a friend mid-bid annoys everyone else on the register.', teaches: ['white_squire'] },
          { id: 'buyback', name: 'Borrow to fund a large buyback', type: 'price', cost: 30, support: [-7, -4], set: { levered: true }, desc: 'Return $600 million now, financed with new debt.',
            q: (run, st) => (V(run) > st.price ? 2 : 0), coach: 'A leveraged recapitalisation gives shareholders cash today, but the debt stays with the company long after the bidder has gone.', teaches: ['leveraged_recap'] },
          { id: 'pill', name: 'Adopt a shareholder rights plan', type: 'legal', cost: 5, support: [-9, -6], effects: { heat: 8, street: -4 }, desc: 'A poison pill: if Arcturus passes 15 percent, every other holder may buy shares at half price.', counters: ['tender', 'proxy'],
            q: (run, st) => (V(run) > st.price * 1.05 ? 2 : 0), coach: 'A pill buys time to find a better outcome. Used to block a fair offer for ever, it is entrenchment, and courts and investors treat it that way.', teaches: ['poison_pill'] },
          { id: 'court', name: 'Complain to the regulator about their disclosures', type: 'legal', cost: 15, support: [-4, -1], desc: 'Their offer document is vague about financing. Make them spell it out.', counters: ['proxy'], q: 1, coach: 'Litigation delays; it rarely decides.' },
          { id: 'jewel', name: 'Sell the sensor patents to a friendly licensee', type: 'board', cost: 0, support: [-6, -3], effects: { heat: 10, street: -8 }, set: { crownSold: true }, desc: 'Without the patents, Arcturus has no reason to buy. Nor has anyone else.',
            q: 0, coach: 'A crown-jewel defence destroys the thing you are defending. Shareholders are left with a company worth less than the offer they were denied.', teaches: ['crown_jewel'] },
          { id: 'pacman', name: 'Launch a counter-bid for Arcturus', type: 'board', cost: 50, support: [-2, 4], effects: { heat: 16, board: -8 }, set: { pacman: true }, desc: 'The "Pac-Man" defence: eat the company that is trying to eat you.',
            q: 0, coach: 'Bidding for a company twice your size, with borrowed money, to avoid being bought: this is theatre, and expensive theatre.', teaches: ['pac_man'] },
          { id: 'knight', name: 'Bring in a white knight', type: 'exit', cost: 30, ends: 'knight', from: 3, desc: 'Meridian Health, a company you respect, will top the offer by seven percent and keep the research centre.',
            q: (run, st) => (V(run) < st.price * 1.07 ? 3.4 : 0), coach: 'A white knight still means selling. It is the right move when the company is worth less alone than a friendlier buyer will pay.', teaches: ['white_knight'] },
          { id: 'talk', name: 'Open talks with Arcturus', type: 'exit', cost: 0, ends: 'settled', from: 2, desc: 'Tell Victor Lang that at the right price the board will recommend his offer. Then find out what the right price is.',
            q: (run, st) => (V(run) < st.price ? (st.round >= 4 ? 3.6 : 2.4) : 0), coach: 'Once the offer is above what you are worth alone, your duty is to get the last dollar, not to win the fight.' },
        ],
        enemy: [
          { id: 'roadshow', name: 'Investor roadshow', tell: 'Victor Lang\'s jet has filed flight plans for Boston, London and Edinburgh.', desc: 'Arcturus meets your twenty largest holders with one slide: your share price for the last five years.', support: [4, 7], weight: 3 },
          { id: 'raise1', name: 'A raised offer', tell: 'Arcturus has asked its lenders for a larger facility.', desc: 'Arcturus raises its offer by five percent and calls it "full and fair".', support: [6, 10], bump: 0.05, minRound: 2, weight: 3 },
          { id: 'raise2', name: 'A "final" offer', tell: 'Arcturus\'s board is meeting on a Sunday.', desc: 'Another four percent, declared final. Under the takeover rules it now cannot raise again.', support: [6, 9], bump: 0.04, minRound: 4, weight: 3, requires: (run, st) => st.enemyUsed.includes('raise1') },
          { id: 'tender', name: 'Tender offer direct to shareholders', tell: 'A printing firm is running overnight shifts on an offer document.', desc: 'The offer goes straight to shareholders with a 21-day clock.', support: [4, 8], weight: 2 },
          { id: 'proxy', name: 'A slate of new directors', tell: 'A headhunter has been calling retired medical-device executives.', desc: 'Arcturus requisitions a meeting to replace your board with nominees who will "let shareholders decide".', support: [4, 7], minRound: 2, weight: 2 },
          { id: 'paygate', name: 'The pay story', tell: 'A journalist has asked for your remuneration reports going back six years.', desc: 'A Sunday newspaper sets your pay against the flat share price, with a chart.', support: [2, 5], weight: 2 },
        ],
        teaches: ['just_say_no'], teachesOnEnd: ['fiduciary_duty'],
      },
      {
        id: 'terms', type: 'negotiation', title: 'Naming the price', rounds: 4, probes: 2, threshold: 58, when: settled,
        intro: 'Victor Lang is across the table at last. Four issues are open. He will not say which matter most to him. One of them is about you personally: watch what you trade for it.',
        counterpart: { name: 'Victor Lang', role: 'Chief Executive, Arcturus Holdings' },
        youWeights: { price: 3, site: 1.5, fee: 1, you: 0.5 },
        issues: [
          { id: 'price', name: 'A final increase', desc: 'On top of the offer now on the table', options: [
            { id: 'u0', label: 'No increase', you: 5, them: 100, set: { uplift: 0 } }, { id: 'u1', label: '+3%', you: 45, them: 72, set: { uplift: 0.03 } },
            { id: 'u2', label: '+6%', you: 78, them: 40, set: { uplift: 0.06 } }, { id: 'u3', label: '+9%', you: 100, them: 10, set: { uplift: 0.09 } }] },
          { id: 'site', name: 'The research centre', desc: 'Nine hundred scientists in one town', options: [
            { id: 'c0', label: 'No commitment', you: 10, them: 100 }, { id: 'c1', label: 'Kept open for three years', you: 75, them: 60, effects: { people: 6 } },
            { id: 'c2', label: 'Kept for five years with a funding floor', you: 100, them: 20, effects: { people: 10 } }] },
          { id: 'fee', name: 'Break fee if Arcturus walks or is blocked', desc: 'What they owe Lumen if the deal fails on their side', options: [
            { id: 'f0', label: 'None', you: 10, them: 100 }, { id: 'f1', label: '2% of the price', you: 70, them: 60 }, { id: 'f2', label: '4% of the price', you: 100, them: 25 }] },
          { id: 'you', name: 'Your own position', desc: 'What happens to the chief executive', options: [
            { id: 'y0', label: 'You leave on your contract terms', you: 70, them: 60 }, { id: 'y1', label: 'A two-year role running the division', you: 60, them: 80 },
            { id: 'y2', label: 'An enhanced exit package, triple the contract', you: 40, them: 100, effects: { board: -10, street: -6 }, set: { parachute: true } }] },
        ],
        profiles: [
          { id: 'price', weights: { price: 3, site: 1, fee: 1.5, you: 1 }, tell: 'He was at his financing limit. Every point of price hurt; he would have given a great deal on the research centre and the break fee instead.' },
          { id: 'freehand', weights: { site: 3, price: 1.5, fee: 1, you: 1 }, tell: 'His plan depended on moving research to his own campus. He would have paid more to avoid any commitment on the site.' },
          { id: 'certainty', weights: { fee: 3, price: 2, site: 1, you: 0.5 }, tell: 'His lenders had forbidden a large break fee. On price he had more room than he let on.' },
        ],
        teaches: ['break_fee'], teachesOnEnd: ['golden_parachute', 'logrolling'],
      },
      {
        id: 'after', type: 'decision', title: 'The morning after', when: independent,
        prompt: 'Arcturus has lapsed its offer. The share price has fallen back, and the shareholders who backed you want to see what they were promised.',
        options: [
          { id: 'deliver', label: 'Publish milestones for the new product and tie your own pay to them', q: 3, effects: { street: 6, board: 4 }, set: { plan: 'deliver' },
            outcome: 'You put dates and numbers on everything you said during the defence, and stake your bonus on them. The first two milestones are met on time.',
            coach: 'A successful defence is a promise. The value only exists if you now deliver what you said the bidder was missing.' },
          { id: 'relax', label: 'Thank everyone and get back to normal', q: 0, effects: { street: -8 }, set: { plan: 'drift' },
            outcome: 'Within a year the forecasts made in the heat of the defence have quietly slipped. An activist fund starts buying shares.',
            coach: 'Boards that defeat a bid and then drift are the ones that get a second, less polite, visitor.' },
          { id: 'sale', label: 'Invite other buyers to a quiet auction, now that the company is "in play"', q: 1, effects: { street: 2, people: -6 }, set: { plan: 'shop' },
            outcome: 'You spent two months arguing the company should not be sold, and now you are selling it. Two parties look; neither bids above Arcturus\'s lapsed offer.',
            coach: 'If a sale was the right answer, the time to run an auction was while a bidder was at the table.' },
        ],
      },
    ],

    resolve(run) {
      const b = run.deal.battle, f = run.deal.flags, v0 = V(run);
      const finalOffer = b ? b.price : OFFER;
      const planFx = f.plan === 'deliver' ? 0.04 : f.plan === 'drift' ? -0.07 : f.plan === 'shop' ? -0.03 : 0;
      const alone = v0 * (1 + planFx - (f.crownSold ? 0.1 : 0) - (f.pacman ? 0.06 : 0) - (f.levered ? 0.02 : 0));
      let got, tag;
      if (b && b.tag === 'knight') { got = finalOffer * 1.07; tag = got >= v0 * 0.98 ? 'sold_well' : 'sold_cheap'; }
      else if (b && b.tag === 'settled') {
        const n = run.deal.nego && run.deal.nego.terms;
        if (n && n.agreed) { got = finalOffer * (1 + (f.uplift || 0)); tag = got >= v0 * 0.98 ? 'sold_well' : 'sold_cheap'; }
        else { got = finalOffer; tag = 'lost'; }
      } else if (b && b.bidderWins) { got = finalOffer; tag = 'lost'; }
      else { got = alone; tag = alone >= finalOffer * 0.98 ? 'independent_right' : 'entrenched'; }
      const bench = Math.max(v0, finalOffer);
      let price = 72 + (got / bench - 1) * 260;
      if (tag === 'lost') price = Math.min(price, 52);
      let risk = 88 - Math.max(0, run.deal.meters.heat - 50) * 0.7 - (f.crownSold ? 25 : 0) - (f.pacman ? 25 : 0) - (f.levered ? 8 : 0) - (f.parachute ? 15 : 0);
      const v = S().assemble(run, { price, risk });
      const T = {
        independent_right: ['Independent, and right to be', 'The offer was below what Lumen is worth on its own, you said so, you proved it, and your shareholders are better off for having held on.', 'good'],
        entrenched: ['You saved the company from its shareholders', 'You won the fight and kept your office. But the offer you defeated was worth more than the company is alone. This is what entrenchment means.', 'bad'],
        sold_well: ['Sold, at the right price', 'Lumen was worth less alone than a buyer would pay, so you stopped defending and started negotiating. Your shareholders got more than the company was worth to them, and that was the job.', 'good'],
        sold_cheap: ['Sold too cheaply', 'You agreed a sale at a price below what Lumen was worth on its own. The buyer\'s shareholders will thank you; yours should not.', 'bad'],
        lost: ['Overrun', 'Arcturus won over your head. Your shareholders took its price without a board recommendation, without a final negotiation, and without you.', 'bad'],
      }[tag];
      v.outcome = { tag, title: T[0], text: T[1], tone: T[2] };
      v.done = true; v.value = got - OFFER;
      v.facts = [
        ['Arcturus\'s opening offer', U.money(OFFER, '$ m')],
        ['Its final offer', U.money(finalOffer, '$ m')],
        ['What Lumen was truly worth alone', U.money(v0, '$ m')],
        ['What your shareholders ended up with', U.money(got, '$ m')],
        ['Against the better of the two alternatives', U.pct(got / bench - 1, 1)],
      ];
      v.headline = {
        independent_right: 'Lumen vindicated: shares pass lapsed Arcturus offer as new sensor launches',
        entrenched: 'A year on, Lumen shares languish far below the bid its board refused',
        sold_well: (b && b.tag === 'knight' ? 'Meridian Health' : 'Arcturus') + ' wins Lumen with sweetened, board-backed offer',
        sold_cheap: 'Lumen board criticised for recommending "knock-down" price',
        lost: 'Arcturus takes Lumen over the heads of its board',
      }[tag];
      return v;
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
