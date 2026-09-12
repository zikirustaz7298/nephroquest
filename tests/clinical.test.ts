import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES } from '../data/cases';
import { newProgress, scoreCase } from '../lib/engine';
const gardener = CASES[0];
test('Dry Gardener BUN/Cr is calculated consistently in labs, mentor and debrief', () => {
  const bmp = gardener.testOptions.find(t => t.id === 'bmp')!;
  const ratio = bmp.results.find(r => r.name === 'BUN/Cr ratio')!;
  assert.equal(parseFloat(ratio.value), Number((42 / 2.9).toFixed(1)));
  assert.equal(ratio.flag, undefined);
  assert.match(bmp.reveals!, /not elevated/);
  assert.match(gardener.diagnosisExplanation, /14.5/);
  assert.match(gardener.teachingPoints[0], /14.5/);
  assert.doesNotMatch(gardener.diagnosisExplanation, /BUN\/Cr >20|Obstruction excluded clinically/);
});
test('Dry Gardener related teaching avoids diagnostic absolutes and cites its limits', () => {
  const fena = gardener.testOptions.find(t => t.id === 'fena')!;
  assert.match(fena.reveals!, /diuretic/);
  assert.doesNotMatch(JSON.stringify(gardener), /maximal urine concentration|Not frankly shocked|eosinophiluria\/rash = AIN|<1% = prerenal/);
  assert.match(gardener.teachingPoints.join(' '), /KDIGO 2012/);
  assert.match(gardener.managementOptions.find(m => m.id === 'm6')!.rationale, /urine output/);
});
test('Dry Gardener awards staging credit to KDIGO Stage 2, not Stage 3', () => {
  assert.equal(gardener.stagingQuestion?.correct, 'Stage 2');
  assert.match(gardener.stagingQuestion!.question, /creatinine criteria/);
  assert.match(gardener.stagingQuestion!.question, /presumed.*7 days/);
  assert.equal(scoreCase(newProgress(gardener.id), gardener, gardener.correctDiagnosis, 'Stage 2', []).staging, 10);
  assert.equal(scoreCase(newProgress(gardener.id), gardener, gardener.correctDiagnosis, 'Stage 3', []).staging, 0);
});
