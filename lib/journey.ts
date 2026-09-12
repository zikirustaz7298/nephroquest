import { CASES } from '../data/cases';
export interface Store { getItem(key:string):string|null; setItem(key:string,value:string):void }
export interface Journey { name:string; scores:Record<string,number>; cards:string[]; days:Record<string,{cases:string[];drills:number;cards:string[]}> }
export const REGIONS=['Dewdrop Meadows','Copperleaf Crossing','Thunderfern Peaks','Mirrorwater Grove','Elderroot Sanctuary'];
export const emptyJourney=():Journey=>({name:'Wandering healer',scores:{},cards:[],days:{}});
export function readJourney(store:Store):Journey {
 const p=emptyJourney();
 try { const s=JSON.parse(store.getItem('nq_scores')||'{}'); for(const c of CASES) if(typeof s?.[c.id]==='number' && Number.isFinite(s[c.id]) && s[c.id]>=0 && s[c.id]<=100) p.scores[c.id]=s[c.id]; } catch {}
 return p;
}
export function summary(p:Journey) { const xp=Object.values(p.scores).reduce((s,n)=>s+100+n,0);return {xp,level:1+Math.floor(xp/250),completed:Object.keys(p.scores).length}; }
export function unlocked(p:Journey,index:number) { return index===0 || p.scores[CASES[index-1]?.id]!==undefined; }
export function saveCase(store:Store,id:string,score:number,date:string) {
 if(!CASES.some(c=>c.id===id)||!Number.isFinite(score)) return;
 let raw:Record<string,unknown>={};try {const v=JSON.parse(store.getItem('nq_scores')||'{}'); if(v && typeof v==='object'&&!Array.isArray(v))raw=v;}catch{}
 const best=readJourney(store).scores[id]??0;raw[id]=Math.max(best,Math.min(100,Math.max(0,score)));store.setItem('nq_scores',JSON.stringify(raw));
}
