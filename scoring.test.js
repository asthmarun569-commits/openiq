const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '..', 'scoring.js'), 'utf8'), context);
const scoring = context.window.OPENIQ_SCORING;
test('no norm score is available by default', () => {
  assert.equal(scoring.deviationScore(10, scoring.CONFIG.norms.adults18to35).available, false);
});
test('validated norm transform returns 100 at the mean', () => {
  const result = scoring.deviationScore(40, { compositeMean: 40, compositeSD: 5, sampleSize: 200, validated: true });
  assert.equal(result.score, 100);
  assert.equal(result.waISFSIQ, false);
});
test('one standard deviation above mean maps to 115', () => {
  const result = scoring.deviationScore(45, { compositeMean: 40, compositeSD: 5, sampleSize: 200, validated: true });
  assert.equal(result.score, 115);
});
test('standard error formula is correct', () => {
  assert.equal(scoring.standardErrorOfMeasurement(15, 0.84), 6);
});
test('invalid reliability is rejected', () => {
  assert.throws(() => scoring.standardErrorOfMeasurement(15, 1.2));
});

