import fs from "node:fs";
import path from "node:path";

const SOURCE_URL = "https://raw.githubusercontent.com/asthmarun569-commits/openiq/main/index.html";
const OUTPUT = path.resolve("index.empirical.html");

if (fs.existsSync(OUTPUT)) {
  console.error("STOP: index.empirical.html already exists. Rename it first to avoid overwriting your work.");
  process.exit(1);
}

let html;
try {
  const response = await fetch(SOURCE_URL, { headers: { "User-Agent": "OpenIQ-Empirical-Update-Builder" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  html = await response.text();
} catch (err) {
  console.error("Could not fetch current OpenIQ index.html:", err.message);
  console.error("Download index.html manually and use apply-empirical-update.mjs from the other package.");
  process.exit(2);
}
const original = html;

function replaceExactly(source, oldText, newText, label) {
  const count = source.split(oldText).length - 1;
  if (count !== 1) {
    console.error(`STOP: expected exactly one match for ${label}, found ${count}. No output written.`);
    process.exit(3);
  }
  return source.replace(oldText, newText);
}

html = replaceExactly(
  html,
  "{id:'PSI-003',domain:'PSI',prompt:'How many times does the letter A appear in “DATA ANALYSIS”?',options:['3','4','5','6'],answer:2,explanation:'DATA has two A letters and ANALYSIS has three A letters, for a total of five.'}",
  "{id:'PSI-003',domain:'PSI',prompt:'How many times does the letter A appear in “DATA ANALYSIS”?',options:['3','4','5','6'],answer:1,explanation:'DATA has two A letters and ANALYSIS has two A letters, for a total of four.'}",
  "PSI-003 answer key"
);

const oldValidation = "function validQuestion(q){return q&&typeof q.id==='string'&&['VCI','WMI','PRI','PSI'].includes(q.domain)&&typeof q.prompt==='string'&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(x=>typeof x==='string')&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4&&typeof q.explanation==='string'}";
const newValidation = "function validQuestion(q){return !!q&&typeof q.id==='string'&&q.id.trim().length>0&&['VCI','WMI','PRI','PSI'].includes(q.domain)&&typeof q.prompt==='string'&&q.prompt.trim().length>0&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(x=>typeof x==='string'&&x.trim().length>0)&&new Set(q.options.map(x=>x.trim().toLowerCase())).size===4&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4&&typeof q.explanation==='string'&&q.explanation.trim().length>0}";
html = replaceExactly(html, oldValidation, newValidation, "question validation");

const oldLoad = "function loadBank(){try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed)&&parsed.every(validQuestion))return parsed}}catch(e){}return clone(DEFAULT_QUESTIONS)}";
const newLoad = "function loadBank(){try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed)){const migrated=parsed.map(q=>q&&q.id==='PSI-003'&&q.prompt==='How many times does the letter A appear in “DATA ANALYSIS”?'?{...q,answer:1,explanation:'DATA has two A letters and ANALYSIS has two A letters, for a total of four.'}:q);const ids=migrated.map(q=>q&&q.id);if(migrated.every(validQuestion)&&new Set(ids).size===ids.length)return migrated}}}catch(e){}return clone(DEFAULT_QUESTIONS)}";
html = replaceExactly(html, oldLoad, newLoad, "localStorage migration");

const researchAnchor = '<div class="card" style="margin-top:18px"><h3>Current scoring rules</h3>';
const empiricalMarkup = `<div class="card" style="margin-top:18px" id="empiricalPilotPanel">
<h3>Empirical pilot analysis</h3>
<p>Import an anonymised participant-by-item CSV to calculate exploratory item statistics and internal consistency in this browser. The file is not uploaded to a server.</p>
<div class="notice"><strong>Interpretation boundary:</strong> These are preliminary sample statistics, not proof of validity, fairness, an IQ score, or population norms. Use consented data and an appropriate research protocol.</div>
<div class="field"><label for="pilotCsv">Pilot response CSV</label><input id="pilotCsv" type="file" accept=".csv,text/csv"></div>
<p class="small muted">Format: one row per participant; one column per item ID (e.g. VCI-001); cells are 1=correct, 0=incorrect, blank=missing. An optional participant_id column is ignored during scoring. Do not include direct identifiers.</p>
<div class="actions"><button class="btn primary" type="button" id="analyzePilotBtn">Analyse pilot CSV</button><button class="btn" type="button" id="downloadPilotTemplateBtn">Download CSV template</button><button class="btn" type="button" id="downloadPilotReportBtn" disabled>Export analysis report</button></div>
<div id="pilotAnalysisStatus" class="small muted" role="status" aria-live="polite" style="margin-top:12px">No pilot dataset analysed in this session.</div>
<div id="pilotAnalysisResults" style="margin-top:14px"></div>
</div>
`;
if (!html.includes(researchAnchor)) {
  console.error("STOP: research-section anchor not found. No output written.");
  process.exit(4);
}
html = replaceExactly(html, researchAnchor, empiricalMarkup + researchAnchor, "empirical analysis panel");

const jsAnchor = "document.getElementById('year').textContent=new Date().getFullYear();";
const empiricalJs = String.raw`
/* Exploratory pilot analysis. The selected CSV is processed in this browser only. */
let lastPilotReport=null;
const PILOT_DOMAINS={VCI:'Verbal comprehension',WMI:'Working memory',PRI:'Perceptual reasoning',PSI:'Processing speed'};
function parsePilotCSV(text){
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(line=>line.trim().length);
  if(lines.length<2)throw new Error('CSV must include a header and at least one participant row.');
  const headers=lines[0].split(',').map(x=>x.trim());
  if(new Set(headers).size!==headers.length)throw new Error('CSV has duplicate column names.');
  const ids=headers.filter(h=>/^(VCI|WMI|PRI|PSI)-[A-Z0-9-]+$/.test(h));
  if(ids.length<2)throw new Error('Need at least two item columns named like VCI-001.');
  const rows=[];
  for(let i=1;i<lines.length;i++){
    const cells=lines[i].split(',');
    if(cells.length!==headers.length)throw new Error('Row '+(i+1)+' has a different number of columns than the header.');
    const row={};
    ids.forEach(id=>{
      const raw=(cells[headers.indexOf(id)]||'').trim();
      if(raw==='')row[id]=null;
      else if(raw==='0'||raw==='1')row[id]=Number(raw);
      else throw new Error('Item '+id+' in row '+(i+1)+' must be 1, 0, or blank.');
    });
    rows.push(row);
  }
  return {ids,rows};
}
function sampleVariance(values){
  if(values.length<2)return null;
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  return values.reduce((sum,x)=>sum+(x-mean)**2,0)/(values.length-1);
}
function correlation(a,b){
  if(a.length<3)return null;
  const ma=a.reduce((x,y)=>x+y,0)/a.length, mb=b.reduce((x,y)=>x+y,0)/b.length;
  const va=a.reduce((s,x)=>s+(x-ma)**2,0), vb=b.reduce((s,x)=>s+(x-mb)**2,0);
  if(va===0||vb===0)return null;
  return a.reduce((s,x,i)=>s+(x-ma)*(b[i]-mb),0)/Math.sqrt(va*vb);
}
function calculateKR20(rows,ids){
  if(ids.length<2||rows.length<2)return null;
  const totals=rows.map(r=>ids.reduce((sum,id)=>sum+r[id],0));
  const totalVar=sampleVariance(totals);
  if(totalVar===null||totalVar<=0)return null;
  const sumPQ=ids.reduce((sum,id)=>{
    const p=rows.reduce((n,r)=>n+r[id],0)/rows.length;
    return sum+p*(1-p);
  },0);
  return (ids.length/(ids.length-1))*(1-sumPQ/totalVar);
}
function calculatePilotReport(data){
  const {ids,rows}=data;
  const complete=rows.filter(r=>ids.every(id=>r[id]!==null));
  const items=ids.map(id=>{
    const answered=rows.map(r=>r[id]).filter(v=>v!==null);
    const paired=rows.filter(r=>r[id]!==null&&ids.filter(other=>other!==id).every(other=>r[other]!==null));
    const own=paired.map(r=>r[id]);
    const rest=paired.map(r=>ids.filter(other=>other!==id).reduce((sum,other)=>sum+r[other],0));
    return {id,domain:id.split('-')[0],nAnswered:answered.length,missingRate:1-answered.length/rows.length,proportionCorrect:answered.length?answered.reduce((a,b)=>a+b,0)/answered.length:null,correctedItemTotalCorrelation:correlation(own,rest)};
  });
  const domains=['VCI','WMI','PRI','PSI'].map(domain=>{
    const domainIds=ids.filter(id=>id.startsWith(domain+'-'));
    const domainRows=rows.filter(r=>domainIds.every(id=>r[id]!==null));
    return domainIds.length?{domain,itemCount:domainIds.length,completeN:domainRows.length,kr20:calculateKR20(domainRows,domainIds)}:null;
  }).filter(Boolean);
  const totalCells=rows.length*ids.length;
  const missingCells=rows.reduce((n,r)=>n+ids.filter(id=>r[id]===null).length,0);
  return {schemaVersion:'openiq-empirical-pilot-report-1.0',generatedAt:new Date().toISOString(),status:'exploratory-not-validation',participantRows:rows.length,itemCount:ids.length,completeCaseN:complete.length,missingCells,totalCells,overallKR20:calculateKR20(complete,ids),items,domains,limitations:[
    'Estimates depend on the sample and may be unstable, especially for small samples and short tests.',
    'KR-20 estimates internal consistency only; it does not prove validity, unidimensionality, fairness or IQ measurement.',
    'Item difficulty and corrected item-total correlation are review signals, not automatic item-removal rules.',
    'No IQ score, percentile, population norm, diagnosis or subgroup fairness conclusion is produced.',
    'Independent psychometric review and additional evidence are needed before stronger claims.'
  ]};
}
function fmtPilot(x){return x===null||!Number.isFinite(x)?'Not estimable':x.toFixed(3)}
function pilotCell(tr,value){const td=document.createElement('td');td.textContent=value;td.style.cssText='padding:8px;border-bottom:1px solid var(--line);font-size:.85rem;text-align:left';tr.append(td)}
function renderPilotReport(r){
  const root=document.getElementById('pilotAnalysisResults');root.replaceChildren();
  const summary=document.createElement('div');summary.className='grid';summary.style.gridTemplateColumns='repeat(auto-fit,minmax(145px,1fr))';
  [['Participant rows',r.participantRows],['Items analysed',r.itemCount],['Complete cases',r.completeCaseN],['Missing cells',r.missingCells+' / '+r.totalCells],['Overall KR-20',fmtPilot(r.overallKR20)]].forEach(([label,value])=>{const card=document.createElement('div');card.className='card';const p=document.createElement('p');p.textContent=label;const strong=document.createElement('strong');strong.style.fontSize='1.35rem';strong.textContent=value;card.append(p,strong);summary.append(card)});
  root.append(summary);
  const card=document.createElement('div');card.className='card';card.style.marginTop='14px';const h=document.createElement('h3');h.textContent='Item statistics';card.append(h);
  const wrap=document.createElement('div');wrap.style.overflowX='auto';const table=document.createElement('table');table.style.cssText='border-collapse:collapse;width:100%;min-width:620px';
  const head=document.createElement('tr');['Item','Domain','Answered','Proportion correct','Corrected item-total r','Missing'].forEach(v=>{const th=document.createElement('th');th.textContent=v;th.style.cssText='text-align:left;padding:8px;border-bottom:2px solid var(--line)';head.append(th)});const thead=document.createElement('thead');thead.append(head);table.append(thead);
  const tbody=document.createElement('tbody');r.items.forEach(x=>{const tr=document.createElement('tr');[x.id,x.domain,String(x.nAnswered),fmtPilot(x.proportionCorrect),fmtPilot(x.correctedItemTotalCorrelation),(100*x.missingRate).toFixed(1)+'%'].forEach(v=>pilotCell(tr,v));tbody.append(tr)});table.append(tbody);wrap.append(table);card.append(wrap);root.append(card);
  const dc=document.createElement('div');dc.className='card';dc.style.marginTop='14px';const dh=document.createElement('h3');dh.textContent='Domain-level KR-20';dc.append(dh);
  const dl=document.createElement('ul');r.domains.forEach(d=>{const li=document.createElement('li');li.textContent=PILOT_DOMAINS[d.domain]+' ('+d.domain+'): '+d.itemCount+' item(s), '+d.completeN+' complete cases, KR-20 '+fmtPilot(d.kr20);dl.append(li)});dc.append(dl);root.append(dc);
  const notice=document.createElement('div');notice.className='notice';notice.textContent='Preliminary statistics only. KR-20 can be unstable or inappropriate for very short or multidimensional tests. These values are not a validation certificate.';root.append(notice);
  const details=document.createElement('details');const sum=document.createElement('summary');sum.textContent='Limitations';details.append(sum);const ul=document.createElement('ul');r.limitations.forEach(x=>{const li=document.createElement('li');li.textContent=x;ul.append(li)});details.append(ul);root.append(details);
}
document.getElementById('analyzePilotBtn').addEventListener('click',async()=>{
  const file=document.getElementById('pilotCsv').files[0],status=document.getElementById('pilotAnalysisStatus');
  if(!file){status.textContent='Choose a CSV file first.';return}
  try{const data=parsePilotCSV(await file.text());const report=calculatePilotReport(data);lastPilotReport=report;renderPilotReport(report);document.getElementById('downloadPilotReportBtn').disabled=false;status.textContent='Analysed '+report.participantRows+' participant rows and '+report.itemCount+' items. The CSV was processed locally.'}
  catch(err){lastPilotReport=null;document.getElementById('downloadPilotReportBtn').disabled=true;document.getElementById('pilotAnalysisResults').replaceChildren();status.textContent='Analysis stopped: '+err.message}
});
document.getElementById('downloadPilotReportBtn').addEventListener('click',()=>{
  if(!lastPilotReport)return;
  downloadJson('openiq-empirical-report-'+new Date().toISOString().slice(0,10)+'.json',lastPilotReport);
});
document.getElementById('downloadPilotTemplateBtn').addEventListener('click',()=>{
  const ids=['VCI-001','VCI-002','VCI-003','WMI-001','WMI-002','WMI-003','PRI-001','PRI-002','PRI-003','PSI-001','PSI-002','PSI-003'];
  const blob=new Blob(['participant_id,'+ids.join(',')+'\n'],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='openiq-pilot-template.csv';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
});
`;
html = replaceExactly(html, jsAnchor, empiricalJs + "\n" + jsAnchor, "pilot-analysis JavaScript");
if (html === original) {
  console.error("STOP: no changes made.");
  process.exit(5);
}
fs.writeFileSync(OUTPUT, html, "utf8");
console.log(`Created ${OUTPUT}`);
console.log("This is a complete generated HTML file, ready for review and testing.");
console.log("No participant data was analysed by this builder; the site remains an experimental assessment, not a validated IQ test.");
