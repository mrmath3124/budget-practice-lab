/* Budget Practice Lab - calculation engine.
 * Rebuilds how the budget screens feed each other. See docs/DATA-FLOW.md.
 * Everything runs in the browser; nothing is sent anywhere.
 */
(function () {
  'use strict';
  const D = window.SIM_DATA;
  const round = (x) => Math.round(Number(x) || 0);
  const n = (x) => (x === null || x === undefined || x === '' || isNaN(Number(x)) ? 0 : Number(x));

  /* ---------- static reference values captured from the 2026-27 screens ---------- */
  const REF = {
    adequacyBudget: 65743491,
    localFairShare: 42254319,
    wenrPrior: 2859.0,
    wenrNew: 2749.0,
    shbpPct: 31.9,
    regionalAdminPerPupil: 2978,
    priorAdminPerPupil: 2635,
    adminBenefitCalibration: 0.985715, // reproduces the 2026-27 allocated benefits exactly
    banked: { y2324: 716094, y2425: 506504, y2526: 419822 },
    bankHistory: {
      cols: ['Generated in 2023-24', 'Generated in 2024-25', 'Generated in 2025-26'],
      A: [35460498, 36381003, 37117343], B: [716094, 295209, 195581], C: [0, 0, 0], D: [0, 0, 0],
      E: [0, 0, 0], E1: [0, 0, 0], E2: [0, 0, 0], F: [36176592, 36676212, 37312924],
      G: [35460498, 36169708, 36893102], G1: [0, 0, 0], H: [716094, 506504, 419822],
      I: [0, 0, null], J: [0, 0, 0], K: [716094, null, null], L: [0, 506504, 419822]
    },
    doeGrowth: { rate: 0.582, low: -0.41799998, high: 1.582 },
    perPupil: [
      ['IND1PP', 'Total Budgetary Comparative Per Pupil Cost', 15382, 16949, 18768, 20872, 19614],
      ['IND2PP', 'Total Classroom Instruction', 7803, 9201, 10277, 11193, 10716],
      ['IND3PP', 'Classroom-Salaries and Benefits', 7588, 8402, 9708, 10467, 10187],
      ['IND4PP', 'Classroom-General Supplies and Textbooks', 91, 608, 430, 550, 297],
      ['IND5PP', 'Classroom-Purchased Services and Other', 124, 190, 140, 176, 232],
      ['IND6PP', 'Total Support Services', 2796, 3259, 3462, 3741, 3879],
      ['IND7PP', 'Support Services-Salaries and Benefits', 2154, 2346, 2376, 2586, 2817],
      ['IND8PP', 'Total Administrative Costs', 2242, 2112, 2417, 2635, 2342],
      ['IND9PP', 'Administration Salaries and Benefits', 1892, 1755, 1937, 2113, 1877],
      ['IND16PP', 'Legal Costs', 27, 31, 35, 35, 35],
      ['IND10PP', 'Total Operations and Maintenance of Plant', 2144, 2004, 2196, 2855, 2246],
      ['IND11PP', 'Operations and Maintenance-Salaries and Benefits', 925, 1102, 1143, 1185, 1271],
      ['IND12PP', 'Board Contribution to Food Services', 58, 0, 0, 0, 0],
      ['IND13PP', 'Total Extracurricular Costs', 317, 361, 394, 425, 404],
      ['IND15PP', 'Total Equipment Costs', 54, 144, 150, 487, 138]
    ],
    sharedServices: [
      ['Transportation Services, including Fuel', 'Utilize a regional jointure for procurement of transportation services'],
      ['Purchasing', 'Various cooperative purchasing agreements'],
      ['Municipal/Public Works', 'Sharing of equipment, snow plowing'],
      ['Municipal/Public Works', 'Sharing of buses and school facilities for municipal programs'],
      ['Municipal/Public Works', 'Inter-local agreement for police services'],
      ['Insurance Coverages and Benefits', 'Participate in a school insurance group cooperative'],
      ['Insurance Coverages and Benefits', 'Participate in a cooperative for student accident insurance'],
      ['Insurance Coverages and Benefits', 'Participate in the State Health Benefits Program']
    ],
    capitalProjectBalance: [{ id: 1, date: '03/27/2024', original: 12992000, complete: 'Y', unexpended: 10295513 }]
  };

  /* ---------- default inputs for every non-grid screen (2026-27 values) ---------- */
  function defaultInputs() {
    return {
      rev: {}, app: {}, expl: {}, recap: {}, locked: { rev: {}, app: {} },
      semi: { count: 238, projected: 38920, waiver: 0, phaseIn: 0, reduction: 0, optMore: 0, alt: 0, county: 0 },
      pea: {
        programs: { 1: 0, 2: 0, 3: 1 },
        levy: 0, gfReg: 2309020, gfIncl: 840700, cur: 0, carry: 1529672, tuitInd: 0, tuitLea: 0,
        nDist: 0, nProv: 0, nHS: 0, nInc: 0,
        lines: { 85000: 1009623, 85020: 343347, 85025: 0, 85030: 200000, 85040: 50000, 85060: 0, 85080: 170000, 85100: 0,
          86000: 102000, 86020: 172558, 86040: 147718, 86060: 36069, 86080: 140073, 86090: 0, 86100: 67790, 86120: 135580, 86125: 0,
          86140: 585823, 86160: 1103811, 86180: 0, 86200: 0, 86220: 0, 86240: 0, 86260: 0, 86280: 0, 86300: 0, 86320: 0, 86330: 10000,
          86340: 35000, 86360: 0, 87000: 370000, 87020: 0 }
      },
      es: { A: 2412039, A1: 0, A2: 0, A3: 0, A4: 0, D1: 1114111, D2: 0 },
      ptl: { B: 0, C: 0, wenrPrior: REF.wenrPrior, wenrNew: REF.wenrNew },
      min: { C4: 0, C5: 0, C6: 0, C7: 0 },
      hc: { A2: 259560, A3: 0, B1: 7896696, B2: 252000, B3: 0, E: REF.shbpPct },
      pen: { A: 0, B: 0 },
      respInc: [], respDec: [],
      cap: { F: 0, G: 0, H: 0 },
      status: { explanation: '' },
      sp: [], spPrior: [],
      cp: [],
      enr: {}, enrExpl: {},
      acl: {},
      ben: { empShare: 1268781 },
      tlc: { gfCol2: null, dsBalance: 36835, dsCol2: 2030000, lateCert: 0, other: 0 },
      rate: { assessed: 4410597800, equalized: 3599701834 },
      priorities: '',
      contracts: [],
      shared: REF.sharedServices.map((s, i) => ({ row: i + 1, type: s[0], desc: s[1], saved: 0 }))
    };
  }

  /* ---------- line tables ---------- */
  function buildTable(rows) {
    const by = {}, kids = {}, order = [];
    rows.forEach((r) => { by[r.line] = r; order.push(r.line); });
    rows.forEach((r) => { if (r.sumTo) (kids[r.sumTo] = kids[r.sumTo] || []).push(r.line); });
    return { by, kids, order };
  }
  const REV = buildTable(D.revenues);
  const APP = buildTable(D.appropriations);
  const RECAP = D.recap;

  /* Recap sections: header row, then rows until "Ending Balance" */
  const recapSections = [];
  (function () {
    let cur = null;
    RECAP.forEach((r) => {
      const isHeader = r.y1 === null && r.y2 === null && r.y3 === null;
      if (isHeader) { cur = { header: r.id, name: r.name, rows: [] }; recapSections.push(cur); return; }
      if (cur) cur.rows.push(r.id);
    });
  })();
  const recapById = {}; RECAP.forEach((r) => { recapById[r.id] = r; });
  // Recap rows that are calculated (not keyed)
  const RECAP_CALC = new Set();
  recapSections.forEach((s) => s.rows.forEach((id) => { const nm = recapById[id].name; if (/^Beginning Balance|^Ending Balance/.test(nm)) RECAP_CALC.add(id); }));
  RECAP_CALC.add(4); // from Appropriation of Excess Surplus screen

  /* ---------- feeder links: line -> source (2026-27 column) ---------- */
  const RP = (id) => (M) => M.recap[id].y3;
  const REV_FEED = {
    111: (M) => M.calc.sp.total,
    320: RP(77), 330: RP(42), 340: RP(30),
    540: (M) => M.calc.semi.budgeted,
    580: (M) => M.recap[3].y3 + M.recap[4].y3 + M.recap[14].y3 + M.recap[16].y3,
    600: RP(31), 610: RP(13), 620: RP(32), 625: RP(33), 630: RP(43), 640: RP(71), 650: RP(72),
    660: RP(78), 670: RP(79), 672: RP(86), 673: (M) => M.recap[93].y3 + M.recap[94].y3, 677: RP(15), 678: RP(65),
    723: (M) => M.calc.pea.levy, 725: (M) => M.calc.pea.tuitInd, 730: (M) => M.calc.pea.tuitLea,
    737: RP(50), 738: RP(57), 755: (M) => M.calc.pea.carry, 760: (M) => M.calc.pea.cur,
    835: (M) => M.calc.pea.gfReg, 836: (M) => M.calc.pea.gfIncl,
    855: RP(33), 880: RP(107), 892: RP(100), 894: RP(108)
  };
  const APP_FEED = {
    2040: (M) => M.calc.pea.gfReg, 2060: (M) => M.calc.pea.gfIncl,
    72160: RP(11), 72180: RP(42), 72200: RP(41), 72220: RP(76), 72240: RP(77), 72246: RP(85), 72247: RP(92),
    76240: (M) => M.calc.cp.outlay,
    76320: (M) => M.recap[31].y3 + M.recap[32].y3,
    76340: RP(33), 76360: (M) => M.recap[28].y3 + M.recap[29].y3, 76380: RP(30), 76385: RP(93),
    84200: RP(51), 84220: RP(58), 89940: RP(106), 89960: RP(107)
  };
  // PEA detail lines feed appropriation lines 85000-87020
  Object.keys(defaultInputs().pea.lines).forEach((l) => { APP_FEED[l] = (M) => n(M.inputs.pea.lines[l]); });

  // where a fed line gets its value - shown in the grid tooltip and guided text
  const FEED_SOURCE = {};
  Object.keys(REV_FEED).forEach((l) => { FEED_SOURCE['rev' + l] = feedLabel('rev', +l); });
  Object.keys(APP_FEED).forEach((l) => { FEED_SOURCE['app' + l] = feedLabel('app', +l); });
  function feedLabel(kind, l) {
    if (kind === 'rev') {
      if (l === 111) return 'Separate Proposals screen';
      if (l === 540) return 'SEMI screen';
      if ([723, 725, 730, 755, 760, 835, 836].includes(l)) return 'Preschool Education Aid screen';
      return 'Recap of Balances screen';
    }
    if (l >= 85000 && l <= 87100) return 'Preschool Education Aid screen';
    if (l === 2040 || l === 2060) return 'Preschool Education Aid screen';
    if (l === 76240) return 'Capital Projects screen';
    return 'Recap of Balances screen';
  }

  /* ---------- compute ---------- */
  function lineValue(tbl, kind, M, line, col) {
    const memo = M._memo[kind + col];
    if (memo[line] !== undefined) return memo[line];
    const r = tbl.by[line];
    let v;
    if (tbl.kids[line]) {
      v = tbl.kids[line].reduce((s, k) => s + lineValue(tbl, kind, M, k, col), 0);
    } else {
      const inp = M.inputs[kind][line];
      const lockedOverride = M.inputs.locked[kind][line];
      const feed = (kind === 'rev' ? REV_FEED : APP_FEED)[line];
      if (col === 'y3' && feed) v = round(feed(M));
      else if (col === 'y1') v = r.y1;
      else {
        const lockedFlag = col === 'y2' ? r.op2 : r.op3;
        if (!lockedFlag && inp && inp[col] !== undefined && inp[col] !== null) v = n(inp[col]);
        else if (lockedFlag && lockedOverride && lockedOverride[col] !== undefined) v = n(lockedOverride[col]);
        else v = r[col];
      }
    }
    memo[line] = v;
    return v;
  }

  function isEditable(kind, line, col) {
    const tbl = kind === 'rev' ? REV : APP;
    const r = tbl.by[line];
    if (!r || tbl.kids[line] || col === 'y1') return false;
    if (col === 'y3' && (kind === 'rev' ? REV_FEED : APP_FEED)[line]) return false;
    return col === 'y2' ? !r.op2 : !r.op3;
  }

  function compute(inputs) {
    const M = { inputs, calc: {}, recap: {}, _memo: { revy1: {}, revy2: {}, revy3: {}, appy1: {}, appy2: {}, appy3: {} } };
    const rv = (l, c) => lineValue(REV, 'rev', M, l, c || 'y3');
    const av = (l, c) => lineValue(APP, 'app', M, l, c || 'y3');
    M.rv = rv; M.av = av;
    const C = M.calc;

    /* Separate proposals */
    C.sp = { total: inputs.sp.reduce((s, p) => s + n(p.amount), 0) };

    /* Appropriation of Excess Surplus (uses 2025-26 column) */
    const es = inputs.es;
    const A5 = n(es.A) - n(es.A1) - n(es.A2) - n(es.A3) - n(es.A4);
    const B = av(84060, 'y2'), B1 = rv(710, 'y2'), B2 = av(72020, 'y2');
    const B3 = B - B1 - B2;
    const twoPct = round(0.02 * B3);
    const Cc = Math.max(twoPct, 250000);
    const Dd = A5 - Cc;
    const D3 = Math.max(0, Dd - n(es.D1) - n(es.D2));
    C.es = { A: n(es.A), A1: n(es.A1), A2: n(es.A2), A3: n(es.A3), A4: n(es.A4), A5, B, B1, B2, B3, twoPct, C: Cc, D: Dd, D1: n(es.D1), D2: n(es.D2), D3 };

    /* Recap of Balances */
    recapSections.forEach((sec) => {
      let begin = {}, running = {};
      sec.rows.forEach((id) => {
        const r = recapById[id];
        const inp = inputs.recap[id] || {};
        const row = { y1: r.y1, y2: r.y2, y3: r.y3 };
        ['y2', 'y3'].forEach((c) => {
          if (/^Beginning Balance/.test(r.name)) {
            row[c] = r[c];
            running[c] = row[c];
          } else if (/^Ending Balance/.test(r.name)) {
            row[c] = running[c];
          } else if (id === 4 && c === 'y3') {
            row[c] = C.es.D3; running[c] -= row[c];
          } else if (r[c] === null) {
            row[c] = null;
          } else {
            row[c] = inp[c] !== undefined && inp[c] !== null ? n(inp[c]) : r[c];
            if (/^Plus/.test(r.name)) running[c] += row[c];
            else if (/^Less/.test(r.name)) running[c] -= row[c];
          }
        });
        M.recap[id] = row;
        if (/^Ending Balance/.test(r.name)) sec.endId = id;
      });
    });
    // Beginning 2026-27 = Ending 2025-26: second pass now that every 2025-26 ending is known
    recapSections.forEach((sec) => {
      let running = null;
      sec.rows.forEach((id) => {
        const r = recapById[id], row = M.recap[id];
        if (/^Beginning Balance/.test(r.name)) { row.y3 = M.recap[sec.endId].y2; running = row.y3; return; }
        if (/^Ending Balance/.test(r.name)) { row.y3 = running; return; }
        if (row.y3 === null || running === null) return;
        if (/^Plus/.test(r.name)) running += row.y3; else if (/^Less/.test(r.name)) running -= row.y3;
      });
    });
    RECAP.forEach((r) => { if (!M.recap[r.id]) M.recap[r.id] = { y1: r.y1, y2: r.y2, y3: r.y3 }; });

    /* SEMI */
    const s = inputs.semi;
    const ninety = round(0.9 * n(s.projected));
    let budgeted = ninety;
    if (n(s.waiver)) budgeted = 0;
    else if ((n(s.optMore) || n(s.phaseIn) || n(s.reduction)) && n(s.alt) > 0) budgeted = n(s.alt);
    C.semi = { count: n(s.count), projected: n(s.projected), ninety, budgeted, waiver: n(s.waiver), alt: n(s.alt), documented: n(s.phaseIn) || n(s.reduction), optMore: n(s.optMore) };

    /* Preschool Education Aid */
    const p = inputs.pea;
    const peaRev = n(p.levy) + n(p.gfReg) + n(p.gfIncl) + n(p.cur) + n(p.carry) + n(p.tuitInd) + n(p.tuitLea);
    const L = p.lines;
    const sum = (a, b) => Object.keys(L).filter((k) => +k >= a && +k <= b).reduce((t, k) => t + n(L[k]), 0);
    C.pea = { levy: n(p.levy), gfReg: n(p.gfReg), gfIncl: n(p.gfIncl), cur: n(p.cur), carry: n(p.carry), tuitInd: n(p.tuitInd), tuitLea: n(p.tuitLea),
      totalRev: peaRev, instr: sum(85000, 85100), support: sum(86000, 86360), equip: sum(87000, 87020) };
    C.pea.program = C.pea.instr + C.pea.support + C.pea.equip;

    /* Capital projects */
    C.cp = { outlay: inputs.cp.reduce((t, x) => t + n(x.outlay), 0), fromReserve: inputs.cp.reduce((t, x) => t + n(x.localShare) + n(x.excess), 0) };

    /* ---- now the 2026-27 line totals can be computed ---- */
    REV.order.forEach((l) => { rv(l, 'y1'); rv(l, 'y2'); rv(l, 'y3'); });
    APP.order.forEach((l) => { av(l, 'y1'); av(l, 'y2'); av(l, 'y3'); });

    /* Prebudget year adjusted levy & enrollment */
    const pt = inputs.ptl;
    const A1 = rv(100, 'y2'), A2 = rv(111, 'y2'), A3 = rv(112, 'y2');
    const Dp = A1 + A2 + A3 + n(pt.B) - n(pt.C);
    const E = n(pt.wenrPrior), G = n(pt.wenrNew);
    const F = E ? round(Dp / E) : 0;
    const I = G - E;
    const J = E ? I / E : 0;
    let K = 0, Lb = 0, Mb = 0, Nb = 0;
    if (I > 0) {
      K = Math.min(I, 0.01 * E);
      Lb = Math.min(Math.max(I - 0.01 * E, 0), 0.015 * E);
      Mb = Math.min(Math.max(I - 0.025 * E, 0), 0.015 * E);
      Nb = Math.max(I - 0.04 * E, 0);
    }
    const O = 0 * K + 0.5 * Lb + 0.75 * Mb + 1.0 * Nb;
    const P = round(O * F);
    const Q = Dp + P;
    const R = round(Q * 1.02);
    C.ptl = { A1, A2, A3, B: n(pt.B), C: n(pt.C), D: Dp, E, F, G, H: E, I, J, K, L: Lb, M: Mb, N: Nb, O, P, Q, R };

    /* Health care costs */
    const h = inputs.hc;
    const hA1 = av(71180, 'y3');
    const hA4 = hA1 - n(h.A2) - n(h.A3);
    const hB4 = n(h.B1) - n(h.B2) - n(h.B3);
    const hC = round(hB4 * 1.02);
    const hD = hA4 - hC;
    const hF = round(hB4 * (n(h.E) / 100 - 0.02));
    const hG = Math.max(0, Math.min(hD, hF));
    C.hc = { A1: hA1, A2: n(h.A2), A3: n(h.A3), A4: hA4, B1: n(h.B1), B2: n(h.B2), B3: n(h.B3), B4: hB4, C: hC, D: hD, E: n(h.E), F: hF, G: hG };

    /* Pension */
    const pnC = round(n(inputs.pen.B) * 1.02);
    C.pen = { A: n(inputs.pen.A), B: n(inputs.pen.B), C: pnC, D: Math.max(0, n(inputs.pen.A) - pnC) };

    /* Responsibility shifts */
    C.respInc = inputs.respInc.reduce((t, x) => t + n(x.amount), 0);
    C.respDec = inputs.respDec.reduce((t, x) => t + n(x.amount), 0);

    /* Banked cap available this year */
    C.bankAvail = REF.banked.y2324 + REF.banked.y2425 + REF.banked.y2526;

    /* Tax Levy Cap */
    const cp = inputs.cap;
    C.cap = { A: R, B: hG, C: C.pen.D, D: C.respInc, E: -C.respDec, F: n(cp.F), G: n(cp.G), H: n(cp.H) };
    C.cap.I = C.cap.A + C.cap.B + C.cap.C + C.cap.D + C.cap.E + C.cap.F + C.cap.G + C.cap.H;

    /* Cap banking - 2026-27 column */
    const levy = rv(100, 'y3');
    const capNoBank = C.cap.I - C.cap.H;
    const gen = Math.max(0, capNoBank - levy);
    C.bank = { A: R, B: hG, C: C.pen.D, D: C.respInc, E: C.respDec, E1: n(cp.F), F: capNoBank, G: levy, G1: 0, H: gen, J: n(cp.H) };
    // FIFO use of banked cap: oldest first
    let use = n(cp.H);
    const u1 = Math.min(use, REF.banked.y2324); use -= u1;
    const u2 = Math.min(use, REF.banked.y2425); use -= u2;
    const u3 = Math.min(use, REF.banked.y2526);
    C.bank.used = [u1, u2, u3];
    C.bank.L = [0, REF.banked.y2425 - u2, REF.banked.y2526 - u3, gen];
    C.bank.M = C.bank.L[1] + C.bank.L[2] + C.bank.L[3];

    /* Minimum tax levy */
    const mn = inputs.min;
    const C1 = rv(100, 'y2'), C2 = rv(111, 'y2'), C3 = rv(112, 'y2');
    const C8 = C1 + C2 + C3 - n(mn.C4) - n(mn.C5) + n(mn.C6) + n(mn.C7);
    C.min = { A: REF.adequacyBudget, B: REF.localFairShare, C1, C2, C3, C4: n(mn.C4), C5: n(mn.C5), C6: n(mn.C6), C7: n(mn.C7), C8, D: Math.min(REF.adequacyBudget, REF.localFairShare, C8) };

    /* District status */
    const stA = rv(114, 'y3'), stB = rv(460, 'y3');
    C.status = { A: stA, B: stB, C: stA + stB, D: REF.adequacyBudget, E: stA + stB - REF.adequacyBudget };

    /* Enrollment */
    C.enr = computeEnrollment(inputs);

    /* Administrative cost limit */
    C.acl = computeAdmin(M);

    /* Per pupil (estimated in the simulator, except administrative costs) */
    C.perPupil = computePerPupil(M);

    /* Employee benefits */
    C.ben = { district: av(71180, 'y3'), emp: n(inputs.ben.empShare) };

    /* Tax levy certification */
    const t = inputs.tlc;
    const gfCert = rv(114, 'y3');
    const gfBal = round(rv(114, 'y2') / 2);
    const gfCol2 = t.gfCol2 === null || t.gfCol2 === undefined || t.gfCol2 === '' ? round(gfCert / 2) : n(t.gfCol2);
    const dsCert = rv(860, 'y3') + rv(861, 'y3');
    const peaCert = rv(723, 'y3');
    const rows = [
      ['General Fund - Base Budget', rv(100, 'y3'), gfBal, gfCol2],
      ['General Fund - Separate Proposal for School Election', rv(111, 'y3'), 0, rv(111, 'y3')],
      ['General Fund - Separate Proposal for 2026~27 Passed at Prior Special Election', rv(112, 'y3'), 0, rv(112, 'y3')],
      ['Debt Service', rv(860, 'y3'), n(t.dsBalance), n(t.dsCol2)],
      ['Debt Service - PreMerge', rv(861, 'y3'), 0, 0],
      ['Preschool Local Share pursuant to P.L. 2025, c.100', peaCert, 0, peaCert]
    ].map((r) => ({ name: r[0], cert: r[1], bal: r[2], col2: r[3], total: r[2] + r[3], remain: r[1] - r[3] }));
    const tot = rows.reduce((a, r) => ({ cert: a.cert + r.cert, bal: a.bal + r.bal, col2: a.col2 + r.col2, total: a.total + r.total, remain: a.remain + r.remain }), { cert: 0, bal: 0, col2: 0, total: 0, remain: 0 });
    C.tlc = { rows, tot, grand: tot.total + n(t.lateCert) + n(t.other), gfCert, gfCalendar: rows[0].total + rows[1].total + rows[2].total };

    /* Estimated tax rate */
    const rt = inputs.rate;
    C.rate = {
      assessed: n(rt.assessed), equalized: n(rt.equalized), gf: C.tlc.gfCalendar, all: C.tlc.grand,
      gfRate: rt.assessed ? +(C.tlc.gfCalendar / rt.assessed * 100).toFixed(4) : 0,
      allRate: rt.assessed ? +(C.tlc.grand / rt.assessed * 100).toFixed(4) : 0,
      gfEq: rt.equalized ? +(C.tlc.gfCalendar / rt.equalized * 100).toFixed(4) : 0,
      allEq: rt.equalized ? +(C.tlc.grand / rt.equalized * 100).toFixed(4) : 0
    };

    /* Tuition formulas (2025-26 column) */
    const fa = { A: rv(890, 'y2'), B: av(89600, 'y2'), C: av(89620, 'y2') };
    fa.D = fa.B + fa.C <= 0 || fa.A === 0 ? 0 : Math.round(fa.A / (fa.B + fa.C) * 1000) / 10;
    fa.E = round(fa.B * fa.D / 100);
    fa.F = fa.B - fa.E <= 0 ? 0 : fa.B - fa.E;
    const fbl = [52000, 52020, 52040, 52060, 52080, 52085, 52100, 52120, 52140, 52400, 52420, 52440, 52450, 52460];
    const fb = {}; fbl.forEach((l, i) => { fb[String.fromCharCode(65 + i)] = { line: l, v: av(l, 'y2') }; });
    const denom = fb.A.v + fb.B.v + fb.C.v + fb.D.v + fb.E.v + fb.F.v;
    const O1 = denom ? Math.round(fb.D.v / denom * 100) : 0;
    const P1 = round(O1 / 100 * (fb.G.v + fb.H.v + fb.I.v + fb.J.v + fb.K.v + fb.L.v + fb.M.v + fb.N.v));
    C.tuition = { fa, fb, O: O1, P: P1 };

    /* Edit checks */
    M.edits = runEdits(M);
    return M;
  }

  function computeEnrollment(inputs) {
    const rows = D.enrollment.map((r) => {
      const v = r.v.map((x, i) => {
        const key = r.no + '_' + i;
        if (x === '-' ) return null;
        if (inputs.enr[key] !== undefined) return n(inputs.enr[key]);
        return n(String(x).replace('+', ''));
      });
      return { no: r.no, line: r.line, name: r.name, v, I: r.I, L: inputs.enrExpl[r.no] !== undefined ? inputs.enrExpl[r.no] : r.L, Hbase: r.H };
    });
    const byLine = {}; rows.forEach((r) => { byLine[r.line] = r; });
    const leafH = (r) => {
      if (r.Hbase === '-' || r.Hbase === '') return r.Hbase === '' ? null : null;
      const [A, Bv, Cv, Dv, Ev, Fv, Gv] = r.v.map((x) => x || 0);
      return A + Bv / 2 + Cv + Dv / 2 + Gv - Ev - Fv / 2;
    };
    const sumRows = (lines, idx) => lines.reduce((t, l) => t + (byLine[l].v[idx] || 0), 0);
    const regular = ['C1', 'C2', 'D1', 'D2', 'C3', 'C4', 'D3', 'D4', '3', '4', '5', '6', '7', '8'];
    const special = ['10', '11', '12', '19', '20', '21'];
    rows.forEach((r) => {
      if (['9', '22', '25', '33'].includes(r.line)) return;
      r.H = leafH(r);
    });
    const sub = (r, lines) => {
      r.v = r.v.map((x, i) => (x === null ? null : sumRows(lines, i)));
      r.H = lines.reduce((t, l) => t + (byLine[l].H || 0), 0);
    };
    sub(byLine['9'], regular);
    sub(byLine['22'], special);
    const tot = byLine['25'];
    tot.v = tot.v.map((x, i) => (x === null ? null : (byLine['9'].v[i] || 0) + (byLine['22'].v[i] || 0) + (byLine['23'].v[i] || 0)));
    tot.H = byLine['9'].H + byLine['22'].H + (byLine['23'].H || 0);
    const res = byLine['33'];
    res.H = tot.H + ['29', '30', '31', '32'].reduce((t, l) => t + (byLine[l].H || 0), 0);
    rows.forEach((r) => {
      const I = r.I === '-' || r.I === '' ? null : n(String(r.I).replace('+', ''));
      r.Ival = I;
      if (r.H !== null && r.H !== undefined && I !== null) { r.J = round(r.H - I); r.K = I ? Math.round(r.J / I * 10000) / 100 : 0; } else { r.J = null; r.K = null; }
    });
    const a2 = (byLine['9'].v[0] || 0) + (byLine['9'].v[1] || 0) / 2 + (byLine['22'].v[0] || 0) + (byLine['22'].v[1] || 0) / 2 - (byLine['35'].v[0] || 0);
    return { rows, byLine, adminEnrollment: round(a2), growthPct: tot.K, growthLow: REF.doeGrowth.low, growthHigh: REF.doeGrowth.high, rate: REF.doeGrowth.rate };
  }

  function computeAdmin(M) {
    const lines = D.adminLimits;
    const enr = M.calc.enr.adminEnrollment || 1;
    const baseEnr = 2682;
    const isSal = (acct) => (acct.split('-')[3] || '').charAt(0) === '1';
    const gfSalLines = D.appropriations.filter((r) => r.acct.startsWith('11-') && !r.op3 && !APP.kids[r.line] && isSal(r.acct));
    const totSal = (c) => gfSalLines.reduce((t, r) => t + M.av(r.line, c), 0);
    const admSal = (c) => lines.filter((l) => isSal(l.acct)).reduce((t, l) => t + M.av(l.line, c), 0);
    const unal = (c) => M.av(71240, c);
    const ben2 = round(unal('y2') * admSal('y2') / (totSal('y2') || 1));
    const ben3 = round(unal('y3') * admSal('y3') / (totSal('y3') || 1) * REF.adminBenefitCalibration);
    const groups = [
      ['Undist. Expend. -Support Serv.-Gen. Admin.', 45000, 45999, 9991, 'Subtotal - General Admin'],
      ['Undist. Expend.-Support Serv.-School Admin.', 46000, 46999, 9992, 'Subtotal - School Admin'],
      ['Undist. Expend. - Central Services', 47000, 47499, 9993, 'Subtotal - Central Services'],
      ['Undist. Expend. - Admin Info Tech', 47500, 47999, 9994, 'Subtotal - Admin Info Tech']
    ].map((g) => {
      const ls = lines.filter((l) => l.line >= g[1] && l.line <= g[2]).map((l) => ({
        line: l.line, name: l.name, acct: l.acct, y2: M.av(l.line, 'y2'), approved: n(M.inputs.acl[l.line]),
        limit: round(l.limit / baseEnr * enr), y3: M.av(l.line, 'y3')
      }));
      const t = (k) => ls.reduce((s, x) => s + x[k], 0);
      return { title: g[0], lines: ls, subLine: g[3], subName: g[4], y2: t('y2'), approved: t('approved'), limit: t('limit'), y3: t('y3') };
    });
    const benLimit = round(1510740 / baseEnr * enr);
    const tot = (k) => groups.reduce((s, g) => s + g[k], 0);
    const A1y2 = tot('y2') + ben2, A1y3 = tot('y3') + ben3;
    const limitTotal = tot('limit') + benLimit;
    return {
      groups, ben2, ben3, benLimit, A1y2, A1appr: tot('approved') + ben2, A1y3, limitTotal, enr,
      perPupilY2: round(A1y2 / 2468), perPupilAppr: round((tot('approved') + ben2) / 2468), perPupil: round(A1y3 / enr),
      limitPerPupil: round(limitTotal / enr)
    };
  }

  function computePerPupil(M) {
    // Baseline 2026-27 values come from the state's report. The simulator moves them in proportion
    // to the related spending, so students can see the direction of change (marked "estimated").
    const base = window.__BPL_BASE || null;
    const av = (l) => M.av(l, 'y3');
    const enr = M.calc.enr.adminEnrollment || 1;
    const groups = {
      IND2PP: [3200, 10300, 11160, 12160, 13160], IND6PP: [29680, 30620, 40580, 41080, 41660, 42200, 43200, 43620, 44180],
      IND10PP: [51120], IND13PP: [17100, 17600], IND15PP: [75880], IND16PP: [45040]
    };
    const sums = {}; Object.keys(groups).forEach((k) => { sums[k] = groups[k].reduce((t, l) => t + av(l), 0); });
    sums.IND1PP = av(72260) + av(75880) - av(29180) - av(72160) - av(72180) - av(72200) - av(72220) - av(72240);
    return REF.perPupil.map((r) => {
      const row = { id: r[0], name: r[1], vals: r.slice(2, 6), y3: r[6], est: true };
      if (r[0] === 'IND8PP') { row.y3 = M.calc.acl.perPupil; row.est = false; }
      else if (base && base.sums && base.sums[r[0]] !== undefined && base.sums[r[0]]) {
        row.y3 = round(r[6] * (sums[r[0]] / base.sums[r[0]]) * (base.enr / enr));
      }
      return row;
    }).concat([{ id: 'BENSPCT', name: 'Employee Benefits as a percentage of salaries*', pct: true, vals: ['30.15%', '30.03%', '30.13%', '30.15%'], y3: '34.33%' }])
      .map((x) => { x._sums = sums; return x; });
  }

  /* ---------- edit checks (fatal errors and warnings) ---------- */
  const fmt = (x) => '$' + Math.round(x).toLocaleString('en-US') + '.00';
  function runEdits(M) {
    const C = M.calc, rv = M.rv, av = M.av, out = [];
    const add = (id, type, msg, ver, screen, failing) => out.push({ id, type, msg, ver, screen, failing: !!failing });

    // ---- fatal ----
    add(1001, 'Fatal', 'General Fund total revenues (Revenue line 720) must equal General Fund total appropriations (Appropriation line 84060).',
      `line#:RE720/3(${fmt(rv(720))}) = line#:AP84060/3(${fmt(av(84060))})`, 'revenues', rv(720) !== av(84060));
    add(1002, 'Fatal', 'Special Revenue Fund total revenues (Revenue line 840) must equal Special Revenue appropriations (Appropriation line 88760).',
      `line#:RE840/3(${fmt(rv(840))}) = line#:AP88760/3(${fmt(av(88760))})`, 'revenues', rv(840) !== av(88760));
    add(1003, 'Fatal', 'Debt Service Fund total revenues (Revenue line 935) must equal Debt Service appropriations (Appropriation line 89980).',
      `line#:RE935/3(${fmt(rv(935))}) = line#:AP89980/3(${fmt(av(89980))})`, 'revenues', rv(935) !== av(89980));
    add(1004, 'Fatal', 'The 2026-27 tax levy on Revenue line 100 exceeds the Tax Levy Cap (line I). Additional levy must be proposed separately to the voters or board of school estimate.',
      `line#:RE100/3(${fmt(rv(100))}) <= line#:TLC_I(${fmt(C.cap.I)})`, 'taxlevycap', rv(100) > C.cap.I);
    add(1005, 'Fatal', 'The 2026-27 tax levy (Revenue line 100 plus line 111) is less than the Minimum Tax Levy (line D).',
      `line#:RE100/3+RE111/3(${fmt(rv(100) + rv(111))}) >= line#:MTL_D(${fmt(C.min.D)})`, 'mintaxlevy', rv(100) + rv(111) < C.min.D);
    const neg = RECAP.filter((r) => /^Ending Balance/.test(r.name) && (M.recap[r.id].y3 < 0 || M.recap[r.id].y2 < 0));
    add(1006, 'Fatal', 'A fund balance or reserve on the Recapitulation of Balances has a negative ending balance. Budgeted withdrawals cannot exceed what is available.',
      neg.length ? neg.map((r) => `line#:RP${r.id}/3(${fmt(M.recap[r.id].y3)}) < 0`).join('; ') : 'line#:RP Ending Balances >= 0', 'recap', neg.length > 0);
    add(1007, 'Fatal', 'Excess surplus from the audit (Appropriation of Excess Surplus line D1) must be budgeted as revenue in 2026-27 (Recap line 14).',
      `line#:RP14/3(${fmt(M.recap[14].y3)}) >= line#:AE/D1(${fmt(C.es.D1)})`, 'recap', M.recap[14].y3 < C.es.D1);
    const semiBad = !C.semi.waiver && C.semi.budgeted < C.semi.ninety && !C.semi.documented;
    add(1008, 'Fatal', 'SEMI revenue (Revenue line 540) is less than 90% of projected SEMI reimbursement and no waiver or alternate projection documentation is indicated.',
      `line#:RE540/3(${fmt(rv(540))}) >= line#:SEMI90(${fmt(C.semi.ninety)})`, 'semi', semiBad);
    add(1009, 'Fatal', 'Budgeted administrative cost per pupil exceeds the administrative cost limit.',
      `line#:CL9999/3($${C.acl.perPupil}) <= line#:CL9999/L($${C.acl.limitPerPupil})`, 'admincost', C.acl.perPupil > C.acl.limitPerPupil);
    add(1010, 'Fatal', 'Preschool Education Aid total revenues must equal the total program budget on the PEA detail screen.',
      `line#:PEA_REV(${fmt(C.pea.totalRev)}) = line#:PEA_APP(${fmt(C.pea.program)})`, 'pea_detail', C.pea.totalRev !== C.pea.program);
    add(1011, 'Fatal', 'Use of banked cap (Tax Levy Cap line H) exceeds the banked cap available.',
      `line#:TLC_H(${fmt(C.cap.H)}) <= line#:CB_AVAIL(${fmt(C.bankAvail)})`, 'taxlevycap', C.cap.H > C.bankAvail);
    const negLines = [];
    [[REV, 'rev', 'RE'], [APP, 'app', 'AP']].forEach(([T, k, pfx]) => T.order.forEach((l) => {
      if (T.kids[l]) return;
      const v = k === 'rev' ? rv(l) : av(l);
      if (v < 0 && ![715, 930, 837, 838].includes(l)) negLines.push(`${pfx}${l}/3(${fmt(v)})`);
    }));
    add(1012, 'Fatal', 'Negative amounts are not allowed on revenue or appropriation lines.', negLines.length ? 'line#:' + negLines.slice(0, 5).join(', ') : 'line#: none < 0', 'revenues', negLines.length > 0);
    const spBad = C.sp.total > 0 && rv(720) !== av(84060);
    if (C.sp.total > 0) add(1013, 'Fatal', 'A separate proposal levy is recorded (Revenue line 111). The proposal\'s appropriations must also be included so the General Fund still balances.',
      `line#:RE111/3(${fmt(C.sp.total)}) with RE720/3 = AP84060/3`, 'separateproposal', spBad);

    // ---- warnings (as seen on the real Edit Report) ----
    add(98, 'Warning', 'The amount of general fund unreserved fund balance estimated at 6/30/27 is less than 2% or $250,000. The county office should review the estimated fund balance. (This edit applies to regular districts only.)',
      `line#:RP8/3(${fmt(M.recap[8].y3)}) < line#:AE/C(${fmt(C.es.C)})`, 'recap', M.recap[8].y3 < C.es.C);
    add(326, 'Warning', 'The district has budgeted tuition revenue or tuition appropriations in 2026-27. A supporting schedule for the budgeted tuition must be submitted to the county office for review.',
      `line#:RE190/3+AP29180/3(${fmt(rv(190) + av(29180))}) >0`, 'appropriations', rv(190) + av(29180) > 0);
    add(197, 'Warning', 'An amount has been recorded for general fund transfer to PEA for inclusion students. Review the amount(s) on the PEA detail program screens for inclusion revenue.',
      `line#:AP2060/3(${fmt(av(2060))}) >0`, 'pea_detail', av(2060) > 0);
    add(384, 'Warning', 'Review the amount entered on Recap of Balances Line 38 to ensure it agrees to the LRFP projected amount of projects not met by state support (N.J.A.C. 6A:23A-14.1(d)).',
      `line#:RP38/3(${fmt(M.recap[38].y3 || 0)}) >0`, 'recap', (M.recap[38].y3 || 0) > 0);
    add(385, 'Warning', 'The capital reserve ending balance exceeds the maximum local amount of the reserve (Recap line 38).',
      `line#:RP37/3(${fmt(M.recap[37].y3)}) <= line#:RP38/3(${fmt(M.recap[38].y3 || 0)})`, 'recap', M.recap[37].y3 > (M.recap[38].y3 || 0));
    add(382, 'Warning', 'Review the ending balance in the Maintenance reserve to ensure it does not exceed four percent of the replacement cost of the district\'s school facilities (N.J.A.C. 6A:23A-14.2(e)).',
      `line#:RP47/3(${fmt(M.recap[47].y3)}) >0`, 'recap', M.recap[47].y3 > 0);
    add(344, 'Warning', 'The district has a budgeted balance on the Recapitulation of Balances for Student Activity Fund ending balance in 26-27, line ID 54. The county office should review it.',
      `line#:RP54/3(${fmt(M.recap[54].y3)}) >0`, 'recap', M.recap[54].y3 > 0);
    const xfer = (M.recap[36].y2 || 0) + (M.recap[46].y2 || 0) + (M.recap[81].y2 || 0);
    add(390, 'Warning', 'Anticipated June 2026 transfers out of unassigned fund balance (Recap line 7) do not equal the transfers into the capital, maintenance and emergency reserves (lines 36, 46, 81).',
      `line#:RP7/2(${fmt(M.recap[7].y2 || 0)}) = line#:RP36/2+RP46/2+RP81/2(${fmt(xfer)})`, 'recap', (M.recap[7].y2 || 0) !== xfer);
    const g = C.enr.growthPct;
    add(410, 'Warning', `Projected enrollment growth (Enrollment line 25, column K) is outside the acceptable range around the DOE growth rate (${C.enr.growthLow.toFixed(2)}% to ${C.enr.growthHigh.toFixed(3)}%). Provide an explanation.`,
      `line#:EN25/K(${g}%) in range`, 'enrollment', g !== null && (g < C.enr.growthLow || g > C.enr.growthHigh));
    add(420, 'Warning', 'The proposed budget exceeds the adequacy budget (District Status line E is positive). Complete the explanation of programs beyond the NJ Student Learning Standards.',
      `line#:DS_E(${fmt(C.status.E)}) >0 and explanation blank`, 'districtstatus', C.status.E > 0 && !M.inputs.status.explanation);
    if (C.cap.H > 0) add(430, 'Warning', 'The district is using banked cap. Use of banked cap is subject to county office review and approval.', `line#:TLC_H(${fmt(C.cap.H)}) >0`, 'taxlevycap', true);
    if (C.cap.B > 0) add(431, 'Warning', 'An adjustment for increases in health care costs is included in the tax levy cap. Supporting documentation must be available for county review.', `line#:TLC_B(${fmt(C.cap.B)}) >0`, 'healthcare', true);
    // explanations on large changes (simulator rule for advertised totals)
    const needExpl = [];
    D.appropriations.forEach((r) => {
      if (!APP.kids[r.line]) return;
      const a = av(r.line, 'y2'), b = av(r.line, 'y3');
      if (a > 0 && Math.abs(b - a) / a >= 0.10 && !(M.inputs.expl['app' + r.line] !== undefined ? M.inputs.expl['app' + r.line] : r.expl)) needExpl.push('AP' + r.line);
    });
    add(450, 'Warning', 'An advertised appropriation total changed by 10% or more from 2025-26 without an explanation. (Simulator rule.)',
      needExpl.length ? 'line#:' + needExpl.slice(0, 6).join(', ') + (needExpl.length > 6 ? ' ...' : '') : 'line#: none', 'appropriations', needExpl.length > 0);
    return out;
  }

  /* ---------- public API ---------- */
  window.BPL = window.BPL || {};
  Object.assign(window.BPL, {
    D, REF, REV, APP, RECAP, recapSections, recapById, RECAP_CALC, FEED_SOURCE,
    defaultInputs, compute, isEditable, round, n
  });
  // remember baseline sums so per-pupil estimates move in proportion
  const baseM = compute(defaultInputs());
  window.__BPL_BASE = { sums: baseM.calc.perPupil[0]._sums, enr: baseM.calc.enr.adminEnrollment };
})();
