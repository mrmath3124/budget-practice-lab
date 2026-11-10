/* Budget Practice Lab - guided walkthrough, scenario challenges, scorecard. */
(function () {
  'use strict';
  const B = window.BPL;
  const esc = (s) => B.esc(s);
  const money = (v) => B.money(v);
  const base0 = B.compute(B.defaultInputs());
  const BASE = {
    rv: (l, c) => base0.rv(l, c || 'y3'), av: (l, c) => base0.av(l, c || 'y3')
  };
  const instr = (M) => M.av(3200) + M.av(10300);

  /* ===================== GUIDED WALKTHROUGH ===================== */
  function setupGuided(inp) {
    inp.enr['13_0'] = 0; inp.enr['13_1'] = 0;
    inp.semi.count = 0; inp.semi.projected = 0;
    inp.es.D1 = 0;
    inp.recap[14] = { y3: 0 };
    inp.app[71180] = { y3: 0 };
    inp.hc.B1 = 0;
    inp.app[29100] = { y3: 0 };
    inp.app[84000] = { y3: 0 };
    inp.rev[300] = { y3: 0 };
    inp.rev[100] = { y3: 0 };
  }
  const visited = (id) => (S) => !!(S.guided.visited && S.guided.visited[id]);
  const neededLevy = (M) => M.av(84060) - (M.rv(720) - M.rv(100));
  const guidedSteps = [
    { screen: 'revenues', title: 'Find your way around Revenues',
      text: () => `This is the <b>Revenues</b> screen (Budget &gt; Revenues). Each line has a <b>Sum To Line</b>: line 100 sums to 114, 114 to 370, 370 to 720 (the General Fund total), and 720 to 1000. Green amounts are entered by the district; black ones are totals or come from another screen. Line 100 (the tax levy) is blank right now &mdash; we will fill it in last.`,
      check: visited('revenues') },
    { screen: 'enrollment', title: 'Enter enrollment',
      text: () => `On the <b>Enrollment</b> screen, find line 7 (Grades 9-12). Enter <b>612</b> in column A (on roll full time) and <b>34</b> in column B (shared time). Watch column H: shared-time students count as one half, so H = 612 + 17 = 629. The subtotal on line 9 and the enrollment used for the Administrative Cost Limit update too.`,
      check: (S, M) => M.calc.enr.byLine['7'].v[0] === 612 && M.calc.enr.byLine['7'].v[1] === 34 },
    { screen: 'semi', title: 'Budget SEMI revenue',
      text: () => `Open <b>Budget &gt; SEMI</b>. Enter the student count <b>238</b> and projected SEMI reimbursement <b>38,920</b>. The district must budget at least 90%, so <b>35,028</b> is sent automatically to Revenue line 540 (Medicaid Reimbursement).`,
      check: (S, M) => M.rv(540) === 35028 },
    { screen: 'excesssurplus', title: 'Record excess surplus from the audit',
      text: () => `Open <b>Budget &gt; Appropriation of Excess Surplus</b>. On line D1 enter the excess surplus from the June 30, 2025 audit: <b>1,114,111</b>. Now check the scorecard &mdash; a fatal edit appears, because excess surplus must be budgeted as revenue in the next year.`,
      check: (S, M) => M.calc.es.D1 === 1114111 },
    { screen: 'recap', title: 'Budget the excess surplus on the Recap',
      text: () => `Open <b>Budget &gt; Recap of Balances</b>. In the Restricted - Legal Reserve section, enter <b>1,114,111</b> in the 2026-27 column of line 14 (Less - Budgeted Excess Surplus). The reserve's ending balance drops to $0, the fatal edit clears, and the amount flows to Revenue line 580 (Budgeted Fund Balance).`,
      check: (S, M) => M.recap[14].y3 === 1114111 },
    { screen: 'appropriations', title: 'Enter health benefits',
      text: () => `Open <b>Budget &gt; Appropriations</b>. Type <b>71180</b> in "Click to Show Row" and press Enter to jump to Health Benefits (Unallocated Benefits). Enter <b>9,056,346</b> in 2026-27. It rolls up 71180 &rarr; 71240 &rarr; 71260 &rarr; 72140 &rarr; 72260 &rarr; 84060 (General Fund Grand Total).`,
      check: (S, M) => M.av(71180) === 9056346 },
    { screen: 'healthcare', title: 'Calculate the health care cap adjustment',
      text: () => `Open <b>Calculations &gt; Health Care Costs</b>. Line A1 already shows the 9,056,346 you just entered. On line B1 enter the 2025-26 <i>original</i> health benefits budget: <b>7,896,696</b>. Line G becomes <b>999,196</b> &mdash; the most the levy can rise above 2% because of health costs. It feeds the Tax Levy Cap, line B.`,
      check: (S, M) => M.calc.hc.G === 999196 },
    { screen: 'appropriations', title: 'Enter two tuition lines',
      text: () => `Back on <b>Appropriations</b>: jump to line <b>29100</b> (Tuition to Private Schools for the Disabled) and enter <b>3,963,590</b>. Then jump to line <b>84000</b> (Transfer of Funds to Charter Schools) and enter <b>1,910,722</b>. Look at how 29100 rolls into 29180 and 72140.`,
      check: (S, M) => M.av(29100) === 3963590 && M.av(84000) === 1910722 },
    { screen: 'revenues', title: 'Enter miscellaneous revenue',
      text: () => `On <b>Revenues</b>, enter <b>130,000</b> on line 300 (Unrestricted Miscellaneous Revenues). It rolls into line 370 and 720.`,
      check: (S, M) => M.rv(300) === 130000 },
    { screen: 'taxlevycap', title: 'Check the levy limits',
      text: (S, M) => `Open <b>Calculations &gt; Tax Levy Cap Calculation</b>. Line A (from the Prebudget Year Levy screen) is last year's levy plus 2%; line B is your health care adjustment. The cap (line I) is <b>${money(M.calc.cap.I)}</b>. Also look at <b>SFRA Calculations &gt; Minimum Tax Levy</b>: the levy cannot be below <b>${money(M.calc.min.D)}</b>.<br><br>To balance the General Fund, the levy must cover what other revenues do not: appropriations ${money(M.av(84060))} minus other revenues ${money(M.rv(720) - M.rv(100))} = <b>${money(neededLevy(M))}</b>.`,
      check: visited('taxlevycap') },
    { screen: 'revenues', title: 'Set the tax levy',
      text: (S, M) => `On <b>Revenues</b> enter the levy on line 100: <b>${money(neededLevy(M))}</b>. Revenue line 720 should now equal Appropriation line 84060, and total revenues (line 1000) equal total appropriations (line 90000).`,
      check: (S, M) => M.rv(100) > 0 && M.rv(720) === M.av(84060) },
    { screen: 'editreport', title: 'Run the Edit Report',
      text: (S, M) => `Open <b>Edit Report</b>. There should be <b>no fatal edits</b>. Read the warnings: they are the same kinds of warnings the real district received (for example, unassigned fund balance below 2% and the tuition supporting schedule).`,
      check: (S, M) => visited('editreport')(S) && fatalCount(M) === 0 },
    { screen: 'taxrate', title: 'See the tax impact',
      text: (S, M) => `Open <b>Tax Levy Certification &gt; A4F</b> and then <b>Estimated Tax Rate Information</b>. The municipality bills on a calendar year, so half of each school-year levy lands in each calendar year. The estimated general fund rate is <b>${M.calc.rate.gfRate}</b> per $100 of assessed value.`,
      check: visited('taxrate') },
    { screen: 'county', title: 'Ask for county approval',
      text: () => `Open <b>County Review and Approval</b> and press <b>Request County Approval</b>. If every fatal check is green, your budget is approved for advertising. Then open the <b>Results page</b> (yellow bar) to print or save your work.`,
      check: (S, M) => !!S.guided.approveTried && fatalCount(M) === 0 }
  ];
  function guidedStatus(S, M) {
    S.guided.done = S.guided.done || {};
    guidedSteps.forEach((st, i) => { if (st.check(S, M)) S.guided.done[i] = true; else if (st.check.length > 1) delete S.guided.done[i]; });
    let cur = guidedSteps.findIndex((st, i) => !S.guided.done[i]);
    if (cur < 0) cur = guidedSteps.length;
    S.guided.step = cur;
    return cur;
  }

  /* ===================== SCENARIOS ===================== */
  const R = B.round;
  const scenarios = [
    { id: 'aidcut', title: 'State Aid Cut', level: 'Beginner',
      brief: 'The final state aid notice cuts Equalization Aid by 5%. Rebuild a balanced budget without using banked cap and while protecting classroom instruction.',
      setup(inp) { inp.locked.rev[460] = { y3: R(23353589 * 0.95) }; },
      story: () => `State aid notices arrived: <b>Equalization Aid (Revenue line 460) drops 5%</b>, from ${money(23353589)} to ${money(R(23353589 * 0.95))} &mdash; a loss of ${money(23353589 - R(23353589 * 0.95))}. State aid lines are locked; you cannot change them. Rebalance the General Fund.`,
      goals: [
        { text: 'No fatal edits on the Edit Report', test: (M) => fatalCount(M) === 0, screen: 'editreport' },
        { text: 'Tax levy is within the cap', test: (M) => M.rv(100) <= M.calc.cap.I, screen: 'taxlevycap' },
        { text: 'No banked cap is used', test: (M) => M.calc.cap.H === 0, screen: 'taxlevycap' },
        { text: 'Regular + special education instruction (lines 3200 + 10300) cut by no more than 2%', test: (M) => instr(M) >= 0.98 * instr(base0), detail: (M) => `${money(instr(M))} (minimum ${money(Math.ceil(0.98 * instr(base0)))})`, screen: 'appropriations' }
      ] },
    { id: 'health', title: 'Health Benefits Spike', level: 'Intermediate',
      brief: 'State Health Benefits Program rates jump 12%. Budget the higher premiums, use the health care cap adjustment, and close the remaining gap.',
      setup(inp) { inp.hc.E = 14.0; },
      story: () => `The State Health Benefits Program announced premium increases. Your broker estimates 2026-27 health benefits (Appropriation line 71180) must be at least <b>${money(R(9056346 * 1.12))}</b> (12% more than the adopted budget). The average SHBP increase on the Health Care Costs screen is now 14.0%.`,
      goals: [
        { text: 'Health benefits (line 71180) budgeted at the new estimate or higher', test: (M) => M.av(71180) >= R(9056346 * 1.12), detail: (M) => `${money(M.av(71180))} (need ${money(R(9056346 * 1.12))})`, screen: 'appropriations' },
        { text: 'No fatal edits on the Edit Report', test: (M) => fatalCount(M) === 0, screen: 'editreport' },
        { text: 'Banked cap used is $100,000 or less', test: (M) => M.calc.cap.H <= 100000, screen: 'taxlevycap' },
        { text: 'Unassigned fund balance at 6/30/27 (Recap line 8) is not reduced', test: (M) => M.recap[8].y3 >= base0.recap[8].y3, screen: 'recap' }
      ] },
    { id: 'enrollment', title: 'Enrollment Growth', level: 'Intermediate',
      brief: 'New housing brings 60 more elementary students and more special education placements. Update enrollment, add staff and tuition, and use the enrollment cap adjustment.',
      setup(inp) { inp.ptl.wenrNew = 2960.0; },
      story: () => `A new apartment complex opened. The Department's projected 2026-27 weighted enrollment (WENR) rises to <b>2,960.0</b> (from 2,859.0). You must:<ul><li>update Enrollment line 5 (Grades 1-5) on roll full time to <b>860</b>;</li><li>add two grades 1-5 teachers: raise Appropriation line 2100 by at least <b>$190,000</b>;</li><li>add out-of-district placements: raise line 29100 by at least <b>$450,000</b>;</li><li>explain the growth on Enrollment line 25.</li></ul>`,
      goals: [
        { text: 'Enrollment line 5 column A is 860', test: (M) => M.calc.enr.byLine['5'].v[0] === 860, screen: 'enrollment' },
        { text: 'Line 2100 increased by at least $190,000', test: (M) => M.av(2100) >= BASE.av(2100) + 190000, detail: (M) => money(M.av(2100) - BASE.av(2100)) + ' added', screen: 'appropriations' },
        { text: 'Line 29100 increased by at least $450,000', test: (M) => M.av(29100) >= BASE.av(29100) + 450000, detail: (M) => money(M.av(29100) - BASE.av(29100)) + ' added', screen: 'appropriations' },
        { text: 'Explanation entered on Enrollment line 25', test: (M, S) => !!(S.inputs.enrExpl['24'] || '').trim() && S.inputs.enrExpl['24'] !== 'Increase in Pre K/SpEd population', screen: 'enrollment' },
        { text: 'No fatal edits on the Edit Report', test: (M) => fatalCount(M) === 0, screen: 'editreport' }
      ] },
    { id: 'flatlevy', title: 'Zero Tax Increase', level: 'Advanced',
      brief: 'The board wants no increase in the general fund tax levy. Find the savings and use reserves responsibly.',
      setup() {},
      story: () => `At the budget workshop the board asked for a <b>0% general fund levy increase</b>: Revenue line 100 may not exceed last year's levy of <b>${money(36893102)}</b> (that is ${money(37630964 - 36893102)} less than the adopted budget). Reserves may help, but only for their legal purpose: maintenance reserve withdrawals may not exceed required maintenance (line 48580), and classroom instruction must be protected.`,
      goals: [
        { text: 'Revenue line 100 is no more than last year\'s levy', test: (M) => M.rv(100) <= 36893102, detail: (M) => money(M.rv(100)), screen: 'revenues' },
        { text: 'No fatal edits on the Edit Report', test: (M) => fatalCount(M) === 0, screen: 'editreport' },
        { text: 'Maintenance reserve withdrawal (Recap line 43) no more than required maintenance (line 48580)', test: (M) => M.recap[43].y3 <= M.av(48580), screen: 'recap' },
        { text: 'Regular + special education instruction cut by no more than 1%', test: (M) => instr(M) >= 0.99 * instr(base0), detail: (M) => `${money(instr(M))} (minimum ${money(Math.ceil(0.99 * instr(base0)))})`, screen: 'appropriations' }
      ] },
    { id: 'separate', title: 'Separate Proposal', level: 'Advanced',
      brief: 'The board wants $750,000 for new instructional coaches, but the budget is already at the cap. Put it to the voters as a separate proposal.',
      setup(inp) { inp.hc.E = 2.0; },
      story: () => `This year there is no health care adjustment, so the cap equals the levy: the budget is <b>at its cap</b>. The board wants <b>$750,000</b> for math and literacy coaches (Appropriation line 43080, Salaries of Facilitators, Math &amp; Literacy Coaches). Because the cap has no room, the extra levy must go on the ballot as a separate proposal.`,
      goals: [
        { text: 'Line 43080 increased by at least $750,000', test: (M) => M.av(43080) >= BASE.av(43080) + 750000, screen: 'appropriations' },
        { text: 'A separate proposal of at least $750,000 is entered (Revenue line 111)', test: (M) => M.rv(111) >= 750000, screen: 'separateproposal' },
        { text: 'Base levy (line 100) stays within the cap', test: (M) => M.rv(100) <= M.calc.cap.I, screen: 'taxlevycap' },
        { text: 'No fatal edits on the Edit Report', test: (M) => fatalCount(M) === 0, screen: 'editreport' }
      ] },
    { id: 'excess', title: 'Excess Surplus Surprise', level: 'Intermediate',
      brief: 'The audit shows more excess surplus than expected. Budget it correctly and pass the savings to taxpayers.',
      setup(inp) { inp.es.D1 = 1600000; inp.recap[12] = { y2: 485889 }; },
      story: () => `The June 30, 2025 audit reports excess surplus of <b>${money(1600000)}</b>, not ${money(1114111)}. The extra ${money(485889)} was moved into the legal reserve (Recap line 12). By law excess surplus must be used in the next budget, which lowers the tax levy. Budget it on the Recap and reduce the levy by at least the extra amount.`,
      goals: [
        { text: 'No fatal edits on the Edit Report', test: (M) => fatalCount(M) === 0, screen: 'editreport' },
        { text: 'Levy (line 100) reduced by at least $485,889', test: (M) => M.rv(100) <= 37630964 - 485889, detail: (M) => money(M.rv(100)), screen: 'revenues' },
        { text: 'General Fund appropriations not increased', test: (M) => M.av(84060) <= BASE.av(84060), screen: 'appropriations' }
      ] }
  ];
  const scenario = (id) => scenarios.find((s) => s.id === id) || scenarios[0];
  function setupScenario(inp, id) { scenario(id).setup(inp); }

  /* ===================== SCORECARD ===================== */
  function fatalCount(M) { return M.edits.filter((e) => e.type === 'Fatal' && e.failing).length; }
  function scoreSummary(M) {
    const S = B.S;
    let goals = 0, met = 0;
    if (S.mode === 'scenario') { const sc = scenario(S.scenarioId); goals = sc.goals.length; met = sc.goals.filter((g) => g.test(M, S)).length; }
    return { fatal: fatalCount(M), goals, goalsMet: met };
  }
  const FATAL_PLAIN = {
    1001: 'General Fund balances (revenues = appropriations)', 1002: 'Special Revenue Fund balances', 1003: 'Debt Service Fund balances',
    1004: 'Tax levy within the cap', 1005: 'Tax levy at or above the minimum levy', 1006: 'No negative fund balances or reserves',
    1007: 'Excess surplus from the audit is budgeted', 1008: 'SEMI revenue at least 90% of projection', 1009: 'Administrative cost per pupil within the limit',
    1010: 'Preschool aid revenues equal the preschool program budget', 1011: 'Banked cap used is available', 1012: 'No negative revenue or appropriation lines',
    1013: 'Separate proposal appropriations included'
  };
  function checkRow(ok, label, why, screen, kind) {
    const cls = kind === 'warn' ? 'warn' : ok ? 'pass' : 'fail';
    const ic = kind === 'warn' ? '!' : ok ? '&#10003;' : '&#10007;';
    return `<div class="check ${cls}"><span class="ic">${ic}</span><div><div>${label}${screen ? ` <a data-go="${screen}" href="#/${screen}">go to screen</a>` : ''}</div>${why ? `<div class="why">${why}</div>` : ''}</div></div>`;
  }
  function scorecardHtml(M, S, full) {
    const fatal = M.edits.filter((e) => e.type === 'Fatal');
    const warns = M.edits.filter((e) => e.type === 'Warning' && e.failing);
    let h = '';
    if (full) h += `<h2>County Office Review Checklist (Simulator)</h2><p class="note" style="text-align:center">In the state software the county office uses this screen to review and approve the budget for advertising. Here it shows your scorecard.</p>`;
    if (S.mode === 'scenario') {
      const sc = scenario(S.scenarioId);
      h += `<h3>Scenario: ${esc(sc.title)}</h3><div class="tip">${sc.story(M)}</div>`;
      h += sc.goals.map((g) => checkRow(g.test(M, S), esc(g.text), g.detail ? g.detail(M) : '', g.screen)).join('');
    }
    h += `<h3>Required checks (fatal edits)</h3>` + fatal.map((e) => checkRow(!e.failing, FATAL_PLAIN[e.id] || e.msg, e.failing ? esc(e.msg) + '<br><code>' + esc(e.ver) + '</code>' : '', e.screen)).join('');
    h += `<h3>Warnings to review (${warns.length})</h3>` + (warns.length ? warns.map((e) => checkRow(false, esc(e.msg), '<code>' + esc(e.ver) + '</code>', e.screen, 'warn')).join('') : '<p>None.</p>');
    if (full) {
      const sum = scoreSummary(M);
      const ready = sum.fatal === 0 && sum.goalsMet === sum.goals;
      h += `<div class="toolbar"><select><option>Election type for 2026 election: Type 2 - November</option><option>Type 2 - April</option><option>Type 1</option></select><button class="btn primary" data-approve>Request County Approval</button></div>`;
      if (S.guided.approveTried) {
        h += ready ? `<p class="big ok" style="text-align:center">&#10003; Approved for advertising (simulated). Well done!</p>`
          : `<p class="big bad" style="text-align:center">Not approved. ${sum.fatal ? sum.fatal + ' fatal edit(s) remain.' : ''} ${sum.goals && sum.goalsMet < sum.goals ? (sum.goals - sum.goalsMet) + ' scenario goal(s) not met.' : ''}</p>`;
      }
    }
    return h;
  }

  function panelHtml(S) {
    const M = S.M;
    if (S.mode === 'guided') {
      const cur = guidedStatus(S, M);
      const steps = guidedSteps.map((st, i) => {
        const done = !!S.guided.done[i];
        const isCur = i === cur;
        return `<div class="step ${isCur ? 'cur' : ''} ${done ? 'done' : ''}"><div class="h">${done ? '&#10003; ' : ''}${i + 1}. ${esc(st.title)}</div>
          ${isCur ? `<div>${st.text(S, M)}</div><div class="go"><button class="btn" data-go="${st.screen}">Go to screen</button></div>` : ''}</div>`;
      }).join('');
      const fin = cur >= guidedSteps.length ? '<p class="big ok">You finished the walkthrough! Try a Scenario Challenge next.</p>' : '';
      return `<header><span>Guided Walkthrough &mdash; step ${Math.min(cur + 1, guidedSteps.length)} of ${guidedSteps.length}</span><span><button data-act="min" title="Minimize">_</button><button data-act="close" title="Hide">&times;</button></span></header>
        <div class="body">${fin}${steps}<p class="note">Fatal edits right now: <b class="${fatalCount(M) ? 'bad' : 'ok'}">${fatalCount(M)}</b></p></div>`;
    }
    const sum = scoreSummary(M);
    const title = S.mode === 'scenario' ? 'Scenario scorecard' : 'Sandbox scorecard';
    return `<header><span>${title}: <span class="${sum.fatal ? '' : ''}">${sum.fatal} fatal${S.mode === 'scenario' ? `, goals ${sum.goalsMet}/${sum.goals}` : ''}</span></span><span><button data-act="min" title="Minimize">_</button><button data-act="close" title="Hide">&times;</button></span></header>
      <div class="body">${compactCard(M, S)}<p><a data-go="county" href="#/county">Open the full checklist and request approval</a></p></div>`;
  }

  function compactCard(M, S) {
    let h = '';
    if (S.mode === 'scenario') {
      const sc = scenario(S.scenarioId);
      h += `<div class="tip">${sc.story(M)}</div><div class="h big">Goals</div>` + sc.goals.map((g) => checkRow(g.test(M, S), esc(g.text), g.detail ? g.detail(M) : '', g.screen)).join('');
    }
    const fatal = M.edits.filter((e) => e.type === 'Fatal');
    const bad = fatal.filter((e) => e.failing);
    h += `<div class="h big" style="margin-top:8px">Required checks</div>`;
    h += bad.map((e) => checkRow(false, FATAL_PLAIN[e.id] || e.msg, esc(e.msg), e.screen)).join('');
    h += checkRow(true, `${fatal.length - bad.length} of ${fatal.length} required checks pass`, bad.length ? '' : 'No fatal edits.', '');
    const warns = M.edits.filter((e) => e.type === 'Warning' && e.failing).length;
    h += checkRow(false, `${warns} warning${warns === 1 ? '' : 's'} to review`, '', 'editreport', 'warn');
    return h;
  }
  /* ===================== RESULTS PAGE ===================== */
  function startModel(S) {
    const inp = B.defaultInputs();
    if (S.mode === 'guided') setupGuided(inp);
    if (S.mode === 'scenario') setupScenario(inp, S.scenarioId);
    return B.compute(inp);
  }
  function resultsHtml(M, S) {
    if (S.mode === 'home') return '<p>Choose a mode on the Home screen first.</p>';
    const start = startModel(S);
    const sum = scoreSummary(M);
    const label = { guided: 'Guided Walkthrough', scenario: 'Scenario Challenge: ' + scenario(S.scenarioId).title, sandbox: 'Open Sandbox' }[S.mode];
    const changes = [];
    [['Revenue', B.D.revenues, B.REV, M.rv, start.rv], ['Appropriation', B.D.appropriations, B.APP, M.av, start.av]].forEach(([nm, list, T, now, was]) => {
      list.forEach((r) => { if (T.kids[r.line]) return; const a = was(r.line, 'y3'), b = now(r.line, 'y3'); if (a !== b) changes.push([nm, r.line, r.title, a, b]); });
    });
    B.RECAP.forEach((r) => { const a = start.recap[r.id].y3, b = M.recap[r.id].y3; if (!B.RECAP_CALC.has(r.id) && a !== b && a !== null) changes.push(['Recap', r.id, r.name, a, b]); });
    const key = [
      ['General Fund revenues (line 720)', start.rv(720), M.rv(720)], ['General Fund appropriations (line 84060)', start.av(84060), M.av(84060)],
      ['Tax levy (line 100)', start.rv(100), M.rv(100)], ['Tax levy cap (line I)', start.calc.cap.I, M.calc.cap.I], ['Banked cap used', start.calc.cap.H, M.calc.cap.H],
      ['Budgeted fund balance (line 580)', start.rv(580), M.rv(580)], ['Unassigned fund balance 6/30/27 (Recap 8)', start.recap[8].y3, M.recap[8].y3],
      ['Admin cost per pupil', start.calc.acl.perPupil, M.calc.acl.perPupil], ['Estimated GF tax rate', start.calc.rate.gfRate, M.calc.rate.gfRate]
    ];
    const ok = sum.fatal === 0 && sum.goalsMet === sum.goals && (S.mode !== 'guided' || S.guided.step >= guidedSteps.length);
    const fm = (v) => (typeof v === 'number' && Math.abs(v) > 50 ? money(v) : v);
    return `<h2>Budget Practice Lab &mdash; Results</h2>
      <table><tr><td>Student</td><td><input data-student value="${esc(S.student)}" placeholder="Type your name" style="width:260px"></td></tr>
      <tr><td>Mode</td><td>${esc(label)}</td></tr><tr><td>Printed</td><td>${new Date().toLocaleString()}</td></tr>
      <tr><td>Result</td><td class="big ${ok ? 'ok' : 'bad'}">${ok ? 'PASS' : 'NOT YET PASSING'} &mdash; ${sum.fatal} fatal edit(s)${S.mode === 'scenario' ? `, ${sum.goalsMet} of ${sum.goals} goals met` : ''}${S.mode === 'guided' ? `, ${Math.min(S.guided.step, guidedSteps.length)} of ${guidedSteps.length} steps` : ''}</td></tr></table>
      ${scorecardHtml(M, S, false)}
      <h3>Key figures</h3><table><tr><th></th><th class="num">Starting point</th><th class="num">Your budget</th></tr>${key.map((k) => `<tr><td>${k[0]}</td><td class="num">${fm(k[1])}</td><td class="num">${fm(k[2])}</td></tr>`).join('')}</table>
      <h3>Lines you changed (${changes.length})</h3>${changes.length ? `<table><tr><th>Screen</th><th>Line</th><th>Title</th><th class="num">Was</th><th class="num">Now</th><th class="num">Change</th></tr>${changes.slice(0, 120).map((c) => `<tr><td>${c[0]}</td><td>${c[1]}</td><td>${esc(c[2])}</td><td class="num">${money(c[3])}</td><td class="num">${money(c[4])}</td><td class="num">${money(c[4] - c[3])}</td></tr>`).join('')}</table>` : '<p>No changes yet.</p>'}
      <div class="bottombar noprint"><button class="btn primary" onclick="window.print()">Print / Save as PDF</button></div>`;
  }

  function afterEdit() { /* panel re-renders with the screen */ }
  function onRoute(id) { const S = B.S; if (S.mode === 'home') return; S.guided.visited = S.guided.visited || {}; S.guided.visited[id] = true; if (S.mode === 'guided') guidedStatus(S, S.M); B.save(); }

  B.Modes = { guidedSteps, setupGuided, scenarios, scenario, setupScenario, scoreSummary, scorecardHtml, panelHtml, resultsHtml, afterEdit, onRoute, fatalCount, guidedStatus };
})();
