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
  function reliabilityStats(matrix) {
    const base=kr20(matrix), totals=matrix.map(row=>row.reduce((s,x)=>s+x,0));
    const scoreSd=sd(totals);
    const sem=Number.isFinite(base.value)&&base.value>=0&&base.value<=1&&Number.isFinite(scoreSd)?scoreSd*Math.sqrt(1-base.value):NaN;
    let reliabilityCI={low:NaN,high:NaN},semCI={low:NaN,high:NaN};
    // Participant-level nonparametric bootstrap; report intervals only with >=30 complete participants.
    if(matrix.length>=30 && matrix[0]?.length>=3) {
      const rels=[], sems=[], n=matrix.length;
      for(let b=0;b<500;b++) {
        const sample=Array.from({length:n},()=>matrix[Math.floor(Math.random()*n)]);
        const r=kr20(sample).value, totalScores=sample.map(row=>row.reduce((a,x)=>a+x,0)), s=sd(totalScores);
        if(Number.isFinite(r)) rels.push(r);
        if(Number.isFinite(r)&&r>=0&&r<=1&&Number.isFinite(s)) sems.push(s*Math.sqrt(1-r));
      }
      const percentile=(xs,p)=>{if(!xs.length)return NaN;xs.sort((a,b)=>a-b);return xs[Math.min(xs.length-1,Math.max(0,Math.floor(p*(xs.length-1))))];};
      if(rels.length>=400) reliabilityCI={low:percentile(rels,.025),high:percentile(rels,.975)};
      if(sems.length>=400) semCI={low:percentile(sems,.025),high:percentile(sems,.975)};
    }
    return {...base,scoreSd,sem,reliabilityCILow:reliabilityCI.low,reliabilityCIHigh:reliabilityCI.high,semCILow:semCI.low,semCIHigh:semCI.high};
  }
  // Screening thresholds are pragmatic review prompts, not validated cutoffs or automatic item deletion rules.
  function reviewFlag(it,p,r,ci){
    if(it.vals.length<30)return 'Insufficient pilot N: collect more responses before interpreting';
    if(Number.isFinite(r)&&r<0)return 'Priority review: negative corrected item-total correlation';
    if(Number.isFinite(r)&&r<0.10)return 'Review: weak corrected item-total relationship';
    if(p<0.20)return 'Review: very difficult in this sample';
    if(p>0.90)return 'Review: very easy in this sample';
    if(!Number.isFinite(r))return 'Review: discrimination not estimable';
    if(ci.high-ci.low>0.30)return 'Uncertain estimate: difficulty interval is wide';
    return 'No automatic flag; content review still required';
  }
  function analyse(reports){
    const valid=reports.filter(r=>r&&Array.isArray(r.responses)&&r.responses.length&&r.responses.every(x=>x&&typeof x.itemId==="string"&&typeof x.correct==="boolean"));
    if(!valid.length) throw new Error("No valid result files found. Choose JSON exports from OpenIQ.");
    const responseSets=valid.map(r=>r.responses), scores=responseSets.map(a=>a.reduce((n,x)=>n+(x.correct?1:0),0));
    const itemMap=new Map();
    responseSets.forEach(responses=>responses.forEach(x=>{ if(!itemMap.has(x.itemId))itemMap.set(x.itemId,{id:x.itemId,templateId:x.templateId||x.family||x.itemId,domain:x.domainCode||x.domain||"Unknown",vals:[],times:[]}); const it=itemMap.get(x.itemId);it.vals.push(x.correct?1:0);if(Number.isFinite(x.responseTimeMs)&&x.responseTimeMs>=0)it.times.push(x.responseTimeMs); }));
    const rows=[...itemMap.values()].map(it=>{ const matching=[]; responseSets.forEach(rs=>{const x=rs.find(y=>y.itemId===it.id);if(x)matching.push({v:x.correct?1:0,total:rs.filter(y=>(y.domainCode||y.domain||"Unknown")===it.domain).reduce((n,y)=>n+(y.correct?1:0),0)-(x.correct?1:0)});}); const ci=wilson(it.vals.reduce((n,x)=>n+x,0),it.vals.length); return {id:it.id,domain:it.domain,n:it.vals.length,difficulty:mean(it.vals),difficultyLow:ci.low,difficultyHigh:ci.high,itemTotal:pearson(matching.map(x=>x.v),matching.map(x=>x.total)),meanMs:mean(it.times),templateId:it.templateId||'unknown',reviewFlag:reviewFlag(it,mean(it.vals),pearson(matching.map(x=>x.v),matching.map(x=>x.total)),ci)}; }).sort((a,b)=>a.domain.localeCompare(b.domain)||a.id.localeCompare(b.id));
    // Reliability is estimated only from participants who received the exact same item IDs.
    // Do not align randomized response arrays by position: different questions are not interchangeable items.
    const domainNames=[...new Set(responseSets.flatMap(rs=>rs.map(x=>x.domainCode||x.domain||"Unknown")))];
    const buildMatrix=(sets,filterFn)=>{
      const perPerson=sets.map(rs=>rs.filter(filterFn));
      const counts=new Map(); perPerson.forEach(items=>items.forEach(x=>counts.set(x.itemId,(counts.get(x.itemId)||0)+1)));
      const common=[...counts.entries()].filter(([,n])=>n===perPerson.length).map(([id])=>id).sort();
      const matrix=perPerson.map(items=>{const map=new Map(items.map(x=>[x.itemId,x.correct?1:0]));return common.map(id=>map.get(id));});
      return {common,matrix};
    };
    const overall=buildMatrix(responseSets,()=>true);
    const overallResult=overall.common.length>=3?reliabilityStats(overall.matrix):{value:NaN,n:valid.length,k:overall.common.length,reason:"Insufficient common items: use a fixed form with the same item IDs for every participant."};
    const domainReliability=domainNames.map(domain=>{
      const {common,matrix}=buildMatrix(responseSets,x=>(x.domainCode||x.domain||"Unknown")===domain);
      const result=common.length>=3 ? reliabilityStats(matrix) : {value:NaN,n:valid.length,k:common.length,reason:"Insufficient common items: randomized forms are not interchangeable. Use the fixed calibration form."};
      return {domain,n:valid.length,commonItems:common.length,kr20:result.value,scoreSd:result.scoreSd,sem:result.sem,kr20Low:result.reliabilityCILow,kr20High:result.reliabilityCIHigh,semLow:result.semCILow,semHigh:result.semCIHigh,reason:result.reason||"Exploratory estimate only."};
    });
    return {valid,rejected:reports.length-valid.length,scores,rows,overallReliability:{...overallResult,commonItems:overall.common.length},domainReliability,domains:[...new Set(rows.map(r=>r.domain))].map(domain=>{const rr=rows.filter(r=>r.domain===domain);return {domain,items:rr.length,meanDifficulty:mean(rr.map(x=>x.difficulty)),meanTime:mean(rr.map(x=>x.meanMs))};})};
  }
  function render(a){
    $('analysis-output').classList.remove('hidden');
    $('overview').innerHTML=`<p><b>Valid reports:</b> ${a.valid.length} &nbsp; <b>Rejected:</b> ${a.rejected}</p><p><b>Mean correct:</b> ${fmt(mean(a.scores),2)} of items per report</p><p><b>SD of total correct:</b> ${fmt(sd(a.scores),2)}</p><p><b>Mean percentage correct:</b> ${fmt(mean(a.valid.map(r=>100*r.responses.filter(x=>x.correct).length/r.responses.length)),1)}%</p>`;
    const o=a.overallReliability;
    $('reliability').innerHTML=`<p><b>Overall common-item KR-20:</b> ${Number.isFinite(o.value)?fmt(o.value,3):'Not estimable'} · <b>Common items:</b> ${o.commonItems} · <b>Score SD:</b> ${fmt(o.scoreSd,2)} · <b>SEM:</b> ${fmt(o.sem,2)} raw-score points</p><p><b>KR-20 95% bootstrap interval:</b> ${Number.isFinite(o.reliabilityCILow)?`${fmt(o.reliabilityCILow,3)}–${fmt(o.reliabilityCIHigh,3)}`:'Not estimated (requires at least 30 complete reports and adequate bootstrap samples)'} · <b>SEM 95% bootstrap interval:</b> ${Number.isFinite(o.semCILow)?`${fmt(o.semCILow,2)}–${fmt(o.semCIHigh,2)}`:'Not estimated'}</p><p>${esc(o.reason||'Exploratory internal-consistency estimate from common items only.')}</p><p class="muted">SEM = SD × √(1 − reliability). It is expressed in raw points, not IQ points. Bootstrap intervals are approximate and do not correct for sampling bias. Reliability does not establish validity or test–retest stability.</p>`;
    $('domain-reliability').querySelector('tbody').innerHTML=a.domainReliability.map(d=>`<tr><td>${esc(d.domain)}</td><td>${d.n}</td><td>${d.commonItems}</td><td>${Number.isFinite(d.kr20)?fmt(d.kr20,3):'Insufficient data'}${Number.isFinite(d.kr20Low)?` (${fmt(d.kr20Low,3)}–${fmt(d.kr20High,3)})`:''}</td><td>${fmt(d.scoreSd,2)}</td><td>${fmt(d.sem,2)}${Number.isFinite(d.semLow)?` (${fmt(d.semLow,2)}–${fmt(d.semHigh,2)})`:''}</td><td>${esc(d.reason)}</td></tr>`).join('');
    $('items-table').querySelector('tbody').innerHTML=a.rows.map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.domain)}</td><td>${r.n}</td><td>${fmt(r.difficulty,3)} (${fmt(r.difficultyLow,3)}–${fmt(r.difficultyHigh,3)})</td><td>${fmt(r.itemTotal,3)}</td><td>${fmt(r.meanMs,0)}</td><td>${esc(r.reviewFlag)}</td></tr>`).join('');
    $('domains').innerHTML=a.domains.map(d=>`<div class="domain-row"><div class="domain-meta"><b>${esc(d.domain)}</b><span>${d.items} unique items · mean difficulty ${fmt(d.meanDifficulty,3)}</span></div><div class="bar"><div style="width:${Math.max(0,Math.min(100,d.meanDifficulty*100))}%"></div></div></div>`).join('');
    itemRows=a.rows; $('download-csv').disabled=!itemRows.length;
  }
  if(typeof document!=="undefined") {
  $('analyse-button').addEventListener('click',async()=>{const files=[...$('files-input').files];if(!files.length){$('status').textContent='Select at least one JSON file first.';return;}try{const parsed=await Promise.all(files.map(async f=>JSON.parse(await f.text())));const a=analyse(parsed);render(a);$('status').textContent=`Analysed ${a.valid.length} valid report(s). All processing stayed in this browser.`;}catch(e){$('status').textContent=e.message;}});
  $('download-csv').addEventListener('click',()=>{const rows=[['itemId','templateId','domain','n','difficulty_proportion_correct','difficulty_95ci_low','difficulty_95ci_high','corrected_domain_item_total_correlation','mean_response_time_ms','empirical_review_prompt'],...itemRows.map(r=>[r.id,r.templateId,r.domain,r.n,r.difficulty,r.difficultyLow,r.difficultyHigh,r.itemTotal,r.meanMs,r.reviewFlag])];const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='openiq-item-analysis.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
  }
  if(typeof module!=="undefined"&&module.exports) module.exports={kr20,reliabilityStats,analyse,wilson};
})();
