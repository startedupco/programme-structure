#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, 'tvet');
const TYPES = new Set(['NCV', 'NATED', 'OC', 'SKILLS', 'APPRENTICESHIP', 'OTHER']);
const OPTION_TYPES = new Set(['grade', 'ncv', 'abet', 'nqf', 'nated', 'plp', 'rpl']);
const ATT = new Set(['full-time', 'part-time']);

let errors = 0;
const err = (f, m) => { console.error(`ERROR ${f}: ${m}`); errors++; };

function checkSubjects(f, ctx, subjects) {
  if (!Array.isArray(subjects)) return err(f, `${ctx}.subjects must be an array`);
  subjects.forEach((s, i) => {
    const c = `${ctx}.subjects[${i}]`;
    if (typeof s.compulsory !== 'boolean') err(f, `${c}.compulsory must be boolean`);
    if (!['any', 'all'].includes(s.match)) err(f, `${c}.match must be any|all`);
    if (!Array.isArray(s.choices) || s.choices.length === 0) return err(f, `${c}.choices must be a non-empty array`);
    s.choices.forEach((ch, j) => {
      const cc = `${c}.choices[${j}]`;
      if (typeof ch.name !== 'string' || !ch.name.trim()) err(f, `${cc}.name must be a non-empty string`);
      if (!(ch.level === null || (typeof ch.level === 'number' && Number.isInteger(ch.level)))) err(f, `${cc}.level must be integer|null`);
      if (!(ch.percentage === null || (typeof ch.percentage === 'number' && ch.percentage >= 0 && ch.percentage <= 100))) err(f, `${cc}.percentage must be number 0-100|null`);
    });
  });
}

function checkOption(f, ctx, o) {
  if (!o || typeof o !== 'object') return err(f, `${ctx} must be an object`);
  if (!OPTION_TYPES.has(o.type)) return err(f, `${ctx}.type "${o.type}" invalid`);
  if (o.type === 'grade') {
    if (!(o.level === null || (typeof o.level === 'number' && Number.isInteger(o.level)))) err(f, `${ctx}.level must be integer|null`);
    if (!(o.aps === null || (typeof o.aps === 'number' && Number.isInteger(o.aps)))) err(f, `${ctx}.aps must be integer|null`);
    if (o.subjects !== undefined) checkSubjects(f, ctx, o.subjects);
  } else if (['ncv', 'abet', 'nated'].includes(o.type)) {
    if (o.level === undefined || o.level === null) err(f, `${ctx}.level is required for type ${o.type}`);
    if (o.type !== 'nated' && !(typeof o.level === 'number' && Number.isInteger(o.level))) err(f, `${ctx}.level must be an integer`);
    if (o.subjects !== undefined) checkSubjects(f, ctx, o.subjects);
  } else if (o.type === 'nqf') {
    if (!(typeof o.level === 'number' && Number.isInteger(o.level))) err(f, `${ctx}.level must be an integer`);
    if (!('field' in o)) err(f, `${ctx}.field is required (may be null)`);
  } else if (o.type === 'plp' || o.type === 'rpl') {
    if (typeof o.accepted !== 'boolean') err(f, `${ctx}.accepted must be boolean`);
  }
}

