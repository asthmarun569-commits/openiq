const test = require('node:test');
const assert = require('node:assert/strict');
const { kr20, reliabilityStats, analyse } = require('../research.js');

test('KR-20 refuses tiny matrices and identifies sample requirements', () => {
  const r = kr20([[1,0],[0,1]]);
  assert.ok(Number.isNaN(r.value));
  assert.match(r.reason, /at least 10 complete participants/);
});

test('reliability statistics calculate raw-score SEM when coefficient is usable', () => {
  const matrix = Array.from({length: 20}, (_, i) => [i%2, (i>>1)%2, (i>>2)%2, (i>>3)%2]);
  const r = reliabilityStats(matrix);
  if (Number.isFinite(r.value) && r.value >= 0 && r.value <= 1) {
    assert.ok(Number.isFinite(r.sem));
    assert.ok(Math.abs(r.sem - r.scoreSd * Math.sqrt(1-r.value)) < 1e-10);
  } else assert.ok(Number.isNaN(r.sem));
  assert.ok(Number.isNaN(r.reliabilityCILow), 'bootstrap CI should be withheld below N=30');
});

test('analysis does not claim overall reliability when reports lack common items', () => {
  const reports = [
    {responses:[{itemId:'a',domainCode:'VC',correct:true},{itemId:'b',domainCode:'VC',correct:false},{itemId:'c',domainCode:'VC',correct:true}]},
    {responses:[{itemId:'x',domainCode:'VC',correct:true},{itemId:'y',domainCode:'VC',correct:false},{itemId:'z',domainCode:'VC',correct:true}]}
  ];
  const r = analyse(reports);
  assert.ok(Number.isNaN(r.overallReliability.value));
  assert.equal(r.overallReliability.commonItems, 0);
});
