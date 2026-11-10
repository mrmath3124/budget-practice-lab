global.window = {};
require(__dirname + '/../js/data.js');
require(__dirname + '/../js/engine.js');
const B = window.BPL;
const M = B.compute(B.defaultInputs());
const C = M.calc;
const exp = [
 ['rev1000', M.rv(1000), 76432681], ['app90000', M.av(90000), 76432681], ['rev720', M.rv(720), 68165361],
 ['rev580', M.rv(580), 1114111], ['rev540', M.rv(540), 35028], ['rev892', M.rv(892), 52954],
 ['RP8 y3', M.recap[8].y3, 1297928], ['RP8 y2', M.recap[8].y2, 1297928], ['RP19 y3', M.recap[19].y3, 0], ['RP37 y3', M.recap[37].y3, 30262353],
 ['RP47 y3', M.recap[47].y3, 1899384], ['RP82 y3', M.recap[82].y3, 50500], ['RP103 y3', M.recap[103].y3, 0], ['RP54', M.recap[54].y3, 199822],
 ['ES C', C.es.C, 1341107], ['ES D', C.es.D, 1070932], ['ES B3', C.es.B3, 67055373],
 ['PTL R', C.ptl.R, 37630964], ['PTL F', C.ptl.F, 12904], ['HC D', C.hc.D, 999196], ['HC F', C.hc.F, 2285764], ['HC G', C.hc.G, 999196],
 ['CAP I', C.cap.I, 38630160], ['MIN D', C.min.D, 36893102], ['STATUS E', C.status.E, -4758938],
 ['bank H', C.bank.H, 999196], ['bank M', C.bank.M, 1925522],
 ['enr H25', C.enr.byLine['25'].H, 2626], ['enr H33', C.enr.byLine['33'].H, 2633], ['enr K25', C.enr.byLine['25'].K, 1.51], ['adminEnr', C.enr.adminEnrollment, 2682],
 ['ACL A1y3', C.acl.A1y3, 6281023], ['ACL pp', C.acl.perPupil, 2342], ['ACL A1y2', C.acl.A1y2, 6502807], ['ACL limit pp', C.acl.limitPerPupil, 2978], ['ACL ben3', C.acl.ben3, 1286779],
 ['PEA rev', C.pea.totalRev, 4679392], ['PEA prog', C.pea.program, 4679392],
 ['TLC total', C.tlc.tot.total, 39328868], ['TLC GF col2', C.tlc.rows[0].col2, 18815482], ['TLC grand', C.tlc.grand, 39328868],
 ['rate gf', C.rate.gfRate, 0.8448], ['rate all', C.rate.allRate, 0.8917], ['eq gf', C.rate.gfEq, 1.0351], ['eq all', C.rate.allEq, 1.0926],
 ['tuitA F', C.tuition.fa.F, 556349], ['tuitA D', C.tuition.fa.D, 9.5], ['tuitB P', C.tuition.P, 8734],
];
let bad=0; exp.forEach(([k,a,b])=>{ if(a!==b){bad++; console.log('FAIL',k,a,b);} });
console.log('checks',exp.length,'fail',bad);
console.log('fatal failing:', M.edits.filter(e=>e.type==='Fatal'&&e.failing).map(e=>e.id+' '+e.ver));
console.log('warnings:', M.edits.filter(e=>e.type==='Warning'&&e.failing).map(e=>e.id));
