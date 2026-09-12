# Dry Gardener milestone verification

> Historical milestone record below. The dependency and Dry Gardener data issues were subsequently corrected; see [release-blocker verification](RELEASE-BLOCKER-VERIFICATION.md) and [clinical rationale](DRY-GARDENER-CLINICAL-RATIONALE.md). Independent code review and repeat technical verification are complete for those fixes. Human clinician review remains outstanding; production promotion is still blocked, but the fixes may be published to the development branch.

## Delivered on v2/dry-gardener
- Original local woodland SVG title illustration, green/cream/gold responsive shared shell, persistent opt-in sound and light/dark controls, skip link and reduced-motion CSS.
- Original canvas woodland infirmary and healer, unchanged collision geometry and keyboard/touch movement, equivalent accessible station buttons.
- Full original history → investigations → diagnosis → staging → management → scored debrief. Paid investigation results now update while the lab dialog stays open; initial labs and gathered history/results remain in the journal. Mentor guidance, dialog focus containment/Escape/return focus, completion reward and best-score-derived XP.
- All five original case records, clinical answer keys and scoring engine are byte-for-byte unchanged from e119aa7. nq_scores remains the save format; valid best scores and unknown legacy keys survive. No account or remote data collection.

## Executed gates
- `NODE_OPTIONS=--max-old-space-size=1024 npm run build`: success, all six static pages generated and dynamic case route compiled/type-checked.
- `npx tsx --test tests/*.test.ts`: 8 passed. All five expert paths score 100 with unchanged 40/25/15/10/10 components; duplicate costs, budget guards, harm idempotency, furniture/border collision, malformed storage and best-score preservation covered.
- `npx playwright test`: 2 passed against the actual production build in headless Chrome. Full Dry Gardener flow with history, mentor, all expert investigations, correct legacy diagnosis/stage/management produces Grade A, 100 saved and 200 journey XP after navigation. Canvas keyboard movement changes actual position. Escape dismisses dialogs. Abandon navigates back. Mobile 390×844 has no horizontal overflow; all five case intros load; theme/sound survive reload; reduced-motion context and mobile station interaction exercised. No pageerror in full gameplay test.
- Desktop/mobile PNG evidence in local ignored `artifacts/`: home-desktop.png, ward-desktop.png, home-mobile.png, ward-mobile.png. Real rendered desktop captures inspected; no claimed automated visual-diff baseline.
- `git diff --check`: clean. Added-line security scan found no eval, HTML injection, shell execution or hardcoded credential patterns. Independent reviewer unavailable in this subagent; this is NOT independent approval.

## Limits / release boundary
- Legacy clinical inconsistencies remain deliberately unchanged (notably gardener BUN/Cr narrative and staging answer). Visible educational-only/clinical-review warning applies throughout. These are not current Malaysian clinical guidance. Clinician review is required before educational release.
- `npm audit --omit=dev` reports 2 inherited production dependency findings: Next critical and PostCSS high. Suggested fix is a major Next upgrade; not silently performed in this design milestone. Do not promote this branch to production without dependency remediation and review.
- Existing lab drill is preserved, not redesigned or repaired in the narrowed chapter milestone. Full future campaign, profile, daily missions, collection, cloud/in-progress saves and 13-topic curriculum are not delivered. Existing persistence was best scores, not mid-case resume.
- No production deployment/configuration or main push. Remote main was read as e119aa70145aa5e982e756f50968de80b9671104 before branch push.
- Candidate Netlify branch URL `https://v2-dry-gardener--zingy-croissant-1821a5.netlify.app` returned HTTP 404 before push. Branch deploy enablement cannot be assumed; only a verified post-push deployment may be called live.
