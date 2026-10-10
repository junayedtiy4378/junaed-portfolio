'use strict';
const crypto = require('node:crypto');
const COOKIE_NAME = 'ja_admin_session';
const contentPath = 'content/portfolio.json';
function configReady() { return ['ADMIN_PASSWORD','SESSION_SECRET','GITHUB_TOKEN','GITHUB_OWNER','GITHUB_REPO'].every(k=>!!process.env[k]); }
function json(res, code, body) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  return res.status(code).json(body);
}
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(kv => kv.trim().split(/=(.*)/s).slice(0,2)).filter(parts => parts[0]));
}
function digest(input) { return crypto.createHmac('sha256',process.env.SESSION_SECRET || '').update(input).digest('base64url'); }
function signedToken() {
  const payload = Buffer.from(JSON.stringify({exp:Date.now()+12*60*60*1000,role:'admin'})).toString('base64url');
  return payload+'.'+digest(payload);
}
function authed(req) {
  if (!configReady()) return false;
  const token = parseCookies(req)[COOKIE_NAME] || '';
  const [payload, sig, extra] = token.split('.');
  if (!payload || !sig || extra !== undefined) return false;
  const expected = digest(payload);
  const a = Buffer.from(sig); const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a,b)) return false;
  try { const v=JSON.parse(Buffer.from(payload,'base64url')); return v.role==='admin' && typeof v.exp==='number' && v.exp>Date.now(); } catch {return false;}
}
function passwordCorrect(password) {
  const given=crypto.createHash('sha256').update(String(password||'')).digest();
  const actual=crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD||'').digest();
  return crypto.timingSafeEqual(given, actual);
}
function cookieHeader(value,maxAge) { return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=${maxAge}`; }
function sameOrigin(req) {
  const origin=req.headers.origin;
  if (!origin) return false; // All write calls come from the same-origin admin browser.
  try {
    const host=(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim().toLowerCase();
    return new URL(origin).host.toLowerCase()===host && ['http:','https:'].includes(new URL(origin).protocol);
  } catch {return false;}
}
function ghPath(path) { return path.split('/').map(encodeURIComponent).join('/'); }
async function github(method, path, payload) {
  const owner=encodeURIComponent(process.env.GITHUB_OWNER||'');
  const repo=encodeURIComponent(process.env.GITHUB_REPO||'');
  const branch=process.env.GITHUB_BRANCH||'main';
  const url=`https://api.github.com/repos/${owner}/${repo}/contents/${ghPath(path)}${method==='GET'?`?ref=${encodeURIComponent(branch)}`:''}`;
  const r=await fetch(url,{method,headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${process.env.GITHUB_TOKEN}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'JunaedPortfolioCMS','Content-Type':'application/json'},body:payload ? JSON.stringify({...payload,branch}):undefined});
  let result;try{result=await r.json()}catch{result={};}
  if(!r.ok) {
    const e=new Error(r.status===409?'GitHub conflict: content has changed. Reload before saving.':r.status===404?'Repository or content not found. Check your GitHub environment variables.':r.status===403?'GitHub refused access. Check your token and Contents read/write permissions.':`GitHub returned HTTP ${r.status}.`);
    e.status=r.status;throw e;
  }
  return result;
}
async function readContent() {
  const file=await github('GET',contentPath);
  if(!file.content || !file.sha)throw new Error('Cannot read GitHub content.');
  return {content:JSON.parse(Buffer.from(file.content.replace(/\s/g,''),'base64').toString('utf8')),sha:file.sha};
}
function validateContent(data) {
  if (!data || Array.isArray(data) || typeof data!=='object') return 'Portfolio data must be an object.';
  if (!data.profile || typeof data.profile.name!=='string' || !data.profile.name.trim()) return 'Please enter your name.';
  for(const key of ['projects','skillGroups','courses','publications','interests','customSections']) {
    if(!Array.isArray(data[key]) || data[key].length>300) return `${key} must contain fewer than 301 entries.`;
  }
  if(!data.research || typeof data.research!=='object' || !Array.isArray(data.research.workflow))return 'Research details are missing.';
  const str=JSON.stringify(data);
  if(Buffer.byteLength(str,'utf8')>220000)return 'Content is too large (220KB maximum).';
  return null;
}
module.exports={COOKIE_NAME,contentPath,configReady,json,authed,passwordCorrect,signedToken,cookieHeader,sameOrigin,github,readContent,validateContent};
