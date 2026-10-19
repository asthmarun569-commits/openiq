(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  let itemRows = [];
  const mean = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : NaN;
  const variance = a => a.length < 2 ? NaN : a.reduce((s,x)=>s+(x-mean(a))**2,0)/(a.length-1);
  const sd = a => Math.sqrt(variance(a));
  const fmt = (n,d=2) => Number.isFinite(n) ? n.toFixed(d) : "Not estimable";
  const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function pearson(a,b){ if(a.length!==b.length||a.length<3)return NaN; const ma=mean(a),mb=mean(b); let num=0,da=0,db=0; for(let i=0;i<a.length;i++){num+=(a[i]-ma)*(b[i]-mb);da+=(a[i]-ma)**2;db+=(b[i]-mb)**2;} return da&&db?num/Math.sqrt(da*db):NaN; }
  function wilson(successes, n, z=1.96) {
    if (!n) return {low:NaN, high:NaN};
    const p=successes/n, z2=z*z, den=1+z2/n;
    const center=(p+z2/(2*n))/den;
    const half=z*Math.sqrt((p*(1-p)/n)+(z2/(4*n*n)))/den;
    return {low:Math.max(0,center-half),high:Math.min(1,center+half)};
  }
  function kr20(matrix) {
    if (matrix.length < 10 || matrix[0].length < 3) return { value: NaN, n: matrix.length, k: matrix[0]?.length || 0, reason: "Need at least 10 complete participants and 3 common items for this exploratory screen." };
    const k=matrix[0].length, totals=matrix.map(row=>row.reduce((s,x)=>s+x,0)), v=variance(totals);
    if (!Number.isFinite(v) || v <= 0) return { value: NaN, n: matrix.length, k, reason: "Participant total scores have no usable variance." };
    const sumPQ=Array.from({length:k},(_,j)=>{const p=mean(matrix.map(row=>row[j]));return p*(1-p);}).reduce((s,x)=>s+x,0);
    const value=(k/(k-1))*(1-sumPQ/v);
    return {value,n:matrix.length,k,reason: Number.isFinite(value) ? "Exploratory estimate only; interpret with item quality and study design." : "Could not estimate from these data."};
  }
  function analyse(reports){
    const valid=reports.filter(r=>r&&Array.isArray(r.responses)&&r.responses.length&&r.responses.every(x=>x&&typeof x.itemId==="string"&&typeof x.correct==="boolean"));
    if(!valid.length) throw new Error("No valid result files found. Choose JSON exports from OpenIQ.");
    const responseSets=valid.map(r=>r.responses), scores=responseSets.map(a=>a.reduce((n,x)=>n+(x.correct?1:0),0));
    const itemMap=new Map();
    responseSets.forEach(responses=>responses.forEach(x=>{ if(!itemMap.has(x.itemId))itemMap.set(x.itemId,{id:x.itemId,domain:x.domainCode||x.domain||"Unknown",vals:[],times:[]}); const it=itemMap.get(x.itemId);it.vals.push(x.correct?1:0);if(Number.isFinite(x.responseTimeMs)&&x.responseTimeMs>=0)it.times.push(x.responseTimeMs); }));
    const rows=[...itemMap.values()].map(it=>{ const matching=[]; responseSets.forEach(rs=>{const x=rs.find(y=>y.itemId===it.id);if(x)matching.push({v:x.correct?1:0,total:rs.filter(y=>(y.domainCode||y.domain||"Unknown")===it.domain).reduce((n,y)=>n+(y.correct?1:0),0)-(x.correct?1:0)});}); const ci=wilson(it.vals.reduce((n,x)=>n+x,0),it.vals.length); return {id:it.id,domain:it.domain,n:it.vals.length,difficulty:mean(it.vals),difficultyLow:ci.low,difficultyHigh:ci.high,itemTotal:pearson(matching.map(x=>x.v),matching.map(x=>x.total)),meanMs:mean(it.times),templateId:it.id.split('-')[1]||'unknown'}; }).sort((a,b)=>a.domain.localeCompare(b.domain)||a.id.localeCompare(b.id));
    // Reliability is estimated only from participants who received the exact same item IDs in a domain.
    // Do not align randomized response arrays by position: different questions are not interchangeable items.
    const domainNames=[...new Set(responseSets.flatMap(rs=>rs.map(x=>x.domainCode||x.domain||"Unknown")))];
    const domainReliability=domainNames.map(domain=>{
      const perPerson=responseSets.map(rs=>rs.filter(x=>(x.domainCode||x.domain||"Unknown")===domain));
      const counts=new Map(); perPerson.forEach(items=>items.forEach(x=>counts.set(x.itemId,(counts.get(x.itemId)||0)+1)));
      const common=[...counts.entries()].filter(([,n])=>n===perPerson.length).map(([id])=>id).sort();
      const matrix=perPerson.map(items=>{const map=new Map(items.map(x=>[x.itemId,x.correct?1:0]));return common.map(id=>map.get(id));});
      // Do not compute reliability on a randomized pool unless the same exact items were presented to every included participant.
      const result=common.length>=3 ? kr20(matrix) : {value:NaN,n:valid.length,k:common.length,reason:"Insufficient common items: randomized forms are not interchangeable. Use a fixed form or analyse a prespecified cohort that received the same calibrated items."};
      return {domain,n:valid.length,commonItems:common.length,kr20:result.value,reason:result.reason,ciNote:"No confidence interval calculated; use a suitable bootstrap or specialist analysis for uncertainty."};
    });
    return {valid,rejected:reports.length-valid.length,scores,rows,domainReliability,domains:[...new Set(rows.map(r=>r.domain))].map(domain=>{const rr=rows.filter(r=>r.domain===domain);return {domain,items:rr.length,meanDifficulty:mean(rr.map(x=>x.difficulty)),meanTime:mean(rr.map(x=>x.meanMs))};})};
  }
  function render(a){
    $('analysis-output').classList.remove('hidden');
    $('overview').innerHTML=`<p><b>Valid reports:</b> ${a.valid.length} &nbsp; <b>Rejected:</b> ${a.rejected}</p><p><b>Mean correct:</b> ${fmt(mean(a.scores),2)} of items per report</p><p><b>SD of total correct:</b> ${fmt(sd(a.scores),2)}</p><p><b>Mean percentage correct:</b> ${fmt(mean(a.valid.map(r=>100*r.responses.filter(x=>x.correct).length/r.responses.length)),1)}%</p>`;
    $('reliability').innerHTML=`<p>KR-20 is shown only when there are at least 10 complete reports and 3 common items for a domain. This is a conservative dashboard rule, not a universal psychometric standard.</p><p class="muted">Randomized forms often have no common item IDs. In that case the report says “Insufficient data” rather than calculating a misleading coefficient by aligning unrelated questions.</p>`;
    $('domain-reliability').querySelector('tbody').innerHTML=a.domainReliability.map(d=>`<tr><td>${esc(d.domain)}</td><td>${d.n}</td><td>${d.commonItems}</td><td>${Number.isFinite(d.kr20)?fmt(d.kr20,3):'Insufficient data'}</td><td>${esc(d.reason)}</td></tr>`).join('');
    $('items-table').querySelector('tbody').innerHTML=a.rows.map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.domain)}</td><td>${r.n}</td><td>${fmt(r.difficulty,3)} (${fmt(r.difficultyLow,3)}–${fmt(r.difficultyHigh,3)})</td><td>${fmt(r.itemTotal,3)}</td><td>${fmt(r.meanMs,0)}</td></tr>`).join('');
    $('domains').innerHTML=a.domains.map(d=>`<div class="domain-row"><div class="domain-meta"><b>${esc(d.domain)}</b><span>${d.items} unique items · mean difficulty ${fmt(d.meanDifficulty,3)}</span></div><div class="bar"><div style="width:${Math.max(0,Math.min(100,d.meanDifficulty*100))}%"></div></div></div>`).join('');
    itemRows=a.rows; $('download-csv').disabled=!itemRows.length;
  }
  $('analyse-button').addEventListener('click',async()=>{const files=[...$('files-input').files];if(!files.length){$('status').textContent='Select at least one JSON file first.';return;}try{const parsed=await Promise.all(files.map(async f=>JSON.parse(await f.text())));const a=analyse(parsed);render(a);$('status').textContent=`Analysed ${a.valid.length} valid report(s). All processing stayed in this browser.`;}catch(e){$('status').textContent=e.message;}});
  $('download-csv').addEventListener('click',()=>{const rows=[['itemId','domain','n','difficulty_proportion_correct','difficulty_95ci_low','difficulty_95ci_high','corrected_domain_item_total_correlation','mean_response_time_ms'],...itemRows.map(r=>[r.id,r.domain,r.n,r.difficulty,r.difficultyLow,r.difficultyHigh,r.itemTotal,r.meanMs])];const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='openiq-item-analysis.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
  if(typeof module!=="undefined"&&module.exports) module.exports={kr20,analyse,wilson};
})();
