const test=require('node:test');
const assert=require('node:assert/strict');
const {generateWithSeed}=require('../questions.js');
function counts(items){return items.reduce((a,q)=>(a[q.domainCode]=(a[q.domainCode]||0)+1,a),{});}
test('seeded generator is reproducible',()=>{assert.deepEqual(generateWithSeed(12345),generateWithSeed(12345));});
test('different seeds can produce different forms',()=>{assert.notDeepEqual(generateWithSeed(12345),generateWithSeed(54321));});
test('default session has 24 items and six per domain',()=>{const q=generateWithSeed(99);assert.equal(q.length,24);assert.deepEqual(counts(q),{VCI:6,WMI:6,PRI:6,PSI:6});});
test('item IDs are unique within a session',()=>{const q=generateWithSeed(101);assert.equal(new Set(q.map(x=>x.id)).size,q.length);});
test('each item has valid unique options and exactly one keyed answer',()=>{for(const q of generateWithSeed(2026)){assert.ok([2,4].includes(q.options.length),q.id);assert.equal(new Set(q.options).size,q.options.length,q.id);assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,q.id);assert.equal(q.options.filter(x=>x===q.correctAnswer).length,1,q.id);assert.equal(q.options[q.answer],q.correctAnswer,q.id);}});
test('every item has difficulty and parameter metadata',()=>{for(const q of generateWithSeed(404)){assert.ok(['easy','moderate','challenging'].includes(q.difficulty),q.id);assert.ok(q.templateId);assert.ok(q.params&&typeof q.params==='object');}});
test('PSI target-presence options are binary and the key matches stimulus parameters',()=>{for(const q of generateWithSeed(2025).filter(x=>x.templateId==='target-presence')){assert.deepEqual([...q.options].sort(),['Absent','Present']);assert.equal(q.correctAnswer,q.params.present?'Present':'Absent');assert.equal(q.stimulus.includes(q.params.target),q.params.present);}});
test('PSI number comparison options do not contain overlapping statements',()=>{for(const q of generateWithSeed(303).filter(x=>x.templateId==='number-match')){assert.deepEqual([...q.options].sort(),['Different','Same']);assert.equal(q.correctAnswer,q.params.same?'Same':'Different');}});
test('WMI sequence is separate from the response prompt',()=>{for(const q of generateWithSeed(88).filter(x=>x.templateId==='reverse-sequence')){assert.ok(q.stimulus);assert.ok(!q.prompt.includes(q.stimulus));assert.ok(q.prompt.includes('disappear'));}});
test('all generator calls have stable IDs for identical seed and params',()=>{const a=generateWithSeed(777),b=generateWithSeed(777);assert.deepEqual(a.map(x=>x.id),b.map(x=>x.id));});
