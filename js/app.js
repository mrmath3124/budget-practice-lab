/* Budget Practice Lab - shell: state, storage, menus, router, grid component. */
(function () {
  'use strict';
  const B = window.BPL;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s === null || s === undefined ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (v) => (v === null || v === undefined || v === '' ? '' : typeof v === 'number' ? (Number.isInteger(v) ? v.toLocaleString('en-US') : v.toLocaleString('en-US', { maximumFractionDigits: 4 })) : v);
  const money = (v) => (v === null || v === undefined ? '' : '$' + Math.round(v).toLocaleString('en-US'));
  const pct = (a, b) => (b ? ((a - b) / b * 100).toFixed(2) + '%' : (a ? '100.00%' : '0.00%'));
  function parseNum(s) {
    if (s === null || s === undefined) return 0;
    let t = String(s).trim();
    if (t === '') return 0;
    let neg = false;
    if (/^\(.*\)$/.test(t)) { neg = true; t = t.slice(1, -1); }
    t = t.replace(/[$,\s%]/g, '');
    let v = Number(t);
    if (isNaN(v)) return null;
    return neg ? -v : v;
  }

  /* ---------------- storage (per mode / scenario) ---------------- */
  const store = {
    get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  const S = {
    mode: 'home', scenarioId: null, inputs: B.defaultInputs(), M: null, guided: { step: 0, done: {} },
    student: '', ui: { appPage: 1, hide: {}, panel: true, panelMin: false }, prevVals: {}, lastEdit: null
  };
  B.S = S;
  const key = () => 'bpl.v1.' + S.mode + (S.scenarioId ? '.' + S.scenarioId : '');
  function save() {
    if (S.mode === 'home') return;
    store.set(key(), { inputs: S.inputs, guided: S.guided, student: S.student, savedAt: new Date().toISOString() });
    store.set('bpl.v1.last', { mode: S.mode, scenarioId: S.scenarioId });
  }
  function load(mode, scenarioId) {
    S.mode = mode; S.scenarioId = scenarioId || null;
    const saved = store.get(key());
    S.inputs = B.defaultInputs();
    S.guided = { step: 0, done: {} };
    if (mode === 'guided') B.Modes.setupGuided(S.inputs);
    if (mode === 'scenario') B.Modes.setupScenario(S.inputs, scenarioId);
    if (saved && saved.inputs) { S.inputs = mergeDeep(S.inputs, saved.inputs); S.guided = saved.guided || S.guided; S.student = saved.student || S.student; }
    S.prevVals = {};
    recompute();
  }
  function mergeDeep(a, b) {
    if (Array.isArray(b)) return b;
    if (b && typeof b === 'object') {
      const out = Object.assign({}, a);
      Object.keys(b).forEach((k) => { out[k] = a && typeof a[k] === 'object' && a[k] !== null && !Array.isArray(a[k]) ? mergeDeep(a[k], b[k]) : b[k]; });
      return out;
    }
    return b;
  }
  function recompute() { S.M = B.compute(S.inputs); }
  function resetCurrent() {
    store.del(key());
    load(S.mode, S.scenarioId);
    route();
  }

  /* ---------------- input setters used by screens ---------------- */
  function setPath(path, value) {
    // path like 'semi.count' or ['rev', 100, 'y3']
    const parts = Array.isArray(path) ? path : path.split('.');
    let o = S.inputs;
    for (let i = 0; i < parts.length - 1; i++) {
      if (o[parts[i]] === undefined || o[parts[i]] === null) o[parts[i]] = {};
      o = o[parts[i]];
    }
    o[parts[parts.length - 1]] = value;
    S.lastEdit = { path: parts.join('.'), at: Date.now() };
    recompute(); save();
    render();
    B.Modes.afterEdit && B.Modes.afterEdit();
  }

  /* ---------------- grid component ---------------- */
  // cols: [{k,label,num,ed?,cls}] ; rows: [{id, cls, cells:{k:val}, ed:{k:path|fn}, title:{k:text}, txt:{k:true}}]
  function grid(opts) {
    const { cols, rows, id } = opts;
    const hidden = S.ui.hide[id] || {};
    const vis = cols.filter((c) => !hidden[c.k]);
    let h = `<div class="gridwrap ${opts.tall ? 'tall' : ''}" data-grid="${id}"><table class="grid"><thead><tr>`;
    vis.forEach((c) => { h += `<th class="${c.num ? 'num' : ''}" ${c.w ? `style="min-width:${c.w}px"` : ''}>${esc(c.label)}</th>`; });
    h += '</tr></thead><tbody>';
    rows.forEach((r, ri) => {
      h += `<tr class="${r.cls || ''}" data-row="${ri}">`;
      vis.forEach((c) => {
        const v = r.cells[c.k];
        const edPath = r.ed && r.ed[c.k];
        const isTxt = r.txt && r.txt[c.k];
        const fed = r.fed && r.fed[c.k];
        const valKey = id + ':' + (r.id !== undefined ? r.id : ri) + ':' + c.k;
        let flash = '';
        if (typeof v === 'number') {
          if (S.prevVals[valKey] !== undefined && S.prevVals[valKey] !== v) flash = ' flash';
          S.prevVals[valKey] = v;
        }
        const cls = [(c.num && !isTxt) ? 'num' : '', edPath ? 'ed' : '', fed ? 'fed' : '', c.cls || '', r.wrap && r.wrap[c.k] ? 'wrap' : ''].join(' ') + flash;
        const title = (r.title && r.title[c.k]) || (edPath ? 'Click to enter an amount' : '') || (fed ? 'Comes from: ' + fed : '');
        const disp = r.html && r.html[c.k] ? r.html[c.k] : esc(c.num && typeof v === 'number' ? (c.money ? money(v) : fmt(v)) : (v === null || v === undefined ? '' : v));
        h += `<td class="${cls}" ${edPath ? `data-ed="${ri}|${c.k}"` : ''} ${title ? `title="${esc(title)}"` : ''}>${disp}</td>`;
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    setTimeout(() => wireGrid(id, rows), 0);
    return h;
  }
  function wireGrid(id, rows) {
    const wrap = document.querySelector(`[data-grid="${id}"]`);
    if (!wrap || wrap._wired) return;
    wrap._wired = true;
    wrap.addEventListener('click', (e) => {
      const td = e.target.closest('td[data-ed]');
      if (!td || td.querySelector('input')) return;
      const [ri, k] = td.getAttribute('data-ed').split('|');
      const r = rows[+ri];
      const target = r.ed[k];
      const isTxt = r.txt && r.txt[k];
      const cur = r.raw && r.raw[k] !== undefined ? r.raw[k] : r.cells[k];
      if (target && target.type === 'check') { setPath(target.path, cur ? 0 : 1); return; }
      const inp = document.createElement('input');
      inp.className = 'cell' + (isTxt ? ' txt' : '');
      inp.value = cur === null || cur === undefined ? '' : cur;
      td.textContent = ''; td.appendChild(inp); inp.focus(); inp.select();
      let done = false;
      const commit = (ok) => {
        if (done) return; done = true;
        if (!ok) { render(); return; }
        let val = inp.value;
        if (!isTxt) {
          const p = parseNum(val);
          if (p === null) { alert('Please enter a number.'); render(); return; }
          val = p;
        }
        if (typeof target === 'function') target(val); else setPath(target, val);
      };
      inp.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); commit(true); }
        if (ev.key === 'Escape') { ev.preventDefault(); commit(false); }
        if (ev.key === 'Tab') { ev.preventDefault(); commit(true); }
      });
      inp.addEventListener('blur', () => commit(true));
    });
  }

  function csvDownload(name, cols, rows) {
    const lines = [cols.map((c) => '"' + c.label + '"').join(',')];
    rows.forEach((r) => lines.push(cols.map((c) => { const v = r.cells[c.k]; return typeof v === 'number' ? v : '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"'; }).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------------- menus ---------------- */
  const MENU = [
    { label: 'Home', go: 'home' },
    { label: 'Budget', items: [
      ['Revenues', 'revenues'], ['Appropriations', 'appropriations'], ['Recap of Balances', 'recap'],
      ['Preschool Education Aid', 'pea'], ['Capital Projects and Reserve', 'capital'], ['Appropriation of Excess Surplus', 'excesssurplus'],
      ['SEMI', 'semi'], ['School Based Budget', 'sbb'], ['School Based Summary Report', 'sbbreport']] },
    { label: 'Calculations', items: [
      ['SFRA Calculations', [['Report of District Status', 'districtstatus'], ['Minimum Tax Levy', 'mintaxlevy'], ['Prebudget Yr Levy & Enroll Adjustment', 'adjustedptl']]],
      ['Health Care Costs', 'healthcare'], ['Deferred Pension Contributions', 'pension'],
      ['Responsibility Shifted To/From Another', [['Responsibility Assumed by District(Cap Increase)', 'respinc'], ['Responsibility Shifted to Another District or Entity(Cap Decrease)', 'respdec']]],
      ['Cap Banking Eligibility', 'capbanking'], ['Tax Levy Cap Calculation', 'taxlevycap'],
      ['Separate Proposals Summary', [['Separate Proposal for School Election', 'separateproposal'], ['Separate Proposal Passed at Prior Special Election', 'separateprior']]],
      ['Estimated Tuition Calculations', [['Formulas for Selected Appropriations', 'tuitionformula'], ['Rates for All Programs', 'tuitionrates']]]] },
    { label: 'Supporting Documentation', items: [
      ['Statements of Priorities and NJSLS', 'priorities'], ['Contract Information for Select Staff', 'contracts'], ['Per Pupil Costs', 'perpupil'],
      ['Administrative Cost Limit', 'admincost'], ['Employee Benefits', 'benefits'], ['Shared Services', 'shared'],
      ['Unusual Revenues and Appropriations', 'unusual'], ['Equipment', 'equipment']] },
    { label: 'Enrollment', go: 'enrollment' },
    { label: 'Tax Levy Certification', items: [['A4F', 'a4f'], ['Estimated Tax Rate Information', 'taxrate']] },
    { label: 'Edit Report', go: 'editreport' },
    { label: 'County Review and Approval', go: 'county' },
    { label: 'UFB/Advertised Budget', items: [['User Friendly Budget', 'ufb'], ['Advertised Budget', 'advertised']] },
    { label: 'Printable PDF', go: 'printable' }
  ];
  const TAB_OF = {};
  function menuItems(items, tabLabel) {
    return items.map(([label, x]) => {
      if (Array.isArray(x)) return `<div class="sub"><button class="label">${esc(label)}</button><div class="menu">${menuItems(x, tabLabel)}</div></div>`;
      TAB_OF[x] = tabLabel;
      return `<button class="item" data-go="${x}">${esc(label)}</button>`;
    }).join('');
  }
  function renderTabs() {
    const el = $('#tabs');
    el.innerHTML = MENU.map((m) => {
      if (m.go) { TAB_OF[m.go] = m.label; return `<div class="tab" data-tab="${esc(m.label)}"><button data-go="${m.go}">${esc(m.label)}</button></div>`; }
      return `<div class="tab" data-tab="${esc(m.label)}"><button data-open="1">${esc(m.label)}</button><div class="menu">${menuItems(m.items, m.label)}</div></div>`;
    }).join('');
    el.addEventListener('click', (e) => {
      const go = e.target.closest('[data-go]');
      if (go) { closeMenus(); location.hash = '#/' + go.getAttribute('data-go'); return; }
      const op = e.target.closest('[data-open]');
      if (op) { const t = op.parentElement; const was = t.classList.contains('open'); closeMenus(); if (!was) t.classList.add('open'); e.stopPropagation(); return; }
      const sub = e.target.closest('.sub > .label');
      if (sub) { sub.parentElement.classList.toggle('open'); e.stopPropagation(); }
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('#tabs')) closeMenus(); });
  }
  function closeMenus() { document.querySelectorAll('#tabs .open').forEach((x) => x.classList.remove('open')); }

  /* ---------------- mode bar & panel ---------------- */
  function renderModebar() {
    const el = $('#modebar');
    if (S.mode === 'home') { el.innerHTML = '<span>Training simulator. Choose a mode on the Home screen to begin.</span>'; return; }
    const sc = B.Modes.scoreSummary(S.M);
    const label = { guided: 'Guided Walkthrough', scenario: 'Scenario Challenge', sandbox: 'Open Sandbox' }[S.mode];
    const scen = S.mode === 'scenario' ? B.Modes.scenario(S.scenarioId) : null;
    el.innerHTML = `<span class="pill on">${label}</span>${scen ? `<span><b>${esc(scen.title)}</b></span>` : ''}
      <span class="score ${sc.fatal ? 'bad' : 'ok'}">${sc.fatal ? sc.fatal + ' fatal edit' + (sc.fatal > 1 ? 's' : '') : 'No fatal edits'}</span>
      ${S.mode === 'scenario' ? `<span class="score ${sc.goalsMet === sc.goals ? 'ok' : 'bad'}">Goals ${sc.goalsMet}/${sc.goals}</span>` : ''}
      ${S.mode === 'guided' ? `<span class="score">Step ${Math.min(S.guided.step + 1, B.Modes.guidedSteps.length)} of ${B.Modes.guidedSteps.length}</span>` : ''}
      <span class="sp"></span>
      <button data-act="panel">${S.ui.panel ? 'Hide' : 'Show'} ${S.mode === 'guided' ? 'steps' : 'scorecard'}</button>
      <button data-act="results">Results page</button>
      <button data-act="export">Save work to file</button>
      <button data-act="import">Open saved file</button>
      <button data-act="reset">Start over</button>`;
    el.onclick = (e) => {
      const a = e.target.getAttribute('data-act');
      if (a === 'panel') { S.ui.panel = !S.ui.panel; render(); }
      if (a === 'reset' && confirm('Start this mode over? Your entries in this mode will be cleared.')) resetCurrent();
      if (a === 'results') location.hash = '#/results';
      if (a === 'export') exportWork();
      if (a === 'import') importWork();
    };
  }
  function renderPanel() {
    const el = $('#panel');
    const hidePanel = S.mode === 'home' || !S.ui.panel || current === 'county' || current === 'results' || current === 'home';
    document.body.classList.toggle('has-panel', !hidePanel && !S.ui.panelMin);
    if (hidePanel) { el.innerHTML = ''; el.className = ''; return; }
    el.className = 'panel' + (S.ui.panelMin ? ' min' : '');
    el.innerHTML = B.Modes.panelHtml(S);
    el.onclick = (e) => {
      const t = e.target;
      if (t.getAttribute('data-act') === 'min') { S.ui.panelMin = !S.ui.panelMin; renderPanel(); return; }
      if (t.getAttribute('data-act') === 'close') { S.ui.panel = false; render(); return; }
      const go = t.closest('[data-go]');
      if (go) { location.hash = '#/' + go.getAttribute('data-go'); return; }
      B.Modes.panelClick && B.Modes.panelClick(t, S);
    };
  }

  function exportWork() {
    const name = S.student || prompt('Your name (shown on your saved file and results page):', '') || '';
    S.student = name; save();
    const data = { app: 'Budget Practice Lab', version: 1, mode: S.mode, scenarioId: S.scenarioId, student: name, savedAt: new Date().toISOString(), inputs: S.inputs, guided: S.guided };
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `budget-practice-${S.mode}${S.scenarioId ? '-' + S.scenarioId : ''}${name ? '-' + name.replace(/\W+/g, '_') : ''}.json`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importWork() {
    const f = document.createElement('input'); f.type = 'file'; f.accept = '.json,application/json';
    f.onchange = () => {
      const file = f.files[0]; if (!file) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const d = JSON.parse(rd.result);
          if (d.app !== 'Budget Practice Lab') throw new Error('not ours');
          load(d.mode, d.scenarioId);
          S.inputs = mergeDeep(S.inputs, d.inputs); S.guided = d.guided || S.guided; S.student = d.student || '';
          recompute(); save(); location.hash = '#/home'; route();
        } catch (e) { alert('That file is not a Budget Practice Lab save file.'); }
      };
      rd.readAsText(file);
    };
    f.click();
  }

  /* ---------------- router ---------------- */
  let current = 'home';
  function route() {
    const id = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];
    current = B.screens[id] ? id : 'home';
    if (S.mode === 'home' && current !== 'home' && current !== 'results') load('sandbox');
    if (B.Modes && B.Modes.onRoute) B.Modes.onRoute(current);
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    if (S.mode !== 'home' && !S.M) recompute();
    if (!S.M) recompute();
    const scr = B.screens[current];
    document.querySelectorAll('#tabs .tab').forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === TAB_OF[current]));
    $('#screen-title').textContent = scr.title || '';
    const main = $('#main');
    const gw = main.querySelector('.gridwrap');
    const keepScroll = gw && main.getAttribute('data-screen') === current ? gw.scrollTop : 0;
    const winScroll = main.getAttribute('data-screen') === current ? window.scrollY : 0;
    main.setAttribute('data-screen', current);
    main.innerHTML = scr.render(S.M, S);
    if (scr.after) scr.after(main, S.M, S);
    const gw2 = main.querySelector('.gridwrap');
    if (gw2 && keepScroll) gw2.scrollTop = keepScroll;
    if (winScroll) window.scrollTo(0, winScroll);
    renderModebar();
    renderPanel();
  }

  Object.assign(B, { S, grid, csvDownload, setPath, esc, fmt, money, pct, parseNum, load, save, render, route, recompute, store, resetCurrent, current: () => current });

  window.addEventListener('DOMContentLoaded', () => {
    renderTabs();
    const last = store.get('bpl.v1.last');
    if (last && last.mode && last.mode !== 'home') load(last.mode, last.scenarioId); else { S.mode = 'home'; recompute(); }
    window.addEventListener('hashchange', route);
    route();
  });
})();
