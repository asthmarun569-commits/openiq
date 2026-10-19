#!/usr/bin/env node
"use strict";
const fs = require("node:fs");

function parseCSV(text) {
  // RFC-4180-style parser: handles escaped quotes, commas, CRLF, and quoted newlines.
  const input = text.replace(/^\uFEFF/, "");
  const records = [];
  let record = [], field = "", quoted = false, afterQuote = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { quoted = false; afterQuote = true; }
      else field += ch;
      continue;
    }
    if (afterQuote && ch !== ',' && ch !== '\r' && ch !== '\n' && ch !== ' ' && ch !== '\t') {
      throw new Error("Malformed CSV: unexpected character after closing quote.");
    }
    if (ch === '"') {
      if (field.length !== 0) throw new Error("Malformed CSV: quote inside unquoted field.");
      quoted = true; afterQuote = false;
    } else if (ch === ',') {
      record.push(field.trim()); field = ""; afterQuote = false;
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      record.push(field.trim());
      if (record.some(v => v !== "")) records.push(record);
      record = []; field = ""; afterQuote = false;
    } else {
      field += ch;
    }
  }
  if (quoted) throw new Error("Malformed CSV: unclosed quote.");
  if (field.length || record.length) {
    record.push(field.trim());
    if (record.some(v => v !== "")) records.push(record);
  }
  if (records.length < 2) throw new Error("CSV must contain a header and at least one data row.");
  const headers = records[0].map(s => s.trim());
  if (headers.some(h => !h)) throw new Error("CSV contains an empty header name.");
  if (new Set(headers).size !== headers.length) throw new Error("CSV contains duplicate header names.");
  const required = ["participant_code", "openiq_score", "reference_score", "openiq_score_type", "reference_score_type", "eligible"];
  for (const h of required) if (!headers.includes(h)) throw new Error(`Missing required column: ${h}`);
  return records.slice(1).map((vals, idx) => {
    if (vals.length !== headers.length) throw new Error(`Malformed CSV: row ${idx + 2} has ${vals.length} fields; expected ${headers.length}.`);
    const row = {}; headers.forEach((h, i) => row[h] = vals[i]); row.__line = idx + 2; return row;
  });
}
function wilson(k,n,z=1.959963984540054) {
  if (!n) return {low:null,high:null};
  const p=k/n, z2=z*z, den=1+z2/n;
  const center=(p+z2/(2*n))/den;
  const half=z*Math.sqrt((p*(1-p)/n)+(z2/(4*n*n)))/den;
  return {low:Math.max(0,center-half),high:Math.min(1,center+half)};
}
// These limits are an explicit protocol guard, not a universal property of every IQ test.
// Confirm that 40–160 and integer scores match the chosen reference assessment before
// preregistration. Do not widen them after seeing results.
const IQ_SCORE_MIN = 40;
const IQ_SCORE_MAX = 160;
function analyze(rows) {
  const eligible=[], excluded=[], invalid=[];
  // A repeated code makes the identity/attempt ambiguous. Flag EVERY row with
  // that code and require manual resolution under the study protocol; never
  // silently keep the first or last record.
  const counts = new Map();
  for (const r of rows) {
    const code = (r.participant_code || "").trim();
    if (code) counts.set(code, (counts.get(code) || 0) + 1);
  }
  for (const r of rows) {
    const code=(r.participant_code||"").trim();
    if (!code) { invalid.push({line:r.__line,reason:"missing participant_code"}); continue; }
    if (counts.get(code) > 1) { invalid.push({line:r.__line,code,reason:"duplicate participant_code; all rows with this code require manual resolution"}); continue; }
    const eligibleFlag=(r.eligible||"").trim().toLowerCase();
    if (eligibleFlag !== "yes" && eligibleFlag !== "no") {
      invalid.push({line:r.__line,code,reason:"eligible must be exactly yes or no"}); continue;
    }
    if (eligibleFlag === "no") { excluded.push({line:r.__line,code,reason:r.exclusion_reason||"eligible is no"}); continue; }
    if (r.openiq_score === "" || r.reference_score === "") {
      invalid.push({line:r.__line,code,reason:"missing paired score"}); continue;
    }
    if (!Number.isFinite(Number(r.openiq_score)) || !Number.isFinite(Number(r.reference_score))) {
      invalid.push({line:r.__line,code,reason:"scores must be finite numeric values"}); continue;
    }
    const a=Number(r.openiq_score), b=Number(r.reference_score);
    const openType=(r.openiq_score_type||"").trim().toLowerCase();
    const refType=(r.reference_score_type||"").trim().toLowerCase();
    if (openType !== "iq" || refType !== "iq") {
      invalid.push({line:r.__line,code,reason:"primary ±5-point IQ agreement requires both score types to be 'iq'; raw percentages/practice scores are not comparable to IQ scores"}); continue;
    }
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
      invalid.push({line:r.__line,code,reason:"IQ scores must be whole numbers under this protocol"}); continue;
    }
    if (a < IQ_SCORE_MIN || a > IQ_SCORE_MAX || b < IQ_SCORE_MIN || b > IQ_SCORE_MAX) {
      invalid.push({line:r.__line,code,reason:`IQ scores must be within the preregistered ${IQ_SCORE_MIN}–${IQ_SCORE_MAX} range`}); continue;
    }
    const err=a-b; eligible.push({code,err,within5:Math.abs(err)<=5,age_band:r.age_band||"unspecified",form_id:r.form_id||"unspecified"});
  }
  const n=eligible.length;
  if (!n) return {n:0,excluded:excluded.length,invalidCount:invalid.length,duplicateCodes:[...counts.entries()].filter(([,count])=>count>1).map(([code])=>code),invalidRows:invalid,excludedRows:excluded,invalid,exclusions:excluded,warning:"No valid eligible paired observations; no accuracy estimate calculated."};
  const within=eligible.filter(r=>r.within5).length;
  const errs=eligible.map(r=>r.err);
  const bias=errs.reduce((a,b)=>a+b,0)/n;
  const mae=errs.reduce((a,b)=>a+Math.abs(b),0)/n;
  const rmse=Math.sqrt(errs.reduce((a,b)=>a+b*b,0)/n);
  const ci=wilson(within,n);
  const subgroup={};
  for (const r of eligible) {
    const key=r.age_band; (subgroup[key]??=[]).push(r);
  }
  const subgroupSummary=Object.fromEntries(Object.entries(subgroup).map(([k,arr])=>{
    const s=arr.filter(r=>r.within5).length, interval=wilson(s,arr.length);
    return [k,{n:arr.length,within5:s,rate:s/arr.length,ci95:interval,warning:arr.length<20?"Small subgroup; estimates are highly uncertain.":undefined}];
  }));
  return {
    n, excluded:excluded.length, invalidCount:invalid.length, duplicateCodes: [...counts.entries()].filter(([,count])=>count>1).map(([code])=>code),
    within5Count:within, within5Rate:within/n, within5Wilson95:ci,
    meanSignedError:bias, meanAbsoluteError:mae, rootMeanSquaredError:rmse,
    subgroupByAgeBand:subgroupSummary, invalidRows:invalid, exclusions:excluded,
    decision:"DESCRIPTIVE ONLY — do not automatically declare validation success. Compare the prespecified lower confidence bound with the preregistered criterion and review bias, errors, construct validity, fairness, norms, and study quality.",
    limitations:["Duplicate participant codes cause all records with that code to be flagged; resolve against the study protocol before rerunning.","A within-5 agreement rate does not alone establish IQ-test validity.","Wilson interval is a descriptive binomial interval; account for design effects or clustering if applicable.","Reference-score measurement error and appropriateness must be evaluated separately.","Do not interpret results from a development/tuning sample as independent validation."]
  };
}
if (require.main===module) {
  const file=process.argv[2];
  if (!file) { console.error("Usage: node analyze-validation.js validation-data.csv"); process.exit(2); }
  try { const report=analyze(parseCSV(fs.readFileSync(file,"utf8"))); process.stdout.write(JSON.stringify(report,null,2)+"\n"); }
  catch(e) { console.error(`Analysis failed: ${e.message}`); process.exit(1); }
}
module.exports={parseCSV,wilson,analyze,IQ_SCORE_MIN,IQ_SCORE_MAX};
