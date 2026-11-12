/* The Academy: concept cards unlocked by play. */
(function (root) {
  'use strict';
  const WR = root.WR;
  const C = {};
  const add = (cat, id, name, short, body) => { C[id] = { id, cat, name, short, body }; };

  /* ---------------- Strategy ---------------- */
  add('Strategy', 'stakeholder_map', 'Stakeholder map', 'Every deal has more parties than the buyer and the seller.',
    'Founders, employees, lenders, regulators, customers and the press can each slow or stop a deal. Before the first approach, list who has a say, what each wants, and who can say no. Most failed deals were stopped by someone the buyer had not thought about.');
  add('Strategy', 'approach', 'The first approach', 'How you open decides what you learn.',
    'A founder who does not need to sell is choosing a home for the business, not just a price. A warm, private first conversation earns information and trust; a cold letter or a low anchor earns competition and resentment. Anchoring low works on price only when the other side has no alternative.');
  add('Strategy', 'walkaway', 'Walk-away price', 'Decide the most you will pay before the bidding starts.',
    'The walk-away price is the value of the business to you, less the share of the gains you insist on keeping. Set it in a calm room and write it down. In the heat of a negotiation every extra percent feels small; only a number fixed in advance protects you from yourself.');
  add('Strategy', 'synergy_types', 'Kinds of synergy', 'Cost synergies arrive; revenue synergies are promised.',
    'Cost synergies (one head office, joint purchasing) are within your control and usually come in near the estimate. Revenue synergies (cross-selling, pricing power) depend on customers and competitors, and typically deliver a fraction of the claim, later. Capital synergies sit in between. Credit each kind accordingly when you value a deal.');
  add('Strategy', 'control_premium', 'Control premium', 'Buyers pay above the market price for the right to run the company.',
    'A share price values a small stake with no say. To buy the whole company, bidders pay more, commonly 20 to 40 percent. The premium is only justified by what control lets you change: strategy, costs, capital structure or synergies. If those do not exceed the premium, the seller keeps all the value.');
  add('Strategy', 'winners_curse', 'The winner\'s curse', 'In an auction, the winner is the bidder who most overestimated the value.',
    'Each bidder estimates what the asset is worth. The estimates scatter around the truth, and the highest one wins. So winning is itself evidence that you were too optimistic. The defence is to bid below your estimate, and to be glad when someone else pays more.');
  add('Strategy', 'conglomerate_discount', 'Conglomerate discount', 'A group can trade for less than its businesses are worth apart.',
    'Investors can diversify for themselves, so a company gets no credit for doing it for them. Unrelated businesses under one roof are harder to analyse, compete for capital on politics rather than returns, and carry a head office none of them needs. The gap between the group\'s value and the sum of its parts is the discount.');
  add('Strategy', 'sotp', 'Sum of the parts', 'Value each business as if it stood alone, then add them up.',
    'A sum-of-the-parts valuation applies to each division the multiple its independent peers trade on, then subtracts group debt and head-office costs. If the total is well above the market value, a separation may be worth doing. An honest version also subtracts separation costs, tax and lost shared benefits.');
  add('Strategy', 'merger_of_equals', 'Merger of equals', 'No premium, no buyer, and no one clearly in charge.',
    'Two companies of similar size combine through a share exchange, with shared governance. It avoids paying a premium, but it postpones the question every organisation must answer: who decides? Where that was left vague, mergers of equals have tended to end in a quiet takeover by one side or a noisy divorce.');
  add('Strategy', 'cross_border', 'Cross-border deals', 'Distance hides risk and multiplies misunderstanding.',
    'Foreign acquisitions add layers a domestic deal lacks: unfamiliar labour law and pensions, currency exposure, political review and cultural distance. Buyers who do well use local advisers, keep local management, make public commitments they can honour, and integrate only what creates value.');
  add('Strategy', 'activism', 'Shareholder activism', 'A minority investor campaigns in public to change a company.',
    'Activist funds buy a few percent, publish a critique and seek board seats or strategic change: a break-up, a sale, more cash returned. They succeed by persuading other shareholders, not by owning control. The useful response is to test the argument on its merits; boards that only defend tend to lose the vote.');
  add('Strategy', 'value_creation', 'Sources of buyout value', 'Deleveraging, earnings growth and multiple expansion.',
    'A buyout\'s equity return comes from three places: paying down debt with the company\'s cash, growing profits, and selling at a higher multiple than was paid. Only the first two are controllable. A plan that needs a higher exit multiple to work is a bet on the market, not a plan.');
  add('Strategy', 'buy_and_build', 'Buy and build', 'Buy a platform, bolt on smaller rivals at lower multiples.',
    'Small companies sell for lower multiples than large ones. A buyer who owns a platform can acquire small competitors cheaply and have their earnings valued at the platform\'s higher multiple. It works when the add-ons are truly integrated; otherwise it is only a collection.');

  /* ---------------- Diligence & valuation ---------------- */
  add('Diligence', 'dd_scope', 'Scoping due diligence', 'You cannot look at everything, so choose where to dig.',
    'Time in a data room is limited. Spend it where a surprise would change the price or kill the deal: quality of earnings, the biggest customers, the key people, title to the crucial assets. Going deep in a few areas usually beats skimming all of them.');
  add('Diligence', 'red_flags', 'Red flags', 'Warning signs that the story and the numbers disagree.',
    'Sales that jump at quarter-end, receivables growing faster than revenue, loans to related parties, assets owned by the founder rather than the company, one customer or supplier that dominates. None proves wrongdoing; each is a reason to dig deeper, cut the price or demand protection.');
  add('Diligence', 'key_person', 'Key-person risk', 'Sometimes the value walks out of the door each evening.',
    'If the product, the customer relationships or the know-how sit in a few heads, the buyer must find out who they are and what would keep them. Unvested equity, retention awards and a role worth staying for are cheap next to the cost of losing them.');
  add('Diligence', 'adjusted_ebitda', 'Adjusted EBITDA', 'Profit as the seller would like you to see it.',
    'Sellers add back "one-off" costs and add in savings not yet achieved. Some adjustments are fair; many recur every year. Rebuild the number yourself: a price set as a multiple of an inflated profit is inflated by the same multiple.');
  add('Diligence', 'vendor_dd', 'Vendor due diligence', 'A report on the business, paid for by the seller.',
    'In an auction the seller commissions accountants to write a diligence report for all bidders. It saves time and is usually accurate about what it covers. Read it for what it leaves out, and do your own work on the areas that matter most.');
  add('Diligence', 'pension_liability', 'Pension liabilities', 'A debt to employees that moves with interest rates and lifespans.',
    'Defined-benefit pension promises are long-term debts. Their size depends on assumptions about discount rates, inflation and longevity, and small changes move the figure a great deal. In some countries pensions are paid from the company\'s own cash with no fund behind them. Value them on your own assumptions and treat the deficit as debt.');
  add('Diligence', 'liquidation_value', 'Liquidation value', 'What the pieces would fetch if the business stopped.',
    'For a distressed company, the value of its assets sold separately sets the floor: creditors will not accept less from a bidder than they would get from an auctioneer. The gap between liquidation value and going-concern value is what a rescue plan creates, and what bidder and creditors bargain over.');
  add('Diligence', 'fairness_opinion', 'Independent valuation', 'Advice is only as good as the adviser\'s incentives.',
    'Boards facing a bid obtain an independent view of value, often a formal fairness opinion. Its worth depends on how the adviser is paid: a bank that earns a success fee only if a deal happens, or only if it is defeated, has a view before it opens the spreadsheet.');

  /* ---------------- Negotiation ---------------- */
  add('Negotiation', 'logrolling', 'Trading across issues', 'Give what is cheap for you and dear to them.',
    'A negotiation over price alone is a tug of war. Add issues (structure, roles, timing, guarantees) and the parties usually value them differently. Concede where it costs you little and matters to them, and ask in return for what matters to you. Both sides can then do better than any split of the price.');
  add('Negotiation', 'batna', 'Your best alternative', 'Your power comes from what you will do if there is no deal.',
    'The best alternative to a negotiated agreement sets the worst deal you should accept. The other side has one too. Improve yours, find out theirs, and do not mistake a wish for an alternative.');
  add('Negotiation', 'earnout', 'Earn-outs', 'Part of the price is paid later, if the business performs.',
    'When buyer and seller disagree about the future, an earn-out lets the seller be paid for results that actually arrive. It bridges valuation gaps and keeps a founder engaged. It also creates arguments about who controlled the results, so the measures must be simple and hard to manipulate.');
  add('Negotiation', 'break_fee', 'Break fees', 'What one side pays the other if it walks away.',
    'A break fee compensates the target if the buyer fails to close; a reverse fee can apply the other way. Fees protect against wasted cost and signal commitment. Set too high, they deter better offers, which is why courts and regulators cap them in many markets.');
  add('Negotiation', 'spa_protection', 'Contract protection', 'Warranties, indemnities, escrow and insurance.',
    'The sale agreement turns diligence findings into protection. Warranties are the seller\'s statements about the business; indemnities cover specific known risks; an escrow holds back part of the price; warranty insurance pays where the seller will not. A finding that is neither priced nor protected has been wasted.');
  add('Negotiation', 'golden_parachute', 'Golden parachutes', 'Payments to executives when control changes.',
    'Change-of-control payments are meant to stop managers resisting a good offer for fear of losing their jobs. Negotiated in the middle of a bid, by the people who will receive them, they become a conflict of interest: every concession won for the executive is one not won for shareholders.');
  add('Negotiation', 'standstill', 'Standstill agreements', 'A truce with terms.',
    'In a standstill an investor agrees not to buy more shares, launch a bid or run a proxy contest for a period, usually in exchange for board seats or information. It turns a public fight into a private working relationship, for a while.');

  /* ---------------- Hostile bids and defence ---------------- */
  add('Hostile bids', 'hostile_bid', 'Hostile takeover', 'An offer made to shareholders over the board\'s objection.',
    'When a board refuses to talk, a bidder can appeal directly to the owners. Hostile bids come without a data room, cost more, and leave scars inside the company that is won. They succeed when shareholders trust the bidder\'s price more than the board\'s promises.');
  add('Hostile bids', 'toehold', 'Toehold', 'A small stake bought quietly before the bid.',
    'Shares bought below the disclosure threshold lower the bidder\'s average cost, give it votes, and pay a profit if a rival wins. Buy too many, too fast, and the filing tells the market what is coming.');
  add('Hostile bids', 'bear_hug', 'Bear hug', 'A generous public offer that the board must answer.',
    'A bear hug letter offers a full price and invites negotiation, in public. Directors who reject it must explain to their own shareholders why. It pressures the board while the bidder still looks reasonable.');
  add('Hostile bids', 'tender_offer', 'Tender offer', 'A public offer to buy shares directly from their holders.',
    'A tender or open offer invites shareholders to sell at a stated price by a deadline, usually conditional on reaching a minimum level of acceptances. It bypasses the board but is tightly regulated on timing, disclosure and equal treatment.');
  add('Hostile bids', 'proxy_fight', 'Proxy fight', 'A contest for shareholder votes to change the board.',
    'Rather than buy the company, a bidder or activist can try to replace its directors by soliciting shareholders\' votes. Whoever persuades the large institutions, and the advisers they follow, wins. It is cheaper than a bid and slower than a letter.');
  add('Hostile bids', 'poison_pill', 'Poison pill', 'A rights plan that makes an unapproved bid ruinously expensive.',
    'If a bidder crosses a set shareholding without board approval, every other holder may buy new shares at a deep discount, diluting the bidder. A pill forces a bidder to negotiate with the board and buys time. Used to block a fair offer indefinitely, it protects managers rather than owners.');
  add('Hostile bids', 'white_knight', 'White knight', 'A friendlier buyer invited to top a hostile bid.',
    'A target that cannot stay independent may seek a preferred acquirer. Shareholders gain from the higher price. The company is still sold, so a white knight is the right defence only when a sale is the right outcome.');
  add('Hostile bids', 'white_squire', 'White squire', 'A friendly investor who takes a blocking stake.',
    'Instead of selling the whole company, a target places a sizeable minority stake with an investor who will support the board. It can stop a bid without a change of control, at the price of diluting, and annoying, existing shareholders.');
  add('Hostile bids', 'just_say_no', 'The "just say no" defence', 'Refuse, and argue that the company is worth more.',
    'A board may simply reject an offer and make the case for independent value with forecasts and results. It works when the argument is true and the board is believed. The test comes afterwards: the promises made in the defence must be delivered.');
  add('Hostile bids', 'crown_jewel', 'Crown-jewel defence', 'Sell the asset the bidder wants most.',
    'A target disposes of its most attractive business to make itself less desirable. It can end a bid, and it usually leaves shareholders owning something worth less than the offer they were denied. Many jurisdictions restrict it once a bid is under way.');
  add('Hostile bids', 'pac_man', 'Pac-Man defence', 'Bid for the company that is bidding for you.',
    'The target launches a counter-offer for its pursuer. It is rare, expensive, and usually financed with debt that weakens the survivor whichever side wins.');
  add('Hostile bids', 'leveraged_recap', 'Leveraged recapitalisation', 'Borrow heavily and hand the cash to shareholders.',
    'A company takes on debt to fund a large buyback or special dividend, giving owners cash that rivals a bid and leaving less for a bidder to borrow against. The cash is real; so is the debt, which remains long after the bidder has left.');
  add('Hostile bids', 'cash_vs_stock', 'Cash or shares', 'What you pay with says what you believe.',
    'Cash is certain for the seller and leaves all the risk and reward with the buyer. Paying in shares splits both with the seller, and signals that the buyer may think its own shares are fully priced. In a contested bid, fully financed cash is the strongest currency.');

  /* ---------------- Finance and structure ---------------- */
  add('Finance', 'lbo_basics', 'How a buyout works', 'Buy a company mostly with debt that the company itself repays.',
    'A private-equity fund puts in a minority of the price as equity and borrows the rest against the target\'s cash flows. As the debt is paid down and profits grow, the equity\'s share of the value rises. The fund sells after a few years. Stable cash flows are what make it possible.');
  add('Finance', 'leverage', 'Leverage', 'Debt magnifies returns in both directions.',
    'With more debt, a given rise in the company\'s value produces a larger percentage gain on a smaller equity cheque. A given fall produces a larger loss, and interest must be paid in bad years as well as good. The right amount of debt is what the business can service in a downturn, not in the plan.');
  add('Finance', 'covenant', 'Debt covenants', 'Promises to lenders that act as tripwires.',
    'Loan agreements require the borrower to keep ratios such as interest cover or debt to earnings within limits. A breach hands control to the lenders: they can demand repayment, raise the rate or take the equity. Headroom against covenants is the real measure of how safe a structure is.');
  add('Finance', 'exit_multiple', 'Exit multiple', 'The price at which you assume you can sell.',
    'A buyout model must assume a sale price, usually a multiple of profit in the final year. Assuming a higher multiple than was paid makes any deal look good. Prudent investors assume the same or lower, and let the return come from the business.');
  add('Finance', 'mgmt_equity', 'Management equity', 'Make the managers owners.',
    'Buyout funds ask managers to invest alongside them and grant further shares on favourable terms that vest over time. A team with its own money at risk manages cash and cost differently. It is the most reliable lever in private equity and the cheapest.');
  add('Finance', 'carve_out', 'Carve-outs', 'Buying a division that has never stood alone.',
    'A business unit sold by its parent has no separate accounts, systems, contracts or head office. Its reported profit omits costs the parent absorbed. The buyer must estimate true stand-alone costs, plan the separation, and rely on the seller for services until it is done.');
  add('Finance', 'tsa', 'Transitional services', 'The seller keeps the lights on while you rewire.',
    'Under a transitional services agreement the former parent goes on providing IT, payroll, treasury and the like for a fixed period at an agreed price. Too short and the business stumbles; too long and nobody finishes the separation.');
  add('Finance', 'exchange_ratio', 'Exchange ratio', 'How many shares of the new company each side receives.',
    'In a share-for-share merger the ratio decides how the combined company, and its synergies, are divided. It should reflect relative value: earnings, assets and liabilities each side brings. Every flaw you find in the other side\'s numbers is an argument for a better ratio.');
  add('Finance', 'fx_risk', 'Currency risk', 'A fixed price in someone else\'s money.',
    'Between signing and closing a cross-border deal, the buyer owes a fixed foreign-currency amount. A move in the exchange rate can add several percent to the price. Hedge with instruments that lapse if the deal fails, and borrow in the currency the target earns in.');
  add('Finance', 'spin_off', 'Spin-offs', 'Hand a business to your own shareholders as a separate company.',
    'In a spin-off, shareholders receive shares in a newly listed company carved out of the parent. No buyer is needed and, structured correctly, no tax is triggered. Each business gets its own management, capital and investors. It works when the two really are better apart.');
  add('Finance', 'stranded_costs', 'Stranded costs', 'Overheads left behind when a business leaves.',
    'A head office, IT estate and shared services sized for the whole group do not shrink by themselves when part of it is sold or spun off. Unless they are cut, the remaining company carries costs built for something larger, and the gain from separation leaks away.');
  add('Finance', 'haircut', 'Haircuts', 'The share of a debt that creditors agree to lose.',
    'When a company cannot pay, creditors accept less than they are owed. The size of the haircut depends on what the business is worth alive against dead. Timing and form matter as much as the total: cash now, deferred payments and equity are worth different amounts to different lenders.');

  /* ---------------- Regulation and governance ---------------- */
  add('Regulation', 'antitrust', 'Merger control', 'Competition authorities can block or reshape a deal.',
    'Regulators review mergers that may reduce competition, looking at overlaps market by market. They can clear, block or clear with conditions. A buyer should assess the risk before bidding, since the price is agreed long before the answer is known.');
  add('Regulation', 'remedies', 'Remedies', 'What you give up to get approval.',
    'To resolve concerns, merging parties offer divestments (selling overlapping businesses) or behavioural commitments (price caps, access promises). Authorities prefer clean divestments. Offer too little and you lose months; offer too much and you give away value you paid for.');
  add('Regulation', 'fdi_review', 'Foreign-investment screening', 'Governments vet foreign buyers of sensitive businesses.',
    'Many countries review acquisitions by foreign owners in defence, technology, infrastructure and data. The test is security and public interest, and the process is political as well as legal. Ring-fencing, local governance and public commitments are the usual price of approval.');
  add('Regulation', 'works_council', 'Works councils', 'Employees with legal rights to be consulted.',
    'In much of continental Europe, elected employee bodies must be informed and consulted on restructuring, and in some countries workers hold seats on the supervisory board. Agreements on sites and jobs bind a new owner. A buyer who treats this as a formality learns otherwise.');
  add('Governance', 'fiduciary_duty', 'The board\'s duty', 'Directors act for the shareholders, not for themselves or for independence.',
    'Faced with an offer, a board must judge whether it is better for the owners than the alternatives, including staying independent. It may resist an offer that undervalues the company. It may not resist merely to keep control. The valuation, honestly done, decides which is which.');
  add('Governance', 'shareholder_vote', 'Winning a vote', 'Count the register bloc by bloc.',
    'Large deals and contested elections are decided by shareholders. Index funds, active managers, hedge funds, families, employees and retail holders care about different things and vote in different ways. A campaign is a matter of knowing each bloc\'s concern and answering it.');
  add('Governance', 'proxy_adviser', 'Proxy advisers', 'Firms whose recommendations move many votes at once.',
    'Many institutions follow, or weigh heavily, the voting recommendations of a few advisory firms. Their view of a merger or a board slate can swing a tenth or more of the register. Both sides of a contest therefore present to them as if to a large shareholder.');
  add('Governance', 'social_issues', 'Social issues', 'Who leads, who chairs, whose name, which city.',
    'In mergers the questions of chief executive, board seats, company name and headquarters are called social issues. They carry no value in the model and decide whether the deal happens and whether it works. Compromises that avoid choosing, such as co-chief executives, tend to move the fight to after closing.');
  add('Governance', 'board_refresh', 'Board refreshment', 'Change the board before someone changes it for you.',
    'Long-serving directors without relevant experience are an activist\'s easiest target. Appointing credible independent directors of your own choosing answers the charge and takes away the reason to elect theirs.');

  /* ---------------- Integration ---------------- */
  add('Integration', 'integration_100', 'The first hundred days', 'Value is captured, or lost, straight after closing.',
    'Announce the leadership and the plan on day one, secure the key people and customers in the first weeks, and start the main synergies while there is momentum. Uncertainty is the enemy: each week without answers costs people and accounts.');
  add('Integration', 'culture', 'Culture', 'The way things are done is part of what you bought.',
    'Two organisations decide, reward and communicate differently. Ignoring that drives out the people who carry the value. Protect what makes the acquired business good, be explicit about what must change, and bring people from both sides into the decisions.');
  add('Integration', 'light_touch', 'Light-touch integration', 'Sometimes the best integration is very little.',
    'When you buy a business for its brand, craft or culture, absorbing it destroys the reason for buying. Keep its management and identity, connect only where there is clear gain (distribution, purchasing, capital), and exchange people rather than impose processes.');

  /* ---------------- Auctions ---------------- */
  add('Strategy', 'auction_process', 'The sale process', 'A banker-run auction is designed to extract the highest price.',
    'The seller\'s bank invites many bidders, gives limited information, shortlists on indicative bids, then asks for binding offers by a deadline. Competition and time pressure work for the seller. Your defences are better analysis, a firm walk-away and the willingness to lose.');

  /* ---------------- Distress ---------------- */
  add('Distress', 'distress', 'Distressed deals', 'Buying from creditors rather than owners.',
    'When a company cannot pay its debts, control passes in substance to its lenders. A buyer deals with people minimising a loss under legal deadlines and public scrutiny. Prices can be low, information is poor, and the turnaround is the whole of the value.');
  add('Distress', 'creditor_committee', 'Creditors\' committee', 'The lenders decide by vote.',
    'In insolvency a committee of financial creditors, voting by the size of their claims, chooses among rescue plans. Banks, funds and bondholders want different things: cash now, total recovery, certainty, cover against later criticism. A plan must assemble the required majority among them.');
  add('Distress', 'resolution_plan', 'Resolution plan', 'An offer to take over an insolvent company as a going concern.',
    'A bidder proposes what creditors will be paid, when, and in what form, and how the business will be revived. If the committee and the tribunal approve, the bidder takes the company and the old debts are settled on the plan\'s terms.');
  add('Distress', 'clean_slate', 'The clean slate', 'An approved plan extinguishes old claims.',
    'A buyer under an approved insolvency plan generally takes the company free of past liabilities not provided for in the plan, and the law may bar the former owners who caused the default from bidding. The plan must be drafted to keep the licences and leases the business needs.');
  add('Distress', 'loan_to_own', 'Loan to own', 'Buy the debt to get the company.',
    'An investor buys a distressed company\'s loans at a discount, intending to convert them into ownership through the restructuring. The position brings information, a vote and a recovery if someone else wins. It also ties up capital and creates a conflict with other creditors.');
  add('Distress', 'turnaround', 'Turnaround', 'Stabilise first, then fix, then grow.',
    'A rescue begins with cash and trust: pay the workforce, restore supplier credit, make the plant safe. Only then restart capacity and win back customers. Deep cuts before the business is running, or expansion before it is profitable, repeat the mistakes that caused the failure.');

  WR.data.concepts = C;
  WR.data.conceptCats = ['Strategy', 'Diligence', 'Negotiation', 'Hostile bids', 'Finance', 'Regulation', 'Governance', 'Integration', 'Distress'];
})(typeof window !== 'undefined' ? window : globalThis);
