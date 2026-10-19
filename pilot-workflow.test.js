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
  assert.match(app,/version:'0\.8\.0'/);
  assert.match(app,/generatorVersion:window\.OPENIQ_GENERATOR\?\.version/);
  assert.match(app,/scoringVersion:window\.OPENIQ_SCORING\?\.CONFIG\?\.version/);
});
