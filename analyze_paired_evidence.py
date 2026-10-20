#!/usr/bin/env python3
import csv, math, random, statistics, sys

def q(a,p):
 a=sorted(a); k=(len(a)-1)*p; lo=int(k); hi=min(lo+1,len(a)-1); return a[lo]+(a[hi]-a[lo])*(k-lo)
def main(path):
 with open(path,newline='',encoding='utf-8-sig') as f: rows=list(csv.DictReader(f))
 pairs=[]; rejected=0
 for r in rows:
  try:
   if r.get('eligible','').lower()!='yes' or r.get('openiq_score_type','').lower()!='iq' or r.get('reference_score_type','').lower()!='iq' or r.get('reference_admin_qualified','').lower()!='yes' or not r.get('reference_instrument_code','').strip() or 'SYNTH' in r.get('participant_code','').upper(): raise ValueError()
   x=float(r['openiq_score']); y=float(r['reference_score'])
   if not(math.isfinite(x) and math.isfinite(y)): raise ValueError()
   pairs.append((x,y))
  except Exception: rejected+=1
 print(f'Rows read: {len(rows)}; rejected/ineligible: {rejected}; eligible pairs: {len(pairs)}')
 if not pairs:
  print('No valid independent IQ-reference pairs. No psychometric evidence or accuracy claim can be calculated.'); return
 d=[x-y for x,y in pairs]; ad=[abs(x) for x in d]; n=len(d); hit=[int(x<=5) for x in ad]
 rng=random.Random(20261020); boot=[]
 for _ in range(5000): boot.append(sum(hit[rng.randrange(n)] for j in range(n))/n)
 print(f'Within ±5: {sum(hit)/n:.3f}; percentile bootstrap 95% CI {q(boot,.025):.3f}–{q(boot,.975):.3f}')
 print(f'Signed bias: {statistics.mean(d):.2f}; MAE: {statistics.mean(ad):.2f}; RMSE: {math.sqrt(statistics.mean(x*x for x in d)):.2f}')
 print('Interpret only for genuine comparable IQ-point scores and a prespecified, valid study. Correlation alone is not agreement.')
if __name__=='__main__':
 if len(sys.argv)!=2: sys.exit('Usage: python3 analyze_paired_evidence.py paired.csv')
 main(sys.argv[1])
