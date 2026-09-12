# Release-blocker remediation — held for review

## Outcome

Technical dependency and named clinical-data fixes are implemented and locally exercised. **Not approved for production; no main merge/push or deployment.** The clinician-review gate in V2-VERIFICATION.md remains unsatisfied. A separate reviewer agent has now inspected the complete remediation diff and rerun verification; this is code review, not clinician approval. The fixes may be committed and published to v2/dry-gardener without satisfying the production gate.

## Dependency decision and authoritative references

Next 14 is unsupported per https://nextjs.org/support-policy. Migrated to Maintenance LTS Next **15.5.25**, retaining React/React DOM 18.3.1 and the existing Next application. Registry peer requirements accept React 18.3.1. Avoided an unnecessary Next 16/React migration.

Current advisory https://github.com/advisories/GHSA-2xp9-vwfh-vxw4 lists Next 15.5.24 as patched for the AVIF image-optimization critical finding. The npm audit baseline also enumerated middleware authorization bypass and subsequent DoS/SSRF/cache issues; fresh audit of the complete resulting tree reports zero findings.

Next 15.5.25 still pins PostCSS 8.4.31. Added a **Next-scoped** npm override to PostCSS **8.5.28** and regenerated the lockfile. https://github.com/advisories/GHSA-fxqj-rqcc-2cmp specifies 8.5.23 as the patched version for the incomplete source-map read fix (earlier high findings were also present). No audit suppressions or severity exclusions were used. Full CSS production compilation and browser flows passed with the override. Recheck support status before release: Next 15's maintenance lifetime is finite.

## Executed verification

- Baseline `npx tsx --test tests/*.test.ts`: 8 passed.
- Baseline `npm audit --omit=dev --json`: 2 vulnerable packages, Next critical and PostCSS high.
- Wrote security version test first; `npx tsx --test tests/security.test.ts` failed on 14.2.15 before dependency changes, passed after.
- Wrote clinical tests in three RED/GREEN slices: Stage 3 answer rejected; high flag on BUN/Cr rejected; unqualified FeNa teaching rejected. Each failure was observed before its corresponding fix.
- `npm ci`: succeeded from committed-intent lockfile; zero vulnerabilities.
- `NODE_OPTIONS=--max-old-space-size=1024 npm run build`: Next 15.5.25 production compile, type checking and all 6 static pages succeeded, dynamic case route compiled.
- `npx tsx --test tests/*.test.ts`: **12 passed**, 0 failed.
- `npx playwright test`: **2 passed**, production build, installed Chrome; full chapter Stage 2 path, 100 score save / 200 XP, movement, dialogs, responsive layout, all five routes, theme/sound persistence.
- First browser attempt failed because a previous Next 14 process was still listening on 3999 and Playwright reused it against newly generated chunks. Identified exact process, stopped only that stale test server, changed `reuseExistingServer` to false, rebuilt and reran successfully. Browser suite now fails rather than silently accepting a pre-existing server.
- `npm audit --omit=dev` and `npm audit`: **found 0 vulnerabilities**, exit 0, also repeated after `npm ci`.
- `git diff --check`: clean. Added-line security pattern scan: clear (limited static check, not independent review).
- Programmatic comparison against 12b9d41: cases 2–5 byte-identical; lib/engine.ts and lib/journey.ts unchanged. Existing five expert paths still earn 100; save format and unknown legacy keys preserved.

## Independent code-review follow-up

- Reviewed all changed tracked files and all four new documentation/test files. No remaining blocking code-logic defect or added-line secret/injection pattern was found in this remediation scope.
- Found plain-HTTP, environment-specific mirror URLs in the dependency lockfile. Replaced these with canonical HTTPS npm registry download URLs, preserving package versions and integrity hashes. Verified the Next tarball integrity against the public registry, then successfully ran `npm ci --registry=https://registry.npmjs.org`.
- Independently reran the production build with type checking, all **12 unit tests**, and both **2 production-browser tests** against a fresh server: all passed. Both full and production-only audits against `https://registry.npmjs.org` reported **0 vulnerabilities**. These checks are not a comprehensive security certification.
- Programmatically verified cases 2–5 remain byte-identical to 12b9d41, with lib/engine.ts and lib/journey.ts unchanged. Recalculated both clinical ratios. No additional application or scoring changes were required.
- This review supersedes the earlier statement that independent code review was unavailable. Human clinician review and the educational-release limitations below remain unresolved; publishing the development branch is not production promotion.

## Clinical scope and outstanding gates (unchanged)

See DRY-GARDENER-CLINICAL-RATIONALE.md for source links, arithmetic, all inspected teaching surfaces and limits. No clinician approval. Other four cases/drill preserved but not clinically validated. Treatment-after-investigation game sequencing and fixed harm mechanics need clinician assessment before educational release. No separate current Malaysian adult AKI CPG was found; the Malaysian CKD source is explicitly limited to medication-safety context, not falsely cited for AKI staging.

Remote main was read with `git ls-remote origin refs/heads/main refs/heads/v2/dry-gardener` as e119aa70145aa5e982e756f50968de80b9671104. Local main contains the earlier audit commit 0d31db7 and has not been reset or rewritten. Release stops before promotion; there is no new production SHA or live deployment verification to claim.
