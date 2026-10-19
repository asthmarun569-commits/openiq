const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const guide=fs.readFileSync(path.join(__dirname,'..','pilot.html'),'utf8');
test('pilot consent is optional and separate from quiz consent',()=>{
  assert.match(html,/id="consent-check"/);
  assert.match(html,/id="research-consent"/);
  assert.match(app,/const joined=Boolean\(researchConsent\?\.checked\)/);
});
test('pilot exports include pseudonymous code and structured metadata only with opt-in',()=>{
  assert.match(app,/participantCode:joined\?/);
  assert.match(app,/ageBand:joined\?/);
  assert.match(app,/collectionMode:'local-download-only'/);
});
test('pilot guide explains data handling and limitations',()=>{
  assert.match(guide,/does not automatically send answers to a research server/i);
  assert.match(guide,/pseudonymous, not a guarantee of anonymity/i);
});

test('non-WMI stimulus content is rendered instead of silently hidden',()=>{
  assert.match(app,/if\(q\.stimulus\)\{visual\.classList\.remove\('hidden'\);visual\.textContent=q\.stimulus;\}/);
});
test('exports identify the current generator and scoring versions',()=>{
  assert.match(app,/version:'0\.11\.0'/);
  assert.match(app,/generatorVersion:window\.OPENIQ_GENERATOR\?\.version/);
  assert.match(app,/scoringVersion:window\.OPENIQ_SCORING\?\.CONFIG\?\.version/);
});

test('quality audit page documents the eight elements and non-IQ status',()=>{const q=fs.readFileSync(path.join(__dirname,'..','quality.html'),'utf8');for(const phrase of ['Scientific test design','Psychometric validation','Norms and scoring','Test delivery','Results reporting','Security and privacy','Ethics and fairness','Quality assurance'])assert.ok(q.includes(phrase),phrase);assert.match(q,/not ready for IQ-score reporting/i);});
test('response-time metadata and form ID are exported',()=>{assert.match(app,/formId:qs\.map\(q=>q\.id\)/);assert.match(app,/presentationMs:q\.presentationMs/);assert.match(app,/enteredAt=Date\.now\(\);renderOptions\(q\)/);});

test('response latency and time-after-answer are stored separately',()=>{assert.match(app,/responseTimeDefinition:'time from answer options becoming visible to first answer selection/);assert.match(app,/timeAfterAnswerMs:advanceTimes\[i\]/);assert.match(app,/sessionDurationDefinition:'from start click to final submission; frozen at completion'/);});
test('fixed calibration mode is available and explicitly labeled unvalidated',()=>{const q=fs.readFileSync(path.join(__dirname,'..','questions.js'),'utf8');assert.match(q,/get\('mode'\)==='calibration'/);assert.match(q,/fixed-development-form/);assert.match(q,/not validated/);});

test('form identifier preserves administered item order',()=>{assert.match(app,/formId:qs\.map\(q=>q\.id\)\.join\('\|'\)/);assert.match(app,/itemBankVersion:'0\.11\.0'/);});

test('domain blueprint clearly restricts interpretation to raw practice accuracy',()=>{const fs=require('node:fs');const s=fs.readFileSync(require('node:path').join(__dirname,'..','DOMAIN_BLUEPRINT.md'),'utf8');assert.match(s,/Raw practice accuracy only/);assert.match(s,/Do not interpret browser response time as a standardized processing-speed score/);});
