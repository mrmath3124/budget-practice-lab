/* Budget Practice Lab - screens (one per menu item). */
(function () {
  'use strict';
  const B = window.BPL;
  const { esc, fmt, money, pct } = B;
  const D = B.D;
  const YRS = D.years; // ['2024~25','2025~26','2026~27']
  const scr = {};
  B.screens = scr;

  const hdr = (extra) => `<div class="hdrline"><span>County : ${D.district.county}</span>${extra || ''}<span>District : ${D.district.name}</span></div>`;
  const hdr2 = () => `<div class="hdrline" style="justify-content:flex-start;flex-direction:column"><span>District ID : ${D.district.id}</span><span>District Name : ${D.district.name}</span></div>`;
  const frame = (inner) => `<div class="frame">${inner}</div>`;
  const ro = (v) => v; // readability

  /* -------- shared: simple Line | Name | Amount grids (calculation screens) -------- */
  function formGrid(id, title, rows, opts) {
    opts = opts || {};
    const cols = opts.cols || [{ k: 'line', label: 'Line' }, { k: 'name', label: 'Name' }, { k: 'amt', label: 'Amount', num: true }];
    const gr = rows.map((r, i) => {
      if (r.section) return { id: i, cls: 'section', cells: { line: '', name: r.section, amt: '' } };
      const o = { id: r.line || i, cls: r.total ? 'total' : '', cells: { line: r.line || '', name: r.name, amt: r.v }, raw: {}, wrap: { name: true } };
      if (r.ed) { o.ed = { amt: r.ed }; o.raw.amt = r.raw !== undefined ? r.raw : r.v; }
      if (r.check) { o.ed = { amt: { type: 'check', path: r.check } }; o.html = { amt: `<span class="chk">${r.v ? '&#9745;' : '&#9744;'}</span>` }; o.raw.amt = r.v; }
      if (r.html) { o.html = { amt: r.html }; }
      if (r.fed) o.fed = { amt: r.fed };
      if (r.txt) { o.txt = { amt: true }; o.ed = { amt: r.ed }; }
      return o;
    });
    return `<div class="formgrid ${opts.narrow ? 'narrow' : ''}">${title ? `<div class="screen-title" style="padding-top:6px">${esc(title)}</div>` : ''}${B.grid({ id, cols, rows: gr, tall: true })}</div>`;
  }

  /* ================= HOME ================= */
  scr.home = {
    title: 'Budget Practice Lab: Budget (2026~27)',
    render(M, S) {
      const last = S.mode !== 'home' ? `<p class="tip">You are working in <b>${{ guided: 'Guided Walkthrough', scenario: 'Scenario Challenge', sandbox: 'Open Sandbox' }[S.mode]}</b>${S.mode === 'scenario' ? ' &mdash; ' + esc(B.Modes.scenario(S.scenarioId).title) : ''}. Your entries are kept in this browser. Use the tabs above to move between screens.</p>` : '';
      const scen = B.Modes.scenarios.map((s) => `<div class="scen"><h4>${esc(s.title)} <span class="note">(${esc(s.level)})</span></h4><div>${esc(s.brief)}</div><div style="margin-top:6px"><button class="btn primary" data-start="scenario" data-scen="${s.id}">Start this scenario</button></div></div>`).join('');
      return `<div class="screen-title" style="font-weight:normal">Budget Practice Lab: Budget (2026~27)</div>
      <div style="font-weight:bold;margin:4px 0 8px">${D.district.county}(${D.district.countyId})/${D.district.name}(${D.district.id})</div>
      <div class="welcome">
        <h3>Welcome to the Budget Practice Lab!</h3>
        ${last}
        <p><span class="upd">ABOUT THIS SIMULATOR :</span> This practice copy follows the screens, menus, and line numbers of the state's web-based district budget software so you can learn how data entered on one screen flows to the others. It is loaded with a real district's adopted 2026-27 budget (public record). Nothing you enter here is sent anywhere.</p>
        <p><span class="upd">HOW TO READ THE SCREENS :</span> <span style="color:var(--edit-green)">Green amounts</span> are entered by the district &mdash; click one to change it. Black amounts are calculated or come from another screen; rows marked with &larr; are filled in from another screen. Shaded rows are totals. Changed amounts flash yellow when you arrive on a screen.</p>
        <p><span class="upd">IMPORTANT :</span> The simulator is a teaching tool, not the official software. Most calculations reproduce the 2026-27 software exactly; a few (administrative cost benefits, per pupil estimates, tuition rates) are simplified. The Edit Report includes common fatal edits and the warnings this district received.</p>
        <div class="modes">
          <div class="modecard"><h4>1. Guided Walkthrough</h4><p>Key amounts have been blanked out. Follow ${B.Modes.guidedSteps.length} steps to enter them, and watch each number roll from screen to screen until the budget balances.</p><button class="btn primary" data-start="guided">Start guided walkthrough</button></div>
          <div class="modecard"><h4>2. Scenario Challenges</h4><p>Something changes &mdash; state aid, health benefits, enrollment, a board request. Rebuild the budget so every scorecard check turns green.</p><button class="btn primary" data-start="scenlist">Choose a scenario</button></div>
          <div class="modecard"><h4>3. Open Sandbox</h4><p>Start from the full adopted budget and change anything. Use the Edit Report and scorecard to see what breaks.</p><button class="btn primary" data-start="sandbox">Open the sandbox</button></div>
        </div>
        <div id="scenlist" style="display:none"><h3 style="text-align:left">Scenario Challenges</h3>${scen}</div>
        <p class="note">Your work is saved automatically in this browser, separately for each mode and scenario. Use <b>Save work to file</b> to hand in your work or move it to another computer, and <b>Results page</b> to print your scorecard.</p>
      </div>`;
    },
    after(el) {
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-start]'); if (!b) return;
        const m = b.getAttribute('data-start');
        if (m === 'scenlist') { const s = el.querySelector('#scenlist'); s.style.display = 'block'; s.scrollIntoView({ behavior: 'smooth' }); return; }
        B.load(m, b.getAttribute('data-scen')); B.S.ui.panel = true; B.save();
        location.hash = m === 'guided' ? '#/' + B.Modes.guidedSteps[B.S.guided.step || 0].screen : (m === 'scenario' ? '#/county' : '#/revenues');
        B.route();
      });
    }
  };

  /* ================= REVENUES / APPROPRIATIONS ================= */
  function lineScreen(kind, title) {
    const T = kind === 'rev' ? B.REV : B.APP;
    const rows0 = kind === 'rev' ? D.revenues : D.appropriations;
    const id = kind === 'rev' ? 'revgrid' : 'appgrid';
    const cols = [
      { k: 'dist', label: 'District' }, { k: 'line', label: 'Line#' }, { k: 'title', label: 'Title', w: 200, cls: 'clip' }, { k: 'sub', label: 'Sub Title', w: 160, cls: 'clip' },
      { k: 'acct', label: 'Account' }, { k: 'sum', label: 'Sum To Line' }, { k: 'y1', label: YRS[0], num: true }, { k: 'y2', label: YRS[1], num: true },
      { k: 'y3', label: YRS[2], num: true }, { k: 'diff', label: 'Difference', num: true }, { k: 'dpct', label: 'Difference %', num: true },
      { k: 'expl', label: kind === 'rev' ? 'Explanation(applicable to advertised lines)' : 'Explanation(only applicable to advertised lines)', w: 200 }
    ];
    return {
      title,
      render(M, S) {
        const get = (l, c) => (kind === 'rev' ? M.rv(l, c) : M.av(l, c));
        const q = (S.ui.find && S.ui.find[kind]) || '';
        let list = rows0;
        const pageSize = kind === 'app' ? 200 : 1000;
        const total = list.length;
        let page = kind === 'app' ? (S.ui.appPage || 1) : 1;
        const pages = Math.ceil(total / pageSize);
        if (page > pages) page = 1;
        const slice = list.slice((page - 1) * pageSize, page * pageSize);
        const rows = slice.map((r) => {
          const y2 = get(r.line, 'y2'), y3 = get(r.line, 'y3');
          const isTot = !!T.kids[r.line];
          const exKey = kind + r.line;
          const expl = S.inputs.expl[exKey] !== undefined ? S.inputs.expl[exKey] : r.expl;
          const o = {
            id: r.line, cls: (isTot ? 'total' : '') + (q && String(r.line) === q ? ' sel' : ''),
            cells: { dist: D.district.id, line: r.line, title: r.title, sub: r.sub, acct: r.acct, sum: r.sumTo || '', y1: get(r.line, 'y1'), y2, y3, diff: y3 - y2, dpct: pct(y3, y2), expl },
            ed: { expl: (v) => B.setPath(['expl', exKey], v) }, txt: { expl: true }, raw: {}
          };
          if (B.isEditable(kind, r.line, 'y2')) { o.ed.y2 = [kind, String(r.line), 'y2']; }
          if (B.isEditable(kind, r.line, 'y3')) { o.ed.y3 = [kind, String(r.line), 'y3']; }
          const src = B.FEED_SOURCE[kind + r.line];
          if (src) o.fed = { y3: src };
          else if (!isTot && r.op3) o.title = { y3: 'Locked: provided by the state or no longer used' };
          return o;
        });
        const sel = (nm) => `<select data-${nm}>${['', ...cols.map((c) => c.label)].map((l) => `<option>${esc(l)}</option>`).join('')}</select>`;
        let pager = '';
        if (pages > 1) {
          pager = `<div class="pager">${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === page ? 'on' : ''}" data-page="${i + 1}">${i + 1}</button>`).join('')}
            <span class="info">Records from ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, total)} of ${total}</span></div>`;
        }
        const rangeTitle = kind === 'app' ? `<div style="text-align:center;font-weight:bold;margin-bottom:4px">Line No From ${slice[0].line} to ${slice[slice.length - 1].line}</div>` : '';
        return frame(`${hdr()}
          <div class="toolbar"><label>Click to Hide Column - ${sel('hide')}</label><label>Click to Show Column - ${sel('show')}</label>
          <label>Click to Show Row - <input data-findrow size="7" placeholder="Line#" value="${esc(q)}"></label></div>
          ${rangeTitle}${B.grid({ id, cols, rows })}${pager}
          <div class="bottombar"><button class="btn" data-export>Export Excel</button><button class="btn" onclick="window.print()">Export PDF</button></div>`);
      },
      after(el, M, S) {
        const colByLabel = (l) => cols.find((c) => c.label === l);
        el.querySelector('[data-hide]').onchange = (e) => { const c = colByLabel(e.target.value); if (c) { (S.ui.hide[id] = S.ui.hide[id] || {})[c.k] = 1; B.render(); } };
        el.querySelector('[data-show]').onchange = (e) => { const c = colByLabel(e.target.value); if (c && S.ui.hide[id]) { delete S.ui.hide[id][c.k]; B.render(); } };
        el.querySelector('[data-findrow]').onkeydown = (e) => {
          if (e.key !== 'Enter') return;
          const v = e.target.value.trim(); S.ui.find = S.ui.find || {}; S.ui.find[kind] = v;
          const idx = rows0.findIndex((r) => String(r.line) === v);
          if (kind === 'app' && idx >= 0) S.ui.appPage = Math.floor(idx / 200) + 1;
          B.render();
          const tr = el.querySelector('tr.sel'); if (tr) tr.scrollIntoView({ block: 'center' });
        };
        el.querySelectorAll('[data-page]').forEach((b) => (b.onclick = () => { S.ui.appPage = +b.getAttribute('data-page'); B.render(); el.querySelector('.gridwrap').scrollTop = 0; }));
        el.querySelector('[data-export]').onclick = () => {
          const rowsAll = rows0.map((r) => ({ cells: { dist: D.district.id, line: r.line, title: r.title, sub: r.sub, acct: r.acct, sum: r.sumTo || '', y1: (kind === 'rev' ? M.rv : M.av)(r.line, 'y1'), y2: (kind === 'rev' ? M.rv : M.av)(r.line, 'y2'), y3: (kind === 'rev' ? M.rv : M.av)(r.line, 'y3') } }));
          B.csvDownload(kind === 'rev' ? 'Revenues' : 'Appropriations', cols.slice(0, 9), rowsAll);
        };
        const tr = el.querySelector('tr.sel'); if (tr) tr.scrollIntoView({ block: 'center' });
      }
    };
  }
  scr.revenues = lineScreen('rev', 'Revenues');
  scr.appropriations = lineScreen('app', 'Appropriations');

  /* ================= RECAP ================= */
  scr.recap = {
    title: 'Recapitulation of Balance',
    render(M, S) {
      const cols = [{ k: 'id', label: 'Id' }, { k: 'name', label: 'Name', w: 380 }, { k: 'y1', label: '2024-25', num: true, money: true }, { k: 'y2', label: '2025-26', num: true, money: true }, { k: 'y3', label: '2026-27', num: true, money: true }, { k: 'cmt', label: 'Comments', w: 160 }];
      const rows = B.RECAP.map((r) => {
        const v = M.recap[r.id];
        const header = r.y1 === null && r.y2 === null && r.y3 === null;
        const calc = B.RECAP_CALC.has(r.id);
        const o = { id: r.id, cls: /^Ending/.test(r.name) ? 'total' : '', cells: { id: r.id, name: r.name, y1: header ? '' : v.y1, y2: header ? '' : v.y2, y3: header ? '' : v.y3, cmt: (S.inputs.recap[r.id] || {}).cmt || '' }, ed: {}, raw: {}, txt: { cmt: true } };
        if (!header) {
          o.ed.cmt = ['recap', String(r.id), 'cmt'];
          if (!calc && r.y2 !== null) o.ed.y2 = ['recap', String(r.id), 'y2'];
          if (!calc && r.y3 !== null) o.ed.y3 = ['recap', String(r.id), 'y3'];
          if (r.id === 4) o.fed = { y3: 'Appropriation of Excess Surplus screen (line D3)' };
          if (/^Beginning/.test(r.name)) o.title = { y3: '2026-27 beginning balance = 2025-26 ending balance' };
          if (/^Beginning/.test(r.name)) o.title.y2 = 'From the audit (June 30, 2025 balance)';
        } else o.cells.name = r.name;
        if (header) o.html = { name: `<b>${esc(r.name)}</b>` };
        return o;
      });
      return frame(`<div class="screen-title" style="padding:0 0 4px">Recapitulation of Balance</div>${hdr2()}${B.grid({ id: 'recapgrid', cols, rows })}
        <div class="bottombar"><button class="btn" data-export>Export Excel</button><button class="btn" onclick="window.print()">Export PDF</button></div>`);
    },
    after(el, M) {
      el.querySelector('[data-export]').onclick = () => B.csvDownload('Recap', [{ k: 'id', label: 'Id' }, { k: 'name', label: 'Name' }, { k: 'y1', label: '2024-25' }, { k: 'y2', label: '2025-26' }, { k: 'y3', label: '2026-27' }],
        B.RECAP.map((r) => ({ cells: { id: r.id, name: r.name, y1: M.recap[r.id].y1, y2: M.recap[r.id].y2, y3: M.recap[r.id].y3 } })));
    }
  };

  /* ================= PRESCHOOL EDUCATION AID ================= */
  const PEA_PROGRAMS = [[1, 'Preschool-Full Day 3Yr'], [2, 'Preschool-Full Day 4Yr'], [3, 'Preschool-Full Day 3Yr and 4Yr']];
  scr.pea = {
    title: 'Preschool Education Aid Programs list',
    render(M) {
      const rows = PEA_PROGRAMS.map(([i, nm]) => ({ id: i, cells: { p: nm, a: i === 3 ? M.calc.pea.totalRev : 0 }, html: { p: `<a href="#/pea_detail">${esc(nm)}</a>` } }));
      return frame(`${hdr()}<p class="redline">Please select one program and press the choose button.</p>
        <div class="formgrid narrow">${B.grid({ id: 'pealist', cols: [{ k: 'p', label: 'Program' }, { k: 'a', label: 'Amount', num: true, money: true }], rows, tall: true })}</div>
        <div class="toolbar"><a class="btn" href="#/pea_detail">Choose</a></div>
        <p class="note" style="text-align:center">In this district the whole program is budgeted under "Preschool-Full Day 3Yr and 4Yr".</p>`);
    }
  };
  const PEA_LINES = [
    ['State Projects: Instruction - Preschool Education Aid'], [85000, 'Salaries of Teachers', '20-218-100-101'], [85020, 'Other Salaries for Instruction', '20-218-100-106'],
    [85025, 'Unused Vacation Payment to Terminated/Retired Staff', '20-218-100-199'], [85030, 'Purchased Professional-Education Services', '20-218-100-321'],
    [85040, 'Other Purchased Services (400-500 series)', '20-218-100-500'], [85060, 'Tuition to Other LEAs within state-regular', '20-218-100-561'],
    [85080, 'General Supplies', '20-218-100-600'], [85100, 'Other Objects', '20-218-100-800'], ['T', 85120, 'TOTAL INSTRUCTION', 'instr'],
    ['State Projects: Support Services - Preschool Education Aid'], [86000, 'Salaries of Supervisors of Instruction', '20-218-200-102'], [86020, 'Salaries of Program Directors', '20-218-200-103'],
    [86040, 'Salaries of Other Professional Staff', '20-218-200-104'], [86060, 'Salaries of Secretaries and Clerical Assistants', '20-218-200-105'], [86080, 'Other Salaries', '20-218-200-110'],
    [86090, 'Salaries for Pupil Trans(Bet Home & Sch) - Reg.', '20-218-200-160'], [86100, 'Salaries of Community Parent Involvement Specialists', '20-218-200-173'],
    [86120, 'Salaries of Master Teachers', '20-218-200-176'], [86125, 'Unused Vacation Payment to Terminated/Retired Staff', '20-218-200-199'],
    [86140, 'Personal Services Employee Benefits', '20-218-200-200'], [86160, 'Purchased Educational Services - Contracted Pre-K', '20-218-200-321'],
    [86180, 'Purchased Educational Services - Head Start', '20-218-200-325'], [86200, 'Other Personal Professional-Educational Services', '20-218-200-329'],
    [86220, 'Other Purchased Professional Services', '20-218-200-330'], [86240, 'Cleaning, Repair and Maintenance Services', '20-218-200-420'], [86260, 'Rentals', '20-218-200-440'],
    [86280, 'Contracted Services-Transportation(Between Home & School)', '20-218-200-511'], [86300, 'Contracted Transportation Services (Field Trips)', '20-218-200-516'],
    [86320, 'Travel', '20-218-200-580'], [86330, 'Miscellaneous Purchased Services', '20-218-200-590'], [86340, 'Supplies and Materials', '20-218-200-600'], [86360, 'Other Objects', '20-218-200-800'],
    ['T', 86380, 'TOTAL SUPPORT SERVICES', 'support'],
    ['State Projects: Facilities Acquisition and Construction Services - Preschool Education Aid'], [87000, 'Instructional Equipment', '20-218-400-731'], [87020, 'Noninstructional Equipment', '20-218-400-732'],
    ['T', 87040, 'TOTAL FACILITIES ACQUISITION AND CONSTRUCTION SERVICES', 'equip'], ['T', '', 'TOTAL PROGRAM BUDGET', 'program']
  ];
  scr.pea_detail = {
    title: 'Preschool Education Aid Detailed Budget',
    render(M, S) {
      const P = M.calc.pea, p = S.inputs.pea;
      const r1 = [
        ['Tax Levy - PEA Program', 'levy', 'Revenue line 723'], ['GF Contribution - Regular:', 'gfReg', 'Revenue line 835 and Appropriation line 2040'],
        ['GF Contribution - Inclusion:', 'gfIncl', 'Revenue line 836 and Appropriation line 2060'], ['Current Year PEA:', 'cur', 'Revenue line 760'],
        ['Prior Year PEA Carryover :', 'carry', 'Revenue line 755'], ['Tuition from Individuals :', 'tuitInd', 'Revenue line 725'], ['Tuition from LEAs :', 'tuitLea', 'Revenue line 730']
      ].map(([nm, k, to]) => ({ id: k, cells: { p: nm, a: P[k], to }, ed: { a: 'pea.' + k }, raw: { a: P[k] } }));
      r1.push({ id: 'tot', cls: 'total', cells: { p: 'Total Revenues :', a: P.totalRev, to: '' } });
      [['# of Students At-Risk in-district:', 'nDist'], ['# of Students At-Risk in Providers:', 'nProv'], ['# of Students At-Risk in Head Start:', 'nHS'], ['# of Students Sp Ed inclusion :', 'nInc']]
        .forEach(([nm, k]) => r1.push({ id: k, cells: { p: nm, a: B.n(p[k]), to: '' }, ed: { a: 'pea.' + k } }));
      const r2 = PEA_LINES.map((x, i) => {
        if (x.length === 1) return { id: 's' + i, cls: 'section', cells: { l: '', d: x[0], acct: '', a: '' } };
        if (x[0] === 'T') return { id: 't' + i, cls: 'total', cells: { l: x[1], d: x[2], acct: '', a: P[x[3]] } };
        return { id: x[0], cells: { l: x[0], d: x[1], acct: x[2], a: B.n(p.lines[x[0]]) }, ed: { a: ['pea', 'lines', String(x[0])] } };
      });
      const bal = P.totalRev === P.program;
      return frame(`${hdr()}<p>Preschool Education Aid Detailed Budget (To Be Completed By Regular Districts Only).</p>
        <p class="blueline">Provide the detailed budget for the program selected. Provide the amount of tuition and general fund contribution, if any, used to fund the current year program. Also key the number of students included in the program budget.</p>
        <div class="formgrid narrow"><div style="background:#bfe3ee;padding:4px;font-weight:bold">Program Name: Preschool-Full Day 3Yr and 4Yr</div>
        <div class="toolbar"><a class="btn" href="#/pea">Go to programs list</a><button class="btn" onclick="location.reload()">Reload Page</button></div>
        ${B.grid({ id: 'pearev', cols: [{ k: 'p', label: 'Program' }, { k: 'a', label: 'Amount', num: true, money: true }, { k: 'to', label: 'Flows to' }], rows: r1, tall: true })}</div>
        <p style="text-align:center" class="${bal ? 'ok' : 'bad'}"><b>${bal ? 'Total revenues equal the total program budget.' : `Total revenues (${money(P.totalRev)}) do not equal the total program budget (${money(P.program)}).`}</b></p>
        <div class="formgrid">${B.grid({ id: 'peaapp', cols: [{ k: 'l', label: 'Line No.' }, { k: 'd', label: 'Description' }, { k: 'acct', label: 'Account Number' }, { k: 'a', label: 'Amount Budgeted 2026-27', num: true, money: true }], rows: r2, tall: true })}</div>`);
    }
  };

  /* ================= CAPITAL PROJECTS ================= */
  scr.capital = {
    title: 'Capital Project and Reserve',
    render(M, S) {
      const cp = S.inputs.cp;
      const rows = cp.map((x, i) => ({ id: i, cells: { id: i + 1, num: x.num || '', desc: x.desc || '', ls: B.n(x.localShare), ex: B.n(x.excess), out: B.n(x.outlay), del: '' },
        ed: { num: ['cp', String(i), 'num'], desc: ['cp', String(i), 'desc'], ls: ['cp', String(i), 'localShare'], ex: ['cp', String(i), 'excess'], out: ['cp', String(i), 'outlay'] }, txt: { num: true, desc: true },
        html: { del: `<a href="#" data-del="${i}">remove</a>` } }));
      const bal = rows.length ? '' : '<p class="note" style="text-align:center">No capital projects are budgeted for 2026-27. Use "Add Project" to practice.</p>';
      const capRes = M.recap[31].y3 + M.recap[32].y3;
      const ok = capRes === M.calc.cp.fromReserve;
      return frame(`<div class="screen-title">Capital Project List</div>
        ${B.grid({ id: 'cpgrid', cols: [{ k: 'id', label: 'ID' }, { k: 'num', label: 'Project Number' }, { k: 'desc', label: 'Description/Activity', w: 220 }, { k: 'ls', label: 'Capital Reserve - Local Share', num: true }, { k: 'ex', label: 'Capital Reserve - Excess Costs', num: true }, { k: 'out', label: 'Capital Outlay Transfer (line 76240)', num: true }, { k: 'del', label: '' }], rows, tall: true })}
        ${bal}<div class="toolbar"><button class="btn" data-add>Add Project</button></div>
        <div class="flow">Capital reserve withdrawals are keyed on the <a href="#/recap">Recap of Balances</a> (lines 31 and 32) and flow to Revenue lines 600 and 620 and to Appropriation line 76320. Capital outlay transfers flow to Appropriation line 76240.
        <br><span class="${ok ? 'ok' : 'warnc'}">Capital reserve on this screen: ${money(M.calc.cp.fromReserve)} &nbsp; Recap lines 31 + 32: ${money(capRes)} ${ok ? '(agree)' : '(do not agree)'}</span></div>
        <div class="screen-title">Detail of Capital Project Fund Balance</div>
        ${B.grid({ id: 'cpbal', cols: [{ k: 'id', label: 'ID' }, { k: 'd', label: 'Issue Date' }, { k: 'o', label: 'Original Project Amount', num: true, money: true }, { k: 'c', label: 'Original Purpose Complete' }, { k: 'u', label: 'Unexpended Balance', num: true, money: true }],
          rows: B.REF.capitalProjectBalance.map((x) => ({ id: x.id, cells: { id: x.id, d: x.date, o: x.original, c: x.complete, u: x.unexpended } })), tall: true })}`);
    },
    after(el, M, S) {
      el.querySelector('[data-add]').onclick = () => { S.inputs.cp.push({ num: '', desc: '', localShare: 0, excess: 0, outlay: 0 }); B.setPath('cp', S.inputs.cp); };
      el.querySelectorAll('[data-del]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); S.inputs.cp.splice(+a.getAttribute('data-del'), 1); B.setPath('cp', S.inputs.cp); }));
    }
  };

  /* ================= EXCESS SURPLUS ================= */
  scr.excesssurplus = {
    title: 'Appropriation Excess Surplus',
    render(M) {
      const E = M.calc.es;
      const rows = [
        { line: 'A', name: 'Estimated General Fund Free Balance @ 6/30/26', v: E.A, ed: 'es.A' },
        { line: 'A1', name: 'Federal Impact Aid Adjustment', v: E.A1, ed: 'es.A1' },
        { line: 'A2', name: 'Reserved Fund Balance - Purpose beyond 2026-27', v: E.A2, ed: 'es.A2' },
        { line: 'A3', name: 'School Bus Advertising Fee Adjustment', v: E.A3, ed: 'es.A3' },
        { line: 'A4', name: 'Other DOE Approved Adjustments', v: E.A4, ed: 'es.A4' },
        { line: 'A5', name: 'Adjusted Estimate @ 6/30/26 ((A)-(A1)-(A2)-(A3)-(A4))', v: E.A5, total: true },
        { line: 'B', name: '2025-26 General Fund Appropriations', v: E.B, fed: 'Appropriation line 84060, 2025-26' },
        { line: 'B1', name: '2024-25 Encumbrances in 2025-26 Appropriations', v: E.B1, fed: 'Revenue line 710, 2025-26' },
        { line: 'B2', name: '2025-26 Transfer to Food Services to Cover Deficit', v: E.B2, fed: 'Appropriation line 72020, 2025-26' },
        { line: 'B3', name: '2025-26 Appropriations Net of Encumbrances ((B)-(B1)-(B2))', v: E.B3, total: true },
        { section: 'Regular Districts:' },
        { line: 'C', name: `Greater of 2% * B3 ${money(E.twoPct)} or $250,000`, v: E.C },
        { line: 'D', name: 'Excess General Fund Free Balance @ 6/30/26 ((A5)-(C))', v: E.D },
        { line: 'D1', name: 'Excess General Fund Free Balance @ 6/30/25 (from the Audit)', v: E.D1, ed: 'es.D1' },
        { line: 'D2', name: 'Bus Advertising Reserve to be Spent on Fuel (from the Audit)', v: E.D2, ed: 'es.D2' },
        { line: 'D3', name: 'Additional Excess General Fund Free Balance ((D)-(D1)-(D2))', v: E.D3, total: true }
      ];
      return frame(`${hdr()}${formGrid('esgrid', '', rows)}
        <div class="flow formgrid">Line D1 (excess surplus from the June 30, 2025 audit) must be budgeted in 2026-27 on the <a href="#/recap">Recap</a> line 14 &rarr; Revenue line 580. Line D3, if any, goes to Recap line 4. Line C is also the test for the fund balance warning on the Edit Report.</div>`);
    }
  };

  /* ================= SEMI ================= */
  scr.semi = {
    title: 'SEMI',
    render(M, S) {
      const s = S.inputs.semi, C = M.calc.semi;
      const rows = [
        { section: 'District Entry:' },
        { name: 'Estimated medicaid eligible/Special Ed. student count', v: C.count, ed: 'semi.count' },
        { name: 'Projected SEMI Reimbursement Revenue:', v: C.projected, ed: 'semi.projected' },
        { section: 'Districts with Approved Waivers for 2026-27' },
        { name: 'District has approved waiver:', v: B.n(s.waiver), check: 'semi.waiver' },
        { name: 'If the box above is checked then no SEMI reimbursement revenue is required to be budgeted in 2026-27. If no waiver has been received for 2026-27, continue to next section.', v: null, html: '' },
        { section: 'Non-Waiver Districts:' },
        { name: '90% of Projected SEMI Reimbursement Revenue:', v: C.ninety, total: true },
        { name: 'The district must budget at least 90% of projected SEMI reimbursement revenue, unless one of the following conditions is met:', v: null, html: '' },
        { name: 'Phase-in plan for maximizing parental consent was prepared by the district:', v: B.n(s.phaseIn), check: 'semi.phaseIn' },
        { name: 'Reimbursement Revenue reduction analysis was prepared by district:', v: B.n(s.reduction), check: 'semi.reduction' },
        { name: 'Districts may budget more than the 90% projected amount. If the district opts to budget more, check this box and enter the budgeted amount below.', v: B.n(s.optMore), check: 'semi.optMore' },
        { name: 'Alternate Reimbursement Revenue Projection:', v: B.n(s.alt), ed: 'semi.alt' },
        { name: 'Amount budgeted on Revenue line 540 (Medicaid Reimbursement):', v: C.budgeted, total: true, fed: 'Goes to Revenue line 540' }
      ];
      return frame(`${hdr()}${formGrid('semigrid', '', rows, { cols: [{ k: 'name', label: 'Program' }, { k: 'amt', label: 'Amount', num: true }] })}`);
    }
  };
  // formGrid with 2 columns: map 'line' column away
  const origForm = formGrid;

  /* ================= SCHOOL BASED BUDGET ================= */
  scr.sbb = { title: 'School Based Budget', render() { return frame(`${hdr()}<p style="text-align:center"><b>Click on School name to select School.</b></p><p class="redline">No Records found.</p><div class="formgrid">${B.grid({ id: 'sbb', cols: [{ k: 'a', label: 'CDS ID' }, { k: 'b', label: 'School Name' }, { k: 'c', label: 'Total' }], rows: [] })}</div><p class="note" style="text-align:center">School-based budgets apply only to certain districts. This district has none.</p>`); } };
  scr.sbbreport = { title: 'School Based Summary Report', render() { return frame(`${hdr()}<p class="note" style="text-align:center">School-based budgets apply only to certain districts. All amounts for this district are zero.</p>`); } };

  /* ================= SFRA CALCULATIONS ================= */
  scr.districtstatus = {
    title: 'District Status',
    render(M, S) {
      const C = M.calc.status;
      const rows = [
        { section: 'District Budgeted Adequacy Spending' },
        { line: 'A', name: '2026-27 General Fund Levy', v: C.A, fed: 'Revenue line 114' },
        { line: 'B', name: 'Equalization Aid', v: C.B, fed: 'Revenue line 460' },
        { line: 'C', name: 'Total Budgeted Adequacy Spending (A + B)', v: C.C, total: true },
        { line: 'D', name: 'District Adequacy Budget', v: C.D },
        { line: 'E', name: 'Excess Amount (C - D)', v: C.E, total: true }
      ];
      return frame(`${hdr()}${formGrid('dsgrid', '', rows)}
        <div class="formgrid"><p><b>If E is:</b><br>Positive: Proposed Budget Exceeds expected local levy<br>Zero or negative: Proposed Budget is at or below the expected local levy</p>
        <p class="redline" style="text-align:left">Important Note: If Line E above is positive, then complete the explanation in the box below this statement:</p>
        <p>The school district has proposed programs and services in addition to the New Jersey student learning standards adopted by the State Board of Education. Briefly describe the programs that cause the proposed budget to exceed the expected local levy amount.</p>
        <textarea data-expl rows="4" style="width:100%">${esc(S.inputs.status.explanation)}</textarea></div>`);
    },
    after(el) { el.querySelector('[data-expl]').onchange = (e) => B.setPath('status.explanation', e.target.value); }
  };
  scr.mintaxlevy = {
    title: 'Minimum Tax Levy',
    render(M) {
      const C = M.calc.min;
      const rows = [
        { line: 'A', name: 'District Adequacy Budget', v: C.A }, { line: 'B', name: 'Local Fair Share', v: C.B },
        { line: 'C1', name: '2025-26 General Fund Base Levy', v: C.C1, fed: 'Revenue line 100, 2025-26' },
        { line: 'C2', name: '2025-26 Passed Separate Proposals from School Election', v: C.C2, fed: 'Revenue line 111, 2025-26' },
        { line: 'C3', name: '2025-26 Passed Separate Proposals from Prior Special Elections', v: C.C3, fed: 'Revenue line 112, 2025-26' },
        { section: 'Less:' },
        { line: 'C4', name: 'Non-Permanent Separate Proposals 2025-26', v: C.C4, ed: 'min.C4' }, { line: 'C5', name: 'Other DOE Approved Decreases 2026-27', v: C.C5, ed: 'min.C5' },
        { section: 'Plus:' },
        { line: 'C6', name: 'P.L. 2020, c.44 Adjustments (Health Benefits Savings)', v: C.C6, ed: 'min.C6' }, { line: 'C7', name: 'Other DOE Approved Increases 2026-27', v: C.C7, ed: 'min.C7' },
        { line: 'C8', name: 'Adjusted 2025-26 General Fund Levy', v: C.C8, total: true },
        { line: 'D', name: 'Minimum Tax Levy = Lesser of (A) or (B) or (C8)', v: C.D, total: true }
      ];
      return frame(`${hdr()}${formGrid('mtlgrid', '', rows)}<p class="formgrid">*Amount Shown on Line 100 or 110 in 2026-27 Must Equal or Exceed Line D. &nbsp; Current Revenue line 100: <b>${money(M.rv(100))}</b> <span class="${M.rv(100) + M.rv(111) >= C.D ? 'ok' : 'bad'}">${M.rv(100) + M.rv(111) >= C.D ? '(meets the minimum)' : '(below the minimum)'}</span></p>`);
    }
  };
  scr.adjustedptl = {
    title: 'Adjusted Prebudget Year Tax Levy and Enrollment Adjustment',
    render(M) {
      const C = M.calc.ptl;
      const cols = [{ k: 'line', label: 'Line' }, { k: 'name', label: 'Name' }, { k: 'amt', label: 'Amount', num: true }, { k: 'w', label: '', num: true }, { k: 'c', label: '', num: true }];
      const r = (line, name, amt, extra) => Object.assign({ id: line || name, cells: { line, name, amt, w: '', c: '' } }, extra || {});
      const rows = [
        r('', 'Per Pupil 2025-26 Tax Levy:', '', { cls: 'section' }),
        r('A1', '2025-26 Base Tax Levy', C.A1, { fed: { amt: 'Revenue line 100, 2025-26' } }),
        r('A2', '2025-26 Passed Separate Proposals from School Election', C.A2), r('A3', '2025-26 Passed Separate Proposals from Prior Special Elections', C.A3),
        r('B', 'P.L. 2020, c.44 Adjustments (Health Benefits Savings)', C.B, { ed: { amt: 'ptl.B' } }),
        r('C', 'Less 2025-26 Non-Permanent Separate Proposals', C.C, { ed: { amt: 'ptl.C' } }),
        r('D', 'Subtotal', C.D, { cls: 'total' }),
        r('E', 'Projected 2025-26 WENR - DOE', C.E.toFixed(1), { ed: { amt: 'ptl.wenrPrior' }, raw: { amt: C.E } }),
        r('F', 'Per Pupil 2025-26 Tax Levy', C.F),
        r('', 'Enrollment Factor:', '', { cls: 'section' }),
        r('G', 'Projected 2026-27 WENR - DOE', C.G.toFixed(1), { ed: { amt: 'ptl.wenrNew' }, raw: { amt: C.G } }),
        r('H', 'Projected 2025-26 WENR - DOE', C.H.toFixed(1)), r('I', 'Increase in enrollment', C.I.toFixed(1)), r('J', 'Percent Increase in Enrollment', (C.J * 100).toFixed(2) + '%'),
        { id: 'hdr', cls: 'section', cells: { line: '', name: 'Number of Students in each category, weighted:', amt: 'Students', w: 'Weight', c: 'Calculation' } },
        { id: 'K', cells: { line: 'K', name: 'Less than or equal to 1%', amt: +C.K.toFixed(1), w: '0.0', c: 0 } },
        { id: 'L', cells: { line: 'L', name: 'Greater than 1% and less than or equal to 2.5%', amt: +C.L.toFixed(1), w: '0.5', c: +(C.L * 0.5).toFixed(1) } },
        { id: 'M', cells: { line: 'M', name: 'Greater than 2.5% and less than or equal to 4%', amt: +C.M.toFixed(1), w: '0.75', c: +(C.M * 0.75).toFixed(1) } },
        { id: 'N', cells: { line: 'N', name: 'Greater than 4%', amt: +C.N.toFixed(1), w: '1.0', c: +C.N.toFixed(1) } },
        r('O', 'Weighted increase in number of students', +C.O.toFixed(1)),
        r('P', 'Enrollment Adjustment', C.P),
        r('Q', 'Prebudget year adjusted tax levy, including weighted increases for enrollment', C.Q, { cls: 'total' }),
        r('R', 'Prebudget year adjusted tax levy, including weighted increases for enrollment, inflated by 2%', C.R, { cls: 'total' })
      ];
      return frame(`${hdr()}<div class="formgrid">${B.grid({ id: 'ptlgrid', cols, rows, tall: true })}</div>
        <div class="flow formgrid">Line R becomes line A of the <a href="#/taxlevycap">Tax Levy Cap</a>. In the state software the WENR enrollment figures are supplied by the Department; here you can change them to see how an enrollment increase raises the cap.</div>`);
    }
  };

  /* ================= HEALTH CARE / PENSION / RESPONSIBILITY ================= */
  scr.healthcare = {
    title: 'Adjustment for Increase in Health Care Costs',
    render(M) {
      const C = M.calc.hc;
      const rows = [
        { section: 'Total 2026-27 Health Care Costs:' },
        { line: 'A1', name: 'Health Benefits', v: C.A1, fed: 'Appropriation line 71180, 2026-27' },
        { line: 'A2', name: 'Less 2026-27 Dental and Vision costs included in object 270', v: C.A2, ed: 'hc.A2' },
        { line: 'A3', name: 'Less 2026-27 Budgeted Withdrawal from Current Expense Emergency Reserve used for Health Care Costs', v: C.A3, ed: 'hc.A3' },
        { line: 'A4', name: 'Subtotal 2026-27 Health Care Costs', v: C.A4, total: true },
        { section: 'Total 2025-26 Health Care Costs - Original Budget:' },
        { line: 'B1', name: 'Health Benefits', v: C.B1, ed: 'hc.B1' },
        { line: 'B2', name: 'Less 2025-26 Dental and Vision costs included in object 270', v: C.B2, ed: 'hc.B2' },
        { line: 'B3', name: 'Less 2025-26 Budgeted Withdrawal from Current Expense Emergency Reserve used for Health Care Costs', v: C.B3, ed: 'hc.B3' },
        { line: 'B4', name: 'Subtotal 2025-26 Health Care Costs - Original Budget', v: C.B4, total: true },
        { line: 'C', name: 'Inflate 2025-26 Health Care Costs by 2%', v: C.C },
        { line: 'D', name: 'Increase in Health Care Costs', v: C.D },
        { line: 'E', name: 'SHBP percentage increase', v: C.E.toFixed(1) + '%', ed: 'hc.E', raw: C.E },
        { line: 'F', name: '2025-26 Health Care Costs multiplied by average percentage increase in SHBP over 2%', v: C.F },
        { line: 'G', name: 'Maximum Adjustment for Health Care Costs', v: C.G, total: true }
      ];
      return frame(`${hdr()}${formGrid('hcgrid', '', rows)}<div class="flow formgrid">Line G (the lesser of D and F) becomes line B of the <a href="#/taxlevycap">Tax Levy Cap</a>. Raise Health Benefits on Appropriation line 71180 and watch line A1, D and G change.</div>`);
    }
  };
  scr.pension = {
    title: 'Pension Contributions',
    render(M) {
      const C = M.calc.pen;
      return frame(`${hdr()}${formGrid('pengrid', '', [
        { line: 'A', name: '2026-27 Eligible Pension Contributions', v: C.A, ed: 'pen.A' },
        { line: 'B', name: '2025-26 Eligible Pension Contributions - Original Budget', v: C.B, ed: 'pen.B' },
        { line: 'C', name: '2025-26 Contributions Inflated by 2%', v: C.C },
        { line: 'D', name: 'Increase in Eligible Pension Contributions', v: C.D, total: true }])}`);
    }
  };
  function respScreen(kind) {
    const inc = kind === 'inc';
    return {
      title: inc ? 'Responsibility Assumed by District (Cap Increase)' : 'Responsibility Shifted to Another District or Entity(Cap Decrease)',
      render(M, S) {
        const list = S.inputs[inc ? 'respInc' : 'respDec'];
        const p = inc ? 'respInc' : 'respDec';
        const rows = list.map((x, i) => ({ id: i, cells: { no: i + 1, ent: x.entity || '', amt: B.n(x.amount), line: x.line || '', desc: x.desc || '', del: '' },
          ed: { ent: [p, String(i), 'entity'], amt: [p, String(i), 'amount'], line: [p, String(i), 'line'], desc: [p, String(i), 'desc'] }, txt: { ent: true, line: true, desc: true },
          html: { del: `<a href="#" data-del="${i}">remove</a>` } }));
        return frame(`${hdr()}${B.grid({ id: 'resp' + kind, cols: [{ k: 'no', label: 'No' }, { k: 'ent', label: inc ? 'Entity Shifting Responsibility' : 'Entity Taking Over Responsibility', w: 200 },
          { k: 'amt', label: inc ? 'New Amount in 2026~27' : '2025~26 Amount not recurring in 2026~27', num: true }, { k: 'line', label: inc ? 'Line Number Increased' : 'Line Number Reduced' }, { k: 'desc', label: 'Description of Circumstances', w: 220 }, { k: 'del', label: '' }], rows, tall: true })}
          <div class="toolbar"><button class="btn" data-add>Add Row</button></div>
          <div class="flow">The total ${inc ? 'increases' : 'decreases'} the <a href="#/taxlevycap">Tax Levy Cap</a> (line ${inc ? 'D' : 'E'}). Current total: <b>${money(inc ? M.calc.respInc : M.calc.respDec)}</b>.</div>`);
      },
      after(el, M, S) {
        const p = inc ? 'respInc' : 'respDec';
        el.querySelector('[data-add]').onclick = () => { S.inputs[p].push({ entity: '', amount: 0, line: '', desc: '' }); B.setPath(p, S.inputs[p]); };
        el.querySelectorAll('[data-del]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); S.inputs[p].splice(+a.getAttribute('data-del'), 1); B.setPath(p, S.inputs[p]); }));
      }
    };
  }
  scr.respinc = respScreen('inc');
  scr.respdec = respScreen('dec');

  /* ================= CAP BANKING / TAX LEVY CAP ================= */
  scr.capbanking = {
    title: 'Cap Banking Eligibility',
    render(M) {
      const H = B.REF.bankHistory, C = M.calc.bank;
      const cols = [{ k: 'line', label: 'Line' }, { k: 'name', label: 'Name', w: 260 }, { k: 'a', label: H.cols[0], num: true }, { k: 'b', label: H.cols[1], num: true }, { k: 'c', label: H.cols[2], num: true }, { k: 'd', label: 'Generated in 2026-27', num: true }];
      const row = (line, name, key, cur, extra) => Object.assign({ id: line || name, cells: { line, name, a: H[key] ? H[key][0] : '', b: H[key] ? H[key][1] : '', c: H[key] ? H[key][2] : '', d: cur } }, extra || {});
      const rows = [
        row('A', 'Prebudget Year Adjusted Tax Levy, including Weighted Increases for Enrollment, Inflated by 2%', 'A', C.A),
        { id: 'adj', cls: 'section', cells: { line: '', name: 'Cap Adjustments:', a: '', b: '', c: '', d: '' } },
        row('B', 'Increase in Health Care Costs', 'B', C.B), row('C', 'Increase in Normal and Accrued Pension Contribution (Deferred Pension)', 'C', C.C),
        row('D', 'Increase for Responsibility Assumed by District', 'D', C.D), row('E', 'Decrease for Responsibility Shifted to Another District or Entity', 'E', C.E),
        row('E1', 'Other Adjustments', 'E1', C.E1), row('E2', 'Increase in SDA Local Share (2024-25)', 'E2', 0),
        row('F', 'Tax Levy Cap', 'F', C.F, { cls: 'total' }), row('G', 'Tax Levy', 'G', C.G), row('G1', 'Adjustments to Levy', 'G1', 0),
        row('H', 'Banked Cap Available for Use in Next Three Years (Line F less Lines G and G1)', 'H', C.H, { cls: 'total' }),
        { id: 'I', cells: { line: 'I', name: 'Requested Use of Banked Cap in Prior Years', a: 0, b: 0, c: '', d: '' } },
        { id: 'J', cells: { line: 'J', name: 'Requested Use of Banked Cap in Current Year', a: C.used[0], b: C.used[1], c: C.used[2], d: '' } },
        { id: 'K', cells: { line: 'K', name: '(2023-24) Amount Expiring in 2026-27, (2026-27) Amount not available for future bank', a: H.K[0] - C.used[0], b: '', c: '', d: 0 } },
        { id: 'L', cells: { line: 'L', name: 'Available Banked Cap Carried Forward to Following Year', a: C.L[0], b: C.L[1], c: C.L[2], d: C.L[3] } },
        { id: 'M', cls: 'total', cells: { line: 'M', name: 'Banked Cap Available for 2027-28.', a: '', b: '', c: '', d: C.M } }
      ];
      return frame(`${hdr()}${B.grid({ id: 'cbgrid', cols, rows, tall: true })}<div class="flow">Banked cap available for use in 2026-27: <b>${money(M.calc.bankAvail)}</b> (the 2023-24 amount expires after this year). To use it, enter an amount on line H of the <a href="#/taxlevycap">Tax Levy Cap</a>. The oldest banked cap is used first.</div>`);
    }
  };
  scr.taxlevycap = {
    title: 'Tax Levy Cap',
    render(M) {
      const C = M.calc.cap;
      const rows = [
        { line: 'A', name: 'Prebudget year adjusted tax levy, including weighted increases for enrollment, inflated by 2%', v: C.A, fed: 'Prebudget Yr Levy screen, line R' },
        { line: 'B', name: 'Adjustment for increase in health care costs', v: C.B, fed: 'Health Care Costs screen, line G' },
        { line: 'C', name: 'Adjustment for increase in certain normal and accrued liability pension contributions (pension deferral)', v: C.C, fed: 'Deferred Pension screen, line D' },
        { line: 'D', name: 'Adjustment for responsibility assumed by district', v: C.D, fed: 'Responsibility Assumed screen' },
        { line: 'E', name: 'Adjustment for responsibility shifted to another district or entity', v: C.E, fed: 'Responsibility Shifted screen' },
        { line: 'F', name: 'Other Adjustments', v: C.F, ed: 'cap.F' },
        { line: 'G', name: 'Reserved', v: C.G },
        { line: 'H', name: 'Use of Banked Cap', v: C.H, ed: 'cap.H' },
        { line: 'I', name: 'Tax Levy Cap = sum (A) through (H)', v: C.I, total: true }
      ];
      const levy = M.rv(100), ok = levy <= C.I;
      return frame(`${hdr()}${formGrid('tlcgrid', '', rows)}<div class="formgrid"><p><b>Note:</b></p>
        <p>2026-27 tax levy recorded on line 100 of the budgeted revenues cannot exceed the amount on line I above. Any additional levy increases must be proposed separately to the voters or board of school estimate and be supported by interpretive statements.</p>
        <p class="flow">Revenue line 100 now: <b>${money(levy)}</b> &mdash; <span class="${ok ? 'ok' : 'bad'}">${ok ? `${money(C.I - levy)} under the cap` : `${money(levy - C.I)} OVER the cap`}</span></p></div>`);
    }
  };

  /* ================= SEPARATE PROPOSALS ================= */
  scr.separateproposal = {
    title: 'Separate Proposal',
    render(M, S) {
      const rows = S.inputs.sp.map((x, i) => ({ id: i, cells: { no: i + 1, desc: x.desc || '', amt: B.n(x.amount), perm: x.perm || 'Permanent', vote: x.vote || '', del: '' },
        ed: { desc: ['sp', String(i), 'desc'], amt: ['sp', String(i), 'amount'], perm: ['sp', String(i), 'perm'], vote: ['sp', String(i), 'vote'] }, txt: { desc: true, perm: true, vote: true },
        html: { del: `<a href="#" data-del="${i}">remove</a>` } }));
      return frame(`${hdr()}${B.grid({ id: 'spgrid', cols: [{ k: 'no', label: 'No' }, { k: 'desc', label: 'Description of Separate Proposal to be Presented to Voters at the 2026 School Election', w: 280 }, { k: 'amt', label: 'Amount', num: true, money: true }, { k: 'perm', label: 'Permanent Or Budget Year Only' }, { k: 'vote', label: 'Voter Approved or Rejected' }, { k: 'del', label: '' }], rows, tall: true })}
        <div class="toolbar"><button class="btn" data-add>Add Proposal</button></div>
        <div class="flow">The total of separate proposals goes to Revenue line 111 (Local Tax Levy - Separate Proposal for School Election), outside the tax levy cap. Remember to add the matching appropriations so the General Fund still balances. Current total: <b>${money(M.calc.sp.total)}</b>.</div>`);
    },
    after(el, M, S) {
      el.querySelector('[data-add]').onclick = () => { S.inputs.sp.push({ desc: '', amount: 0, perm: 'Permanent', vote: '' }); B.setPath('sp', S.inputs.sp); };
      el.querySelectorAll('[data-del]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); S.inputs.sp.splice(+a.getAttribute('data-del'), 1); B.setPath('sp', S.inputs.sp); }));
    }
  };
  scr.separateprior = { title: 'Separate Proposal Passed at Prior Special Election', render() { return frame(`${hdr()}${B.grid({ id: 'sppgrid', cols: [{ k: 'a', label: 'No' }, { k: 'b', label: 'Description of Separate Proposal Passed at Prior Special Election' }, { k: 'c', label: 'Amount' }], rows: [] })}<p class="note">No separate proposals were passed at a prior special election. Amounts here would go to Revenue line 112.</p>`); } };

  /* ================= TUITION ================= */
  scr.tuitionformula = {
    title: 'School District Budget Statement for School Year 2026~27',
    render(M) {
      const T = M.calc.tuition, a = T.fa, b = T.fb;
      const rows = [
        { id: 'h1', cls: 'section', cells: { r: '', l: 'FORMULA A - Building Use Charge', a: '' } },
        { id: 'A', cells: { r: '(A)', l: '890', a: a.A } }, { id: 'B', cells: { r: '(B)', l: '89600', a: a.B } }, { id: 'C', cells: { r: '(C)', l: '89620', a: a.C } },
        { id: 'D', cells: { r: '(D)', l: 'A1*', a: a.D } }, { id: 'E', cells: { r: '(E)', l: 'A2*', a: a.E } }, { id: 'F', cls: 'total', cells: { r: '(F)', l: 'Formula A* - Building Use Charge', a: a.F } },
        { id: 'n1', cells: { r: '', l: 'A1 = If (B) + (C) <= 0 or (A) equals 0, then 0%, otherwise ((A)/(B)+(C))', a: '' } },
        { id: 'n2', cells: { r: '', l: 'A2 = (B) * (D)/100', a: '' } },
        { id: 'n3', cells: { r: '', l: 'Formula A - Building Use Charge = If (B) - (E) <= 0, then $0, otherwise (B) - (E)', a: '' } },
        { id: 'h2', cls: 'section', cells: { r: '', l: 'FORMULA B - Allocated Costs - Other than between Home and School', a: '' } }
      ];
      Object.keys(b).forEach((k) => rows.push({ id: k, cells: { r: '(' + k + ')', l: String(b[k].line), a: b[k].v } }));
      rows.push({ id: 'O', cells: { r: '(O)', l: 'B1*', a: T.O } }, { id: 'P', cls: 'total', cells: { r: '(P)', l: 'Formula B* - Allocated Costs', a: T.P } },
        { id: 'n4', cells: { r: '', l: 'B1 = (D) / TOTAL((A) + (B) + (C) + (D) + (E) + (F))', a: '' } },
        { id: 'n5', cells: { r: '', l: 'Formula B - Allocated Costs = (O) * TOTAL((G) + (H) + (I) + (J) + (K) + (L) + (M) + (N))', a: '' } });
      return frame(`${hdr()}<div class="formgrid">${B.grid({ id: 'tfgrid', cols: [{ k: 'r', label: 'Row Num #' }, { k: 'l', label: 'Line No.' }, { k: 'a', label: 'Amount', num: true }], rows, tall: true })}</div>
        <p class="note formgrid">Uses the 2025-26 revised column of Revenues and Appropriations. Change those lines to see the formulas move.</p>`);
    }
  };
  scr.tuitionrates = {
    title: 'Estimated Tuition Calculation',
    render() {
      const raw = D.tuitionSnapshot.split('\n').filter((l) => l.startsWith('1345|') || l.startsWith('|||'));
      const head = raw[0].split('|').slice(7);
      const cols = [{ k: 'n', label: 'Enrollments', w: 240 }, { k: 'ac', label: 'Account' }, { k: 'ln', label: 'Line No' }, { k: 'tot', label: 'Total', num: true }].concat(head.slice(0, 15).map((h, i) => ({ k: 'c' + i, label: h, num: true })));
      const rows = raw.slice(1).map((l, i) => {
        const f = l.split('|'); const cells = { n: f[2], ac: f[3] === '~' ? '' : f[3], ln: f[4] === '~' ? '' : f[4], tot: f[6] === undefined ? '' : (isNaN(+f[6]) ? f[6] : +f[6]) };
        for (let j = 0; j < 15; j++) { const v = f[7 + j]; cells['c' + j] = v === undefined || v === '~' ? '' : (isNaN(+v) ? v : +v); }
        return { id: i, cells, cls: /Total|Grand|Cost Per Pupil/.test(f[2]) ? 'total' : '' };
      });
      return frame(`<div class="screen-title">Estimated Tuition Calculation<br>Estimated Calculated Rates for All Programs</div>${hdr()}
        <p class="tip">Display only in the simulator: this is the district's 2026-27 calculation as captured. In the state software, costs from the 2025-26 revised budget are spread across programs using enrollment ratios (A = regular, B = all, C = special education), then inflated and divided by enrollment to get a cost per pupil.</p>
        ${B.grid({ id: 'trgrid', cols, rows })}`);
    }
  };

  /* ================= SUPPORTING DOCUMENTATION ================= */
  scr.priorities = {
    title: 'Statements of Priorities and NJSLS',
    render(M, S) {
      return frame(`${hdr()}<div class="formgrid"><p>Describe the district's budget priorities for 2026-27 and how the budget supports the New Jersey Student Learning Standards (NJSLS).</p>
        <textarea data-pri rows="10" style="width:100%" placeholder="Priority 1: ...">${esc(S.inputs.priorities)}</textarea>
        <p class="note">Practice space. In the state software each priority is entered with a description and how it is funded.</p></div>`);
    },
    after(el) { el.querySelector('[data-pri]').onchange = (e) => B.setPath('priorities', e.target.value); }
  };
  scr.contracts = {
    title: 'Contract Information for Select Staff',
    render(M, S) {
      const rows = S.inputs.contracts.map((x, i) => ({ id: i, cells: { pos: x.pos || '', base: B.n(x.base), ben: B.n(x.ben), allow: B.n(x.allow), term: x.term || '', del: '' },
        ed: { pos: ['contracts', String(i), 'pos'], base: ['contracts', String(i), 'base'], ben: ['contracts', String(i), 'ben'], allow: ['contracts', String(i), 'allow'], term: ['contracts', String(i), 'term'] },
        txt: { pos: true, term: true }, html: { del: `<a href="#" data-del="${i}">remove</a>` } }));
      return frame(`${hdr()}<p class="tip">The real district's contract details are not included. Practice by adding positions with made-up amounts (for example, Superintendent or School Business Administrator).</p>
        ${B.grid({ id: 'ctgrid', cols: [{ k: 'pos', label: 'Position', w: 200 }, { k: 'base', label: 'Base Salary', num: true }, { k: 'ben', label: 'Benefits', num: true }, { k: 'allow', label: 'Allowances', num: true }, { k: 'term', label: 'Contract Term' }, { k: 'del', label: '' }], rows, tall: true })}
        <div class="toolbar"><button class="btn" data-add>Add Position</button></div>`);
    },
    after(el, M, S) {
      el.querySelector('[data-add]').onclick = () => { S.inputs.contracts.push({ pos: '', base: 0, ben: 0, allow: 0, term: '' }); B.setPath('contracts', S.inputs.contracts); };
      el.querySelectorAll('[data-del]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); S.inputs.contracts.splice(+a.getAttribute('data-del'), 1); B.setPath('contracts', S.inputs.contracts); }));
    }
  };
  scr.perpupil = {
    title: 'Per Pupil Costs',
    render(M) {
      const rows = M.calc.perPupil.map((r) => ({ id: r.id, cells: { i: r.id, n: r.name, a: r.vals[0], b: r.vals[1], c: r.vals[2], d: r.vals[3], e: r.y3 }, title: { e: r.est ? 'Estimated in the simulator from the related appropriations' : 'Calculated (same as Administrative Cost Limit line 9999)' } }));
      return frame(`${B.grid({ id: 'ppgrid', cols: [{ k: 'i', label: 'IndCol' }, { k: 'n', label: 'Per Pupil Cost Calculations', w: 260 }, { k: 'a', label: '2023~24 Actual Costs', num: true }, { k: 'b', label: '2024~25 Actual Costs', num: true }, { k: 'c', label: '2025~26 Original Budget', num: true }, { k: 'd', label: '2025~26 Revised Budget', num: true }, { k: 'e', label: '2026~27 Proposed Budget', num: true }], rows, tall: true })}
        <p class="note">Total Administrative Costs (IND8PP) is calculated exactly. The other 2026~27 indicators are estimated: they start at the district's reported values and move in proportion to the related appropriations and enrollment.</p>`);
    }
  };
  scr.admincost = {
    title: 'Administrative Cost Limit',
    render(M, S) {
      const A = M.calc.acl;
      const cols = [{ k: 'l', label: 'LineNo' }, { k: 'n', label: 'Administrative Cost', w: 240 }, { k: 'ac', label: 'Account#' }, { k: 'y2', label: '2025~26 Revised Budget', num: true }, { k: 'ap', label: '2025~26 Approved Change', num: true }, { k: 'r', label: 'Reason for Increase/Decrease' }, { k: 'lim', label: '2026~27 Regional Limit', num: true }, { k: 'y3', label: '2026~27 Budget', num: true }];
      const rows = [];
      A.groups.forEach((g) => {
        rows.push({ id: g.title, cls: 'section', cells: { l: '', n: g.title, ac: '', y2: '', ap: '', r: '', lim: '', y3: '' } });
        g.lines.forEach((x) => rows.push({ id: x.line, cells: { l: x.line, n: x.name, ac: x.acct, y2: x.y2, ap: x.approved, r: '', lim: x.limit, y3: x.y3 }, ed: { ap: ['acl', String(x.line)] } }));
        rows.push({ id: g.subLine, cls: 'total', cells: { l: g.subLine, n: g.subName, ac: '', y2: g.y2, ap: g.approved, r: '', lim: g.limit, y3: g.y3 } });
      });
      rows.push({ id: 'ben', cls: 'section', cells: { l: '', n: 'Benefits', ac: '', y2: '', ap: '', r: '', lim: '', y3: '' } });
      rows.push({ id: 'unal', cells: { l: '', n: 'Unallocated', ac: '', y2: A.ben2, ap: A.ben2, r: '', lim: A.benLimit, y3: A.ben3 }, title: { y3: 'Share of unallocated benefits (line 71240) in proportion to administrative salaries' } });
      rows.push({ id: 9998, cls: 'total', cells: { l: 9998, n: 'Total Administrative Costs(A1)', ac: '', y2: A.A1y2, ap: A.A1appr, r: '', lim: A.limitTotal, y3: A.A1y3 } });
      rows.push({ id: 'enr', cls: 'total', cells: { l: '', n: 'Total Enrollment for Per Pupil Calculation(A2)', ac: '', y2: 2468, ap: 2468, r: '', lim: A.enr, y3: A.enr }, fed: { y3: 'Enrollment screen' } });
      rows.push({ id: 9999, cls: 'total', cells: { l: 9999, n: 'Total Administrative Costs per Pupil = A1 / A2', ac: '', y2: A.perPupilY2, ap: A.perPupilAppr, r: '', lim: A.limitPerPupil, y3: A.perPupil } });
      const ok = A.perPupil <= A.limitPerPupil;
      return frame(`${B.grid({ id: 'aclgrid', cols, rows })}<div class="flow">Administrative lines come straight from Appropriations (lines 45000-47600). Budgeted cost per pupil: <b>$${A.perPupil.toLocaleString()}</b> vs. limit <b>$${A.limitPerPupil.toLocaleString()}</b> &mdash; <span class="${ok ? 'ok' : 'bad'}">${ok ? 'within the limit' : 'over the limit'}</span>.
        <br><span class="note">Simulator note: the unallocated benefit share is an estimate calibrated to this district's 2026-27 figure, and the limit is simplified to the regional limit per pupil.</span></div>`);
    }
  };
  scr.benefits = {
    title: 'Employee Benefits',
    render(M, S) {
      const objs = [['Group Insurance', 210, 71000], ['Social Security Contribution', 220, 71020], ['T.P.A.F. Contribution - ERIP', 232, 71040], ['T.P.A.F./PERS-Special Assessment', 233, 71050],
        ['Other Retirement Contributions - PERS', 241, 71060], ['Other Retirement Contributions - ERIP', 242, 71080], ['Other Retirement Contributions - Deferred PERS Pymt', 248, 71100],
        ['Other Retirement Contributions - Regular', 249, 71120], ['Unemployment Compensation', 250, 71140], ["Workmen's Compensation", 260, 71160], ['Health Benefits', 270, 71180],
        ['Tuition Reimbursement', 280, 71200], ['Other Employee Benefits', 290, 71220], ['Unused Sick Payment to Terminated/Retired Staff - Mass Severance', 297, 71225],
        ['Unused Vacation Payment to Terminated/Retired Staff - Mass Severance', 298, 71226], ['Unused Sick Payment to Terminated/Retired Staff', 299, 71227]];
      const rows = objs.map(([n, o, l]) => ({ id: l, cells: { n, o, a: M.av(l, 'y1'), b: M.av(l, 'y2'), c: M.av(l, 'y3') }, fed: { c: 'Appropriation line ' + l } }));
      rows.push({ id: 'tot', cls: 'total', cells: { n: 'Totals', o: '', a: M.av(71240, 'y1'), b: M.av(71240, 'y2'), c: M.av(71240, 'y3') } });
      rows.push({ id: 'hs', cls: 'section', cells: { n: 'Health Benefits Summary', o: '', a: '', b: '', c: '' } });
      rows.push({ id: 'A', cells: { n: 'A District Share', o: '', a: M.av(71180, 'y1'), b: M.av(71180, 'y2'), c: M.av(71180, 'y3') } });
      rows.push({ id: 'Bs', cells: { n: 'B Total Employee Share', o: '', a: 1309163, b: 1244084, c: B.n(S.inputs.ben.empShare) }, ed: { c: 'ben.empShare' } });
      rows.push({ id: 'C', cls: 'total', cells: { n: 'C Total Health Benefits Costs', o: '', a: M.av(71180, 'y1') + 1309163, b: M.av(71180, 'y2') + 1244084, c: M.av(71180, 'y3') + B.n(S.inputs.ben.empShare) } });
      return frame(`${hdr()}${B.grid({ id: 'bengrid', cols: [{ k: 'n', label: '', w: 280 }, { k: 'o', label: 'Object' }, { k: 'a', label: '2024-25 Expenditures', num: true }, { k: 'b', label: '2025-26 Appropriations', num: true }, { k: 'c', label: '2026-27 Appropriations', num: true }], rows, tall: true })}`);
    }
  };
  scr.shared = {
    title: 'Shared Services',
    render(M, S) {
      const rows = S.inputs.shared.map((x, i) => ({ id: i, cells: { row: i + 1, d: D.district.id, t: x.type, desc: x.desc, s: B.n(x.saved) }, ed: { t: ['shared', String(i), 'type'], desc: ['shared', String(i), 'desc'], s: ['shared', String(i), 'saved'] }, txt: { t: true, desc: true } }));
      return frame(`${B.grid({ id: 'ssgrid', cols: [{ k: 'row', label: 'Row' }, { k: 'd', label: 'District Id' }, { k: 't', label: 'Shared Service Category Type', w: 200 }, { k: 'desc', label: 'Shared Service Category Description', w: 320 }, { k: 's', label: 'Amount Saved(Optional)', num: true, money: true }], rows, tall: true })}
        <div class="toolbar"><button class="btn" data-add>Add Row</button></div>`);
    },
    after(el, M, S) { el.querySelector('[data-add]').onclick = () => { S.inputs.shared.push({ type: '', desc: '', saved: 0 }); B.setPath('shared', S.inputs.shared); }; }
  };
  scr.unusual = {
    title: 'Unusual Revenues and Appropriations',
    render(M) {
      const rows = D.revenues.filter((r) => !B.REV.kids[r.line]).map((r) => ({ id: 'r' + r.line, cells: { l: r.line, a: r.acct, d: r.title, v: M.rv(r.line) } }))
        .concat(D.appropriations.filter((r) => !B.APP.kids[r.line] && M.av(r.line) !== 0).map((r) => ({ id: 'a' + r.line, cells: { l: r.line, a: r.acct, d: r.title, v: M.av(r.line) } })));
      return frame(`${hdr()}<p class="note">In the state software, the district selects any revenue or appropriation that is unusual and explains it. This list shows revenue lines and non-zero appropriation lines.</p>
        ${B.grid({ id: 'urgrid', cols: [{ k: 'l', label: 'Line Number' }, { k: 'a', label: 'Account' }, { k: 'd', label: 'Description', w: 300 }, { k: 'v', label: 'Amount', num: true }], rows })}`);
    }
  };
  scr.equipment = {
    title: 'Equipment',
    render(M) {
      const rows = D.appropriations.filter((r) => r.line >= 73000 && r.line < 75880).map((r) => ({ id: r.line, cells: { l: r.line, d: r.title, a: r.acct, dw: M.av(r.line), sb: 0, t: M.av(r.line) }, fed: { dw: 'Appropriation line ' + r.line } }));
      return frame(`${hdr()}${B.grid({ id: 'eqgrid', cols: [{ k: 'l', label: 'Line Number' }, { k: 'd', label: 'Description', w: 260 }, { k: 'a', label: 'Account' }, { k: 'dw', label: '2026-27 District - Wide Appropriation', num: true }, { k: 'sb', label: '2026-27 School - Based Appropriation', num: true }, { k: 't', label: 'Total Appropriation Amount', num: true }], rows })}`);
    }
  };

  /* ================= ENROLLMENT ================= */
  scr.enrollment = {
    title: 'Enrollment (regular)',
    render(M, S) {
      const E = M.calc.enr;
      const cols = [{ k: 'line', label: 'Line' }, { k: 'name', label: 'Subtitle', w: 240 }].concat(['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((c) => ({ k: c, label: c, num: true })))
        .concat([{ k: 'H', label: 'H', num: true }, { k: 'I', label: 'I', num: true }, { k: 'J', label: 'J', num: true }, { k: 'K', label: 'K', num: true }, { k: 'L', label: 'L', w: 160 }]);
      const subs = ['9', '22', '25', '33'];
      const head = { id: 'h', cls: 'section', cells: { line: 'Short', name: 'Enrollment Categories', A: 'On Roll Full', B: 'On Roll Shared', C: 'Sent Full', D: 'Sent Shared', E: 'Received Full', F: 'Received Shared', G: 'Private Schools for the Disabled', H: '10/15/2026 Resident Students', I: '10/15/2025 Resident Students', J: 'Increase (Decrease)', K: 'Increase % (Decrease %)', L: 'Explanation' } };
      const rows = [head].concat(E.rows.map((r) => {
        const o = { id: r.no, cls: subs.includes(r.line) ? 'total' : '', cells: { line: r.line, name: r.name, H: r.H === null || r.H === undefined ? '-' : r.H, I: r.Ival === null ? '-' : r.Ival, J: r.J === null ? '' : r.J, K: r.K === null ? '' : r.K, L: r.L === '-' ? '-' : (r.L || '') }, ed: {}, txt: { L: true } };
        ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((c, i) => {
          const v = r.v[i];
          o.cells[c] = v === null ? '-' : v;
          if (v !== null && !subs.includes(r.line) && !['33'].includes(r.line)) o.ed[c] = ['enr', r.no + '_' + i];
        });
        if (r.L !== '-') o.ed.L = ['enrExpl', String(r.no)];
        return o;
      }));
      const g = E.growthPct;
      return frame(`<div class="screen-title">Enrollment Table (Regular District)</div>${hdr2()}
        <div class="hdrline"><span>DOE Growth Rate: ${E.rate}%</span><span>Acceptable range from : ${E.growthLow}% to ${E.growthHigh}%</span></div>
        ${B.grid({ id: 'enrgrid', cols, rows })}
        <div class="flow">Column H = A + &frac12;B + C + &frac12;D + G &minus; E &minus; &frac12;F. Line 25 growth: <b class="${g < E.growthLow || g > E.growthHigh ? 'bad' : 'ok'}">${g}%</b>. Enrollment for the <a href="#/admincost">Administrative Cost Limit</a> = lines 9 and 22 (on roll, plus half of shared time) less charter school students (line 35): <b>${E.adminEnrollment}</b>.</div>`);
    }
  };

  /* ================= TAX LEVY CERTIFICATION ================= */
  scr.a4f = {
    title: 'Tax Levy Certification (A4F)',
    render(M) {
      const T = M.calc.tlc;
      const rows = T.rows.map((r, i) => {
        const o = { id: i, cells: { n: r.name, c: r.cert, b: r.bal, a: r.col2, t: r.total, r: r.remain } };
        if (i === 0) { o.ed = { a: 'tlc.gfCol2' }; }
        if (i === 3) { o.ed = { b: 'tlc.dsBalance', a: 'tlc.dsCol2' }; }
        return o;
      });
      rows.push({ id: 'tot', cls: 'total', cells: { n: 'TOTALS', c: T.tot.cert, b: T.tot.bal, a: T.tot.col2, t: T.tot.total, r: T.tot.remain } });
      rows.push({ id: 'late', cells: { n: 'Tax certification of prior year received too late for 2025 levy', c: '', b: '', a: '', t: B.n(B.S.inputs.tlc.lateCert), r: '' }, ed: { t: 'tlc.lateCert' } });
      rows.push({ id: 'oth', cells: { n: 'OTHER*', c: '', b: '', a: '', t: B.n(B.S.inputs.tlc.other), r: '' }, ed: { t: 'tlc.other' } });
      rows.push({ id: 'gt', cls: 'total', cells: { n: 'GRAND TOTAL', c: '', b: '', a: '', t: T.grand, r: '' } });
      return frame(`${hdr()}${B.grid({ id: 'a4fgrid', cols: [{ k: 'n', label: 'Accounts', w: 300 }, { k: 'c', label: 'Tax Levy Certified by: (2026-27)', num: true }, { k: 'b', label: 'Balance of levy (Jan-Jun 2026)', num: true }, { k: 'a', label: 'Amt in Col 2 (Jul-Dec 2026)', num: true }, { k: 't', label: 'TOTAL 2026', num: true }, { k: 'r', label: 'Remaining (Jan-Jun 2027)', num: true }], rows, tall: true })}
        <div class="flow">The municipality collects school taxes on a calendar year. Calendar 2026 = the unpaid half of the 2025-26 levy + the part of the 2026-27 levy collected July to December. The General Fund certified amount comes from Revenue line 114; Debt Service from line 860.</div>`);
    }
  };
  scr.taxrate = {
    title: 'Estimated Tax Rate Information',
    render(M) {
      const R = M.calc.rate;
      const rows = [
        { line: '', name: 'Municipality', v: 'ELMWOOD PARK BOR', html: 'ELMWOOD PARK BOR' },
        { section: 'Estimated 26-27 School Tax Rate (net valuation taxable)' },
        { line: 'A', name: 'Calendar year General Fund levy (A4F)', v: R.gf },
        { line: 'B', name: 'Net valuation taxable', v: R.assessed, ed: 'rate.assessed' },
        { line: 'C', name: 'General Fund tax rate per $100 (A / B x 100)', v: R.gfRate, total: true },
        { line: 'D', name: 'Total calendar year levy including debt service (A4F grand total)', v: R.all },
        { line: 'E', name: 'Total school tax rate per $100 (D / B x 100)', v: R.allRate, total: true },
        { section: 'Estimated 26-27 Equalized School Tax Rate' },
        { line: 'F', name: 'Equalized valuation', v: R.equalized, ed: 'rate.equalized' },
        { line: 'G', name: 'General Fund equalized rate (A / F x 100)', v: R.gfEq, total: true },
        { line: 'H', name: 'Total equalized rate (D / F x 100)', v: R.allEq, total: true }
      ];
      return frame(`${hdr()}${formGrid('trgrid2', '', rows)}<p class="note formgrid">Simulator layout: the state screen shows these same amounts in one long row.</p>`);
    }
  };

  /* ================= EDIT REPORT ================= */
  scr.editreport = {
    title: 'Edit Check Report',
    render(M) {
      const list = M.edits.filter((e) => e.failing);
      const fatal = list.filter((e) => e.type === 'Fatal'), warn = list.filter((e) => e.type === 'Warning');
      const rows = fatal.concat(warn).map((e) => ({ id: e.id, cells: { id: e.id, t: e.type, m: e.msg, v: e.ver }, wrap: { m: true, v: true }, html: { t: `<span class="${e.type === 'Fatal' ? 'bad' : 'warnc'}"><b>${e.type}</b></span>`, id: `<a href="#/${e.screen}">${e.id}</a>` } }));
      return frame(`<p><b><span class="bad">IMPORTANT:</span></b> Please note that repeated running of the edits in rapid succession may result in the Budget application freezing in the state software. <i>(In the simulator the edits run instantly every time you open this screen.)</i></p>
        ${hdr2()}${rows.length ? B.grid({ id: 'ergrid', cols: [{ k: 'id', label: 'Id' }, { k: 't', label: 'Type' }, { k: 'm', label: 'Message', w: 380 }, { k: 'v', label: 'Verification', w: 300 }], rows }) : '<p class="ok big" style="text-align:center">No edits found.</p>'}
        <p class="warnc"><b>Total warning numbers: ${warn.length}</b></p><p class="bad"><b>Total fatal numbers: ${fatal.length}</b></p>
        <p class="note">Fatal edits must be fixed before the budget can be submitted. Warnings should be reviewed. Click an Id to go to the screen involved.</p>
        <div class="bottombar"><button class="btn" onclick="window.print()">Export PDF</button></div>`);
    }
  };

  /* ================= COUNTY REVIEW (simulator scorecard) ================= */
  scr.county = {
    title: 'County Review and Approval',
    render(M, S) {
      return frame(`${hdr()}<div class="report">${B.Modes.scorecardHtml(M, S, true)}</div>`);
    },
    after(el, M, S) {
      const b = el.querySelector('[data-approve]');
      if (b) b.onclick = () => { S.guided.approveTried = true; B.save(); B.render(); };
    }
  };

  /* ================= REPORTS ================= */
  function summary(M) {
    const rv = M.rv, av = M.av;
    const y = ['y1', 'y2', 'y3'];
    const g = (f) => y.map((c) => f(c));
    const R = {
      revenue: [
        ['Local Tax Levy', g((c) => rv(114, c))], ['Other Local Revenue', g((c) => rv(370, c) - rv(114, c))], ['State Aid', g((c) => rv(520, c))],
        ['Federal Aid', g((c) => rv(570, c))], ['Budgeted Fund Balance', g((c) => rv(580, c))], ['Withdrawals from Reserves', g((c) => rv(720, c) - rv(370, c) - rv(400, c) - rv(520, c) - rv(570, c) - rv(580, c) - rv(710, c) - rv(715, c))],
        ['Prior Year Encumbrances / Other', g((c) => rv(710, c) + rv(715, c) + rv(400, c))]
      ],
      approp: [
        ['Regular Instruction', g((c) => av(3200, c))], ['Special Education Instruction', g((c) => av(10300, c))], ['Basic Skills / Bilingual / Vocational', g((c) => av(11160, c) + av(12160, c) + av(13160, c))],
        ['School-Sponsored Activities and Athletics', g((c) => av(17100, c) + av(17600, c))], ['Other Instructional Programs', g((c) => av(19620, c) + av(20620, c) + av(21620, c) + av(22620, c) + av(23620, c) + av(25100, c) + av(27100, c))],
        ['Tuition (Undistributed Instruction)', g((c) => av(29180, c))], ['Student and Instruction Related Services', g((c) => av(29680, c) + av(30620, c) + av(40580, c) + av(41080, c) + av(41660, c) + av(42200, c) + av(43200, c) + av(43620, c) + av(44180, c))],
        ['General and School Administration, Central Services, Admin IT', g((c) => av(45300, c) + av(46160, c) + av(47200, c) + av(47620, c))],
        ['Operations and Maintenance of Plant', g((c) => av(51120, c))], ['Student Transportation', g((c) => av(52480, c))], ['Employee Benefits', g((c) => av(71260, c))],
        ['Reserve Deposits and Other', g((c) => av(72260, c) - av(72140, c) - av(3200, c) - av(10300, c) - av(11160, c) - av(12160, c) - av(13160, c) - av(17100, c) - av(17600, c) - av(19620, c) - av(20620, c) - av(21620, c) - av(22620, c) - av(23620, c) - av(25100, c) - av(27100, c))],
        ['Capital Outlay', g((c) => av(76400, c))], ['Transfer to Charter Schools', g((c) => av(84000, c) + av(84005, c))]
      ],
      gfRev: g((c) => rv(720, c)), gfApp: g((c) => av(84060, c)), srRev: g((c) => rv(840, c)), srApp: g((c) => av(88760, c)), dsRev: g((c) => rv(935, c)), dsApp: g((c) => av(89980, c)),
      totRev: g((c) => rv(1000, c)), totApp: g((c) => av(90000, c))
    };
    return R;
  }
  const tr3 = (label, v, cls) => `<tr class="${cls || ''}"><td>${esc(label)}</td>${v.map((x) => `<td class="num">${money(x)}</td>`).join('')}</tr>`;
  scr.ufb = {
    title: 'User Friendly Budget Summary',
    render(M) {
      const R = summary(M), C = M.calc;
      return frame(`<div class="report"><h2>${D.district.name} &mdash; User Friendly Budget Summary 2026-27 (Simulator)</h2>
        <p class="note" style="text-align:center">Generated from the simulator data. The state software produces this as a PDF to post on the district website.</p>
        <h3>General Fund Revenues</h3><table><tr><th></th><th class="num">2024-25 Actual</th><th class="num">2025-26 Revised</th><th class="num">2026-27 Proposed</th></tr>
        ${R.revenue.map((r) => tr3(r[0], r[1])).join('')}${tr3('Total General Fund Revenues', R.gfRev, 't')}</table>
        <h3>General Fund Appropriations</h3><table><tr><th></th><th class="num">2024-25 Actual</th><th class="num">2025-26 Revised</th><th class="num">2026-27 Proposed</th></tr>
        ${R.approp.map((r) => tr3(r[0], r[1])).join('')}${tr3('Total General Fund Appropriations', R.gfApp, 't')}</table>
        <h3>Key Facts</h3><table>
        <tr><td>2026-27 General Fund tax levy</td><td class="num">${money(M.rv(114))}</td></tr>
        <tr><td>Change from 2025-26</td><td class="num">${money(M.rv(114) - M.rv(114, 'y2'))} (${pct(M.rv(114), M.rv(114, 'y2'))})</td></tr>
        <tr><td>Tax levy cap</td><td class="num">${money(C.cap.I)}</td></tr>
        <tr><td>Estimated general fund tax rate per $100</td><td class="num">${C.rate.gfRate}</td></tr>
        <tr><td>Unassigned fund balance, June 30, 2027 (estimated)</td><td class="num">${money(M.recap[8].y3)}</td></tr>
        <tr><td>Administrative cost per pupil</td><td class="num">$${C.acl.perPupil.toLocaleString()}</td></tr>
        <tr><td>Resident enrollment (10/15/2026 projected)</td><td class="num">${C.enr.byLine['33'].H}</td></tr></table>
        <div class="bottombar"><button class="btn" onclick="window.print()">Print / Save as PDF</button></div></div>`);
    }
  };
  scr.advertised = {
    title: 'Advertised Budget',
    render(M) {
      const R = summary(M), C = M.calc;
      const fundRow = (nm, r, a) => `<tr><td>${nm}</td>${r.map((x) => `<td class="num">${money(x)}</td>`).join('')}</tr>`;
      const totLines = D.appropriations.filter((r) => B.APP.kids[r.line] && r.line < 84060 && M.av(r.line, 'y3') + M.av(r.line, 'y2') !== 0 && /^TOTAL/.test(r.title)).slice(0, 60);
      return frame(`<div class="report"><h2>${D.district.name} &mdash; Advertised Budget 2026-27 (Simulator)</h2>
        <h3>Summary by Fund</h3><table><tr><th></th><th class="num">2024-25 Actual</th><th class="num">2025-26 Revised</th><th class="num">2026-27 Proposed</th></tr>
        ${fundRow('General Fund Revenues', R.gfRev)}${fundRow('General Fund Appropriations', R.gfApp)}${fundRow('Special Revenue Revenues', R.srRev)}${fundRow('Special Revenue Appropriations', R.srApp)}
        ${fundRow('Debt Service Revenues', R.dsRev)}${fundRow('Debt Service Appropriations', R.dsApp)}${tr3('Total Revenues', R.totRev, 't')}${tr3('Total Appropriations', R.totApp, 't')}</table>
        <h3>Tax Levy</h3><table><tr><td>General Fund Tax Levy</td><td class="num">${money(M.rv(114))}</td></tr><tr><td>Debt Service Tax Levy</td><td class="num">${money(M.rv(860))}</td></tr>
        <tr><td>Separate proposal(s)</td><td class="num">${money(M.rv(111))}</td></tr><tr class="t"><td>Total Tax Levy</td><td class="num">${money(M.rv(114) + M.rv(860))}</td></tr></table>
        <h3>Advertised Appropriation Totals with Explanations</h3><table><tr><th>Line</th><th>Title</th><th class="num">2025-26</th><th class="num">2026-27</th><th>Explanation</th></tr>
        ${totLines.map((r) => { const ex = B.S.inputs.expl['app' + r.line] !== undefined ? B.S.inputs.expl['app' + r.line] : r.expl; return `<tr><td>${r.line}</td><td>${esc(r.title)}</td><td class="num">${money(M.av(r.line, 'y2'))}</td><td class="num">${money(M.av(r.line, 'y3'))}</td><td>${esc(ex)}</td></tr>`; }).join('')}</table>
        <div class="bottombar"><button class="btn" onclick="window.print()">Print / Save as PDF</button></div></div>`);
    }
  };
  scr.printable = {
    title: 'Printable PDF',
    render(M) {
      const rows = (list, T, get) => list.filter((r) => get(r.line, 'y3') || get(r.line, 'y2') || get(r.line, 'y1')).map((r) => `<tr class="${T.kids[r.line] ? 't' : ''}"><td>${r.line}</td><td>${esc(r.title)}</td><td>${esc(r.acct)}</td><td class="num">${money(get(r.line, 'y1'))}</td><td class="num">${money(get(r.line, 'y2'))}</td><td class="num">${money(get(r.line, 'y3'))}</td></tr>`).join('');
      return frame(`<div class="report" style="max-width:1100px"><h2>${D.district.name} &mdash; Budget Statement 2026-27 (Simulator printout)</h2>
        <p class="note noprint">Lines with all zero amounts are left out. Use your browser's Print to save as PDF.</p><div class="bottombar noprint"><button class="btn" onclick="window.print()">Print / Save as PDF</button></div>
        <h3>Revenues</h3><table><tr><th>Line</th><th>Title</th><th>Account</th><th class="num">2024-25</th><th class="num">2025-26</th><th class="num">2026-27</th></tr>${rows(D.revenues, B.REV, M.rv)}</table>
        <h3>Appropriations</h3><table><tr><th>Line</th><th>Title</th><th>Account</th><th class="num">2024-25</th><th class="num">2025-26</th><th class="num">2026-27</th></tr>${rows(D.appropriations, B.APP, M.av)}</table>
        <h3>Recapitulation of Balances</h3><table>${B.RECAP.map((r) => `<tr class="${/^Ending/.test(r.name) ? 't' : ''}"><td>${r.id}</td><td>${esc(r.name)}</td><td class="num">${money(M.recap[r.id].y1)}</td><td class="num">${money(M.recap[r.id].y2)}</td><td class="num">${money(M.recap[r.id].y3)}</td></tr>`).join('')}</table></div>`);
    }
  };
  scr.results = {
    title: 'Results',
    render(M, S) { return frame(`<div class="report">${B.Modes.resultsHtml(M, S)}</div>`); },
    after(el, M, S) { const n = el.querySelector('[data-student]'); if (n) n.onchange = (e) => { S.student = e.target.value; B.save(); }; }
  };
})();
