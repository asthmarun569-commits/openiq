import fs from "node:fs";
import path from "node:path";

const input = path.resolve("index.html");
const output = path.resolve("index.empirical.html");
if (!fs.existsSync(input)) {
  console.error("STOP: index.html not found. Put this script beside your downloaded OpenIQ index.html.");
  process.exit(1);
}
if (fs.existsSync(output)) {
  console.error("STOP: index.empirical.html already exists. Rename it before retrying.");
  process.exit(1);
}
let html = fs.readFileSync(input, "utf8");
const original = html;

const oldItem = "{id:'PSI-003',domain:'PSI',prompt:'How many times does the letter A appear in “DATA ANALYSIS”?',options:['3','4','5','6'],answer:2,explanation:'DATA has two A letters and ANALYSIS has three A letters, for a total of five.'}";
const newItem = "{id:'PSI-003',domain:'PSI',prompt:'How many times does the letter A appear in “DATA ANALYSIS”?',options:['3','4','5','6'],answer:1,explanation:'DATA has two A letters and ANALYSIS has two A letters, for a total of four.'}";
if (!html.includes(oldItem)) {
  console.error("STOP: PSI-003 source text differs from the expected version; no output written.");
  process.exit(2);
}
html = html.replace(oldItem, newItem);

const oldValidation = "function validQuestion(q){return q&&typeof q.id==='string'&&['VCI','WMI','PRI','PSI'].includes(q.domain)&&typeof q.prompt==='string'&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(x=>typeof x==='string')&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4&&typeof q.explanation==='string'}";
const newValidation = "function validQuestion(q){return !!q&&typeof q.id==='string'&&q.id.trim().length>0&&['VCI','WMI','PRI','PSI'].includes(q.domain)&&typeof q.prompt==='string'&&q.prompt.trim().length>0&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(x=>typeof x==='string'&&x.trim().length>0)&&new Set(q.options.map(x=>x.trim().toLowerCase())).size===4&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4&&typeof q.explanation==='string'&&q.explanation.trim().length>0}";
if (!html.includes(oldValidation)) {
  console.error("STOP: validQuestion function differs from expected source; no output written.");
  process.exit(3);
}
html = html.replace(oldValidation, newValidation);

const researchAnchor = '<div class="card" style="margin-top:18px"><h3>Current scoring rules</h3>';
const empiricalMarkup = `<div class="card" style="margin-top:18px" id="empiricalPilotPanel">
<h3>Empirical pilot analysis</h3>
<p>Import an anonymised participant-by-item CSV to calculate exploratory item statistics and internal consistency in this browser. The file is not uploaded to a server.</p>
<div class="notice"><strong>Interpretation boundary:</strong> These are preliminary sample statistics, not proof of validity, fairness, an IQ score, or population norms. Use consented data and an appropriate research protocol.</div>
<div class="field"><label for="pilotCsv">Pilot response CSV</label><input id="pilotCsv" type="file" accept=".csv,text/csv"></div>
<p class="small muted">Format: one row per participant; one column per item ID (e.g. VCI-001); cells are 1=correct, 0=incorrect, blank=missing. An optional participant_id column is ignored during scoring. Do not include names, emails, phone numbers or other direct identifiers.</p>
<div class="actions"><button class="btn primary" type="button" id="analyzePilotBtn">Analyse pilot CSV</button><button class="btn" type="button" id="downloadPilotTemplateBtn">Download CSV template</button><button class="btn" type="button" id="downloadPilotReportBtn" disabled>Export analysis report</button></div>
<div id="pilotAnalysisStatus" class="small muted" role="status" aria-live="polite" style="margin-top:12px">No pilot dataset analysed in this session.</div>
<div id="pilotAnalysisResults" style="margin-top:14px"></div>
</div>
`;
if (!html.includes(researchAnchor)) {
  console.error("STOP: research-section anchor not found; no output written.");
  process.exit(4);
}
html = html.replace(researchAnchor, empiricalMarkup + researchAnchor);