function checkFile(file) {
  const f = path.basename(file);
  let d;
  try { d = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); }
  catch (e) { return err(f, `invalid JSON: ${e.message}`); }

  ['institution', 'province', 'source_files', 'updated', 'programme_count', 'programmes'].forEach(k => {
    if (!(k in d)) err(f, `missing top-level key "${k}"`);
  });
  if (typeof d.institution !== 'string' || !d.institution.trim()) err(f, 'institution must be a non-empty string');
  if (typeof d.province !== 'string' || !d.province.trim()) err(f, 'province must be a non-empty string');
  if (!Array.isArray(d.source_files) || d.source_files.length === 0) err(f, 'source_files must be a non-empty array');
  if (!Array.isArray(d.programmes)) return err(f, 'programmes must be an array');
  if (d.programme_count !== d.programmes.length) err(f, `programme_count ${d.programme_count} != programmes.length ${d.programmes.length}`);
  if (d.programmes.length === 0) err(f, 'file has 0 programmes');

  const names = new Set();
  d.programmes.forEach((p, i) => {
    const ctx = `programmes[${i}]`;
    if (p.institution !== d.institution) err(f, `${ctx}.institution "${p.institution}" != file institution`);
    const pr = p.programme;
    if (!pr || typeof pr !== 'object') { err(f, `${ctx}.programme missing`); return; }
    if (typeof pr.name !== 'string' || !pr.name.trim()) err(f, `${ctx}.programme.name must be a non-empty string`);
    const key = pr.name.toLowerCase().trim();
    if (names.has(key)) err(f, `duplicate programme name "${pr.name}"`);
    names.add(key);
    if (!TYPES.has(pr.type)) err(f, `${ctx}.programme.type "${pr.type}" invalid`);
    if (!(pr.nqf_level === null || (typeof pr.nqf_level === 'number' && Number.isInteger(pr.nqf_level) && pr.nqf_level >= 1 && pr.nqf_level <= 10))) err(f, `${ctx}.programme.nqf_level must be 1-10 integer|null`);
    if (!(pr.duration === null || (pr.duration && typeof pr.duration === 'object' && typeof pr.duration.value === 'number' && typeof pr.duration.unit === 'string'))) err(f, `${ctx}.programme.duration must be null or {value,unit}`);
    if (pr.credits !== null && pr.credits !== undefined && typeof pr.credits !== 'number') err(f, `${ctx}.programme.credits must be number|null`);
    if (!Array.isArray(pr.attendance)) err(f, `${ctx}.programme.attendance must be an array`);
    else pr.attendance.forEach(a => { if (!ATT.has(a)) err(f, `${ctx}.programme.attendance contains invalid value "${a}"`); });
    if (!(pr.campus === null || Array.isArray(pr.campus))) err(f, `${ctx}.programme.campus must be array|null`);
    if (typeof pr.description !== 'string' && pr.description !== null) err(f, `${ctx}.programme.description must be string|null`);
    if (typeof pr.saqa_code !== 'string' && pr.saqa_code !== null) err(f, `${ctx}.programme.saqa_code must be string|null`);
    if (typeof pr.faculty !== 'string' && pr.faculty !== null) err(f, `${ctx}.programme.faculty must be string|null`);

    const er = p.entry_requirements;
    if (!er || typeof er !== 'object') { err(f, `${ctx}.entry_requirements missing`); return; }
    if (!er.age || typeof er.age !== 'object') err(f, `${ctx}.entry_requirements.age missing`);
    else ['min', 'max'].forEach(k => {
      if (!(er.age[k] === null || (typeof er.age[k] === 'number' && Number.isInteger(er.age[k])))) err(f, `${ctx}.entry_requirements.age.${k} must be integer|null`);
    });
    if (!['any', 'all'].includes(er.match)) err(f, `${ctx}.entry_requirements.match must be any|all`);
    if (!Array.isArray(er.options)) return err(f, `${ctx}.entry_requirements.options must be an array`);
    if (er.options.length === 0) err(f, `${ctx}.entry_requirements.options is empty - user cannot be checked YES/NO`);
    er.options.forEach((o, j) => checkOption(f, `${ctx}.entry_requirements.options[${j}]`, o));
    if (er.notes !== undefined) {
      if (!Array.isArray(er.notes) || er.notes.some(n => typeof n !== 'string')) err(f, `${ctx}.entry_requirements.notes must be an array of strings`);
    }
  });
}

const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f.endsWith('.json') && f !== 'index.json') : [];
if (files.length === 0) { console.error(`No .json files in ${DIR}`); process.exit(1); }
files.sort().forEach(f => checkFile(path.join(DIR, f)));
console.log(`\nChecked ${files.length} files: ${errors === 0 ? 'ALL VALID' : errors + ' ERROR(S)'}`);
process.exit(errors === 0 ? 0 : 1);
