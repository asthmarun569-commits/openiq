const test=require('node:test');
const assert=require('node:assert/strict');
const {parseCSV,analyze,wilson}=require('../analyze-validation.js');
const header='participant_code,openiq_score,reference_score,openiq_score_type,reference_score_type,age_band,form_id,eligible,exclusion_reason';
const row=(code,a,b,extra='iq,iq,18-29,F1,yes,')=>`${code},${a},${b},${extra}`;
const csv=(...rows)=>parseCSV([header,...rows].join('\n'));

test('Wilson interval is bounded and centered near proportion',()=>{
 const ci=wilson(95,100); assert.ok(ci.low>0.85 && ci.low<0.95); assert.ok(ci.high>0.95 && ci.high<1);
});
test('analysis calculates within-five and errors for valid IQ-scale rows',()=>{
 const r=analyze(csv(row('P1',100,103),row('P2',110,104),row('P3',90,90,'iq,iq,30-39,F1,yes,')));
 assert.equal(r.n,3); assert.equal(r.within5Count,2); assert.equal(r.meanSignedError,1); assert.equal(r.meanAbsoluteError,3); assert.equal(r.rootMeanSquaredError,Math.sqrt(15));
});
test('excludes rows marked no and flags missing scores',()=>{
 const r=analyze(csv(row('P1',100,100,'iq,iq,18-29,F1,no,withdrawn'),row('P2','','100')));
 assert.equal(r.n,0); assert.equal(r.excluded,1); assert.equal(r.invalidCount,1);
});
test('all rows with duplicate participant codes are flagged',()=>{
 const r=analyze(csv(row('P1',100,100),row('P1',100,110)));
 assert.equal(r.n,0); assert.equal(r.invalidCount,2); assert.deepEqual(r.duplicateCodes,['P1']);
});
test('invalid first duplicate cannot cause later record to be accepted',()=>{
 const r=analyze(csv(row('P1','','100'),row('P1',100,100)));
 assert.equal(r.n,0); assert.equal(r.invalidCount,2); assert.ok(r.invalidRows.every(x=>x.reason.includes('duplicate participant_code')));
});
test('CSV parser supports quoted commas and newlines',()=>{
 const rows=parseCSV(header+',note\nP1,100,101,iq,iq,18-29,F1,yes,,"review, okay"\nP2,99,100,iq,iq,18-29,F1,yes,,"line one\nline two"');
 assert.equal(rows.length,2); assert.equal(rows[0].note,'review, okay'); assert.equal(rows[1].note,'line one\nline two');
});
test('CSV parser rejects wrong field counts',()=>{
 assert.throws(()=>parseCSV(header+'\nP1,100,100,iq,iq,18-29,F1,yes,,extra'),/expected 9/);
});
test('rejects raw percentage scores for IQ-point agreement',()=>{
 const r=analyze(csv(row('P1',83,100,'raw_percent,iq,18-29,F1,yes,')));
 assert.equal(r.n,0); assert.match(r.invalidRows[0].reason,/both score types to be 'iq'/);
});
test('rejects fractional IQ scores',()=>{
 const r=analyze(csv(row('P1',100.5,100)));
 assert.equal(r.n,0); assert.match(r.invalidRows[0].reason,/whole numbers/);
});
test('rejects out-of-range IQ scores',()=>{
 const r=analyze(csv(row('P1',161,100)));
 assert.equal(r.n,0); assert.match(r.invalidRows[0].reason,/40–160 range/);
});
test('rejects yes/no eligibility typos',()=>{
 const r=analyze(csv(row('P1',100,100,'iq,iq,18-29,F1,maybe,')));
 assert.equal(r.n,0); assert.match(r.invalidRows[0].reason,/exactly yes or no/);
});
test('rejects NaN and Infinity score strings',()=>{
 const r=analyze(csv(row('P1','NaN',100),row('P2','Infinity',100)));
 assert.equal(r.n,0); assert.equal(r.invalidCount,2);
});
test('empty analysis has no accuracy estimate',()=>{
 const r=analyze(csv(row('P1','','')));
 assert.equal(r.n,0); assert.equal(r.within5Rate,undefined); assert.match(r.warning,/No valid eligible/);
});
