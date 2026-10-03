const cities = ['shanghai','beijing','shenzhen','chongqing','guangzhou','suzhou','chengdu','hangzhou','wuhan','nanjing'];
const themes = ['history','food','art','family'];
const views = ['overview','industry','facets','play','climate','clusters','archive','living','history','future','sources'];
const modes = ['blind','life','walk','lens','time'];
const finite = (n,min,max) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
const choice = (value, values) => values.includes(value);
const list = (v, test, limit) => Array.isArray(v) && v.length <= limit && new Set(v).size === v.length && v.every(test);
const city = v => cities.includes(v);
const keyed = (v, values) => typeof v === 'string' && v.split(':').length === 2 && city(v.split(':')[0]) && values.includes(v.split(':')[1]);
export function validProfile(p) {
  if (!p || typeof p !== 'object' || p.version !== 1) return false;
  const f=p.favorites,s=p.snapshot,l=s?.life,w=s?.walk;
  if (!f || !list(f.cities,city,10) || !list(f.areas,v=>keyed(v,['0','1','2','3']),40) || !list(f.routes,v=>keyed(v,themes),40)) return false;
  if (!s || !city(s.city) || !choice(s.view,views) || !choice(s.vintage,[2024,2025]) || !choice(s.playMode,modes)) return false;
  if (!list(s.compare,city,4) || !Array.isArray(s.weights) || s.weights.length!==5 || !s.weights.every(v=>finite(v,0,100))) return false;
  if (!l || !['income','daily','travel','reserve'].every(k=>finite(l[k],0,1000000)) || !finite(l.limit,0,240) || !choice(l.family,['single','couple','child','elder']) || !choice(l.job,['digital','engineering','finance','health','creative','research'])) return false;
  if (!l.rents || !l.commutes || !cities.every(c=>finite(l.rents[c],0,1000000) && finite(l.commutes[c],0,300))) return false;
  if (!w || !choice(w.theme,themes) || !choice(w.pace,['easy','full']) || !Number.isInteger(w.stop) || !finite(w.stop,0,2)) return false;
  if (!list(w.checked,v=>typeof v==='string' && /^\w+:\w+:[012]$/.test(v) && city(v.split(':')[0]) && themes.includes(v.split(':')[1]),120)) return false;
  if (!list(s.areas,v=>Number.isInteger(v)&&finite(v,0,3),2) || s.areas.length!==2 || !choice(s.focus,['work','family','leisure'])) return false;
  const c=s.climate;
  if (!c || !Number.isInteger(c.month) || !finite(c.month,0,11) || !choice(c.metric,['temp','rain','sun']) || !finite(c.min,-20,35) || !finite(c.max,-10,45) || c.min>c.max || !finite(c.rain,0,600)) return false;
  return true;
}
