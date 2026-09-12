import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
test('supported Next 15 release and patched PostCSS are installed', () => {
  assert.equal(require('next/package.json').version, '15.5.25');
  const nextRequire = createRequire(require.resolve('next/package.json'));
  assert.equal(nextRequire('postcss/package.json').version, '8.5.28');
});