const jsAnchor = "document.getElementById('year').textContent=new Date().getFullYear();";
const empiricalJs = `
/* Exploratory empirical pilot analysis. All computation stays in this browser tab. */
let lastPilotReport=null;
const PILOT_DOMAINS={VCI:'Verbal comprehension',WMI:'Working memory',PRI:'Perceptual reasoning',PSI:'Processing speed'};
function parsePilotCSV(text){
  const lines=text.replace(/^\\\\uFEFF/,'').split(/\\\\r?\\\\n/).filter(line=>line.trim().length);
  if(lines.length<2)throw new Error('CSV must include a header and at least one participant row.');
  // The template uses plain comma-separated numeric cells. Quoted commas are intentionally not accepted.
  const headers=lines[0].split(',').map(x=>x.trim());
  if(new Set(headers).size!==headers.length)throw new Error('CSV has duplicate column names.');
  const itemHeaders=headers.filter(h=>/^(VCI|WMI|PRI|PSI)-[A-Z0-9-]+$/.test(h));
  if(itemHeaders.length<2)throw new Error('Could not find at least two item columns. Use item IDs such as VCI-001.');
  const rows=[];
  for(let i=1;i<lines.length;i++){
    const cells=lines[i].split(',');
    if(cells.length!==headers.length)throw new Error('Row '+(i+1)+' has a different number of columns than the header.');
    const row={};
    itemHeaders.forEach(id=>{
      const raw=(cells[headers.indexOf(id)]||'').trim();
      if(raw==='' )row[id]=null;
      else if(raw==='0'||raw==='1')row[id]=Number(raw);
      else throw new Error('Item '+id+' in row '+(i+1)+' must be 1, 0, or blank.');
    });
    rows.push(row);
  }
  return {itemHeaders,rows};
}
function sampleVariance(values){
  if(values.length<2)return null;
  const mean=values.reduce((a,b)=>a+b,0)/values.length;
  return values.reduce((sum,x)=>sum+(x-mean)**2,0)/(values.length-1);
}
function corr(a,b){
  if(a.length<3)return null;
  const ma=a.reduce((x,y)=>x+y,0)/a.length, mb=b.reduce((x,y)=>x+y,0)/b.length;
  const va=a.reduce((s,x)=>s+(x-ma)**2,0), vb=b.reduce((s,x)=>s+(x-mb)**2,0);
  if(va===0||vb===0)return null;
  return a.reduce((s,x,i)=>s+(x-ma)*(b[i]-mb),0)/Math.sqrt(va*vb);
}
function kr20(completeRows,ids){
  const k=ids.length;
  if(k<2||completeRows.length<2)return null;
  const totals=completeRows.map(row=>ids.reduce((sum,id)=>sum+row[id],0));
  const totalVar=sampleVariance(totals);
  if(totalVar===null||totalVar<=0)return null;
  const sumPQ=ids.reduce((sum,id)=>{
    const p=completeRows.reduce((n,row)=>n+row[id],0)/completeRows.length;
    return sum+p*(1-p);
  },0);
  return (k/(k-1))*(1-sumPQ/totalVar);
}
function calculatePilotStats(dataset){
  const {itemHeaders:ids,rows}=dataset;
  const itemStats=ids.map(id=>{
    const answered=rows.map(r=>r[id]).filter(v=>v!==null);
    const p=answered.length?answered.reduce((a,b)=>a+b,0)/answered.length:null;
    const paired=rows.filter(r=>r[id]!==null&&ids.filter(other=>other!==id).every(other=>r[other]!==null));
    const itemValues=paired.map(r=>r[id]);
    const restValues=paired.map(r=>ids.filter(other=>other!==id).reduce((sum,other)=>sum+r[other],0));
    return {id,domain:id.split('-')[0],nAnswered:answered.length,missingRate:1-answered.length/rows.length,pCorrect:p,correctedItemTotalCorrelation:corr(itemValues,restValues),variation:new Set(answered).size};
  });
  const complete=rows.filter(r=>ids.every(id=>r[id]!==null));
  const domainStats=['VCI','WMI','PRI','PSI'].map(domain=>{
    const domainIds=ids.filter(id=>id.startsWith(domain+'-'));
    const domainComplete=rows.filter(r=>domainIds.every(id=>r[id]!==null));
    return {domain,items:domainIds.length,completeN:domainComplete.length,kr20:kr20(domainComplete,domainIds)};
  }).filter(d=>d.items>0);
  return {
    schemaVersion:'openiq-empirical-pilot-report-1.0',
    generatedAt:new Date().toISOString(),
    status:'exploratory-pilot-statistics-not-validation',
    participantRows:rows.length,
    itemCount:ids.length,
    completeCaseN:complete.length,
    missingCells:rows.reduce((n,r)=>n+ids.filter(id=>r[id]===null).length,0),
    totalCells:rows.length*ids.length,
    overallKr20:kr20(complete,ids),
    itemStats,domainStats,
    limitations:[
      'Exploratory estimates depend on this sample and may be unstable, especially with small samples or short tests.',
      'KR-20 is an internal-consistency estimate, not proof of validity, unidimensionality, fairness, or IQ measurement.',
      'Item difficulty and corrected item-total correlation are review signals, not automatic item keep/delete rules.',
      'No IQ score, percentile, population norm, diagnostic conclusion, or subgroup fairness conclusion is produced.',
      'Independent psychometric review and additional evidence are required before stronger claims.'
    ]
  };
}
function fmtStat(value){return value===null||!Number.isFinite(value)?'Not estimable':value.toFixed(3)}
function addPilotCell(row,text){const cell=document.createElement('td');cell.textContent=text;cell.style.cssText='padding:8px;border-bottom:1px solid var(--line);text-align:left;font-size:.86rem';row.append(cell)}
function renderPilotReport(report){
  const root=document.getElementById('pilotAnalysisResults');root.replaceChildren();
  const summary=document.createElement('div');summary.className='grid';summary.style.gridTemplateColumns='repeat(auto-fit,minmax(150px,1fr))';
  [
    ['Participant rows',String(report.participantRows)],
    ['Items analysed',String(report.itemCount)],
    ['Complete cases',String(report.completeCaseN)],
    ['Missing item cells',report.missingCells+' / '+report.totalCells],
    ['Overall KR-20',fmtStat(report.overallKr20)]
  ].forEach(([label,value])=>{const card=document.createElement('div');card.className='card';const small=document.createElement('p');small.textContent=label;const strong=document.createElement('strong');strong.style.fontSize='1.4rem';strong.textContent=value;card.append(small,strong);summary.append(card)});
  root.append(summary);
  const itemCard=document.createElement('div');itemCard.className='card';itemCard.style.marginTop='14px';
  const h=document.createElement('h3');h.textContent='Item statistics';itemCard.append(h);
  const wrap=document.createElement('div');wrap.style.overflowX='auto';const table=document.createElement('table');table.style.cssText='border-collapse:collapse;width:100%;min-width:620px';
  const thead=document.createElement('thead'),hr=document.createElement('tr');
  ['Item','Domain','Answered','Proportion correct','Corrected item–total r','Missing rate'].forEach(v=>{const th=document.createElement('th');th.textContent=v;th.style.cssText='text-align:left;padding:8px;border-bottom:2px solid var(--line);font-size:.82rem';hr.append(th)});thead.append(hr);table.append(thead);
  const tbody=document.createElement('tbody');
  report.itemStats.forEach(s=>{const tr=document.createElement('tr');[s.id,s.domain,String(s.nAnswered),fmtStat(s.pCorrect),fmtStat(s.correctedItemTotalCorrelation),(s.missingRate*100).toFixed(1)+'%'].forEach(v=>addPilotCell(tr,v));tbody.append(tr)});
  table.append(tbody);wrap.append(table);itemCard.append(wrap);root.append(itemCard);
  const domainCard=document.createElement('div');domainCard.className='card';domainCard.style.marginTop='14px';const dh=document.createElement('h3');dh.textContent='Domain-level internal consistency';domainCard.append(dh);
  const dt=document.createElement('table');dt.style.cssText='border-collapse:collapse;width:100%';const dbody=document.createElement('tbody');
  report.domainStats.forEach(d=>{const tr=document.createElement('tr');[PILOT_DOMAINS[d.domain]+' ('+d.domain+')',d.items+' item(s)',d.completeN+' complete cases','KR-20: '+fmtStat(d.kr20)].forEach(v=>addPilotCell(tr,v));dbody.append(tr)});dt.append(dbody);domainCard.append(dt);root.append(domainCard);
  const note=document.createElement('div');note.className='notice';note.textContent='Preliminary analysis only. KR-20 can be unstable or inappropriate for very short or multidimensional tests. Do not use these values as a pass/fail validation certificate.';root.append(note);
  const limitations=document.createElement('details');limitations.style.marginTop='12px';const sum=document.createElement('summary');sum.textContent='Read limitations and interpretation rules';limitations.append(sum);const ul=document.createElement('ul');report.limitations.forEach(x=>{const li=document.createElement('li');li.textContent=x;ul.append(li)});limitations.append(ul);root.append(limitations);
}
document.getElementById('analyzePilotBtn').addEventListener('click',async()=>{
  const file=document.getElementById('pilotCsv').files[0];
  const status=document.getElementById('pilotAnalysisStatus');
  if(!file){status.textContent='Choose a CSV file first.';return}
  try{
    const parsed=parsePilotCSV(await file.text());
    const report=calculatePilotStats(parsed);
    lastPilotReport=report;renderPilotReport(report);
    document.getElementById('downloadPilotReportBtn').disabled=false;
    status.textContent='Analysed '+report.participantRows+' participant rows and '+report.itemCount+' items. Data processed locally; no upload performed.';
  }catch(err){lastPilotReport=null;document.getElementById('downloadPilotReportBtn').disabled=true;document.getElementById('pilotAnalysisResults').replaceChildren();status.textContent='Analysis stopped: '+err.message}
});
document.getElementById('downloadPilotReportBtn').addEventListener('click',()=>{
  if(!lastPilotReport)return;
  downloadJson('openiq-empirical-pilot-report-'+new Date().toISOString().slice(0,10)+'.json',lastPilotReport);
});
document.getElementById('downloadPilotTemplateBtn').addEventListener('click',()=>{
  const ids=['VCI-001','VCI-002','VCI-003','WMI-001','WMI-002','WMI-003','PRI-001','PRI-002','PRI-003','PSI-001','PSI-002','PSI-003'];
  const csv='participant_id,'+ids.join(',')+'\\\\n';
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='openiq-pilot-template.csv';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
});
`;
if (!html.includes(jsAnchor)) {
  console.error("STOP: script insertion anchor not found; no output written.");
  process.exit(5);
}
html = html.replace(jsAnchor, empiricalJs + "\n" + jsAnchor);

if (html === original) {
  console.error("STOP: no changes made.");
  process.exit(6);
}
fs.writeFileSync(output, html, "utf8");
console.log("Created index.empirical.html; original index.html was not overwritten.");
console.log("Review, test on desktop/mobile, and inspect the diff before deployment.");
console.log("This adds exploratory analysis only; it does not statistically validate OpenIQ.");
