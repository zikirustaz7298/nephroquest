import test from 'node:test';
import assert from 'node:assert/strict';
import { readJourney, summary, unlocked, saveCase } from '../lib/journey';
const memory = (seed: Record<string,string> = {}) => ({ getItem: (k:string) => seed[k] ?? null, setItem: (k:string,v:string) => {seed[k]=v;} });
test('legacy best scores become XP and unlock next quest without losing scores', () => {
 const store=memory({nq_scores:JSON.stringify({'aki-prerenal-001':85})});
 const p=readJourney(store); assert.equal(summary(p).xp,185); assert.equal(unlocked(p,1),true); assert.equal(unlocked(p,2),false);
 saveCase(store,'aki-prerenal-001',40,'2026-09-12'); assert.equal(JSON.parse(store.getItem('nq_scores')!)['aki-prerenal-001'],85);
});
