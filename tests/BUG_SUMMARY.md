# EmailORC QA Bug Summary

Run date: 2026-05-06
Command: `npm run test:e2e`
Result: 9 passed, 4 failed

## Priority Bugs

1. P1 - Client Admin can directly access `/mvp/admin`
   - Expected: Client Admin should not see Super Admin governance controls through direct URL access.
   - Actual: `/mvp/admin` renders Enterprise Governance for Client Admin.
   - Evidence: `Client Admin cannot force direct URL access to Super Admin console` failed.

2. P1 - Draft approval is not blocked below QA 90
   - Expected: QA scores below 90 should not expose an approval action.
   - Actual: Carlos Mena has QA 81 and still exposes `Approve Draft`.
   - Evidence: `QA scoring blocks approval below 90 and allows approval at 90+` failed.

3. P2 - CSV upload flow has no field mapping step
   - Expected: After CSV upload, user should be able to confirm or map CSV columns.
   - Actual: Upload immediately says records are loaded and validated; no field mapping UI appears.
   - Evidence: `CSV upload, field mapping expectations, validation, generation, and AI role output` failed on missing `field mapping`.

4. P2 - Campaign Board drag/drop movement does not update card column in Playwright/browser QA
   - Expected: Dragging Carlos Mena from `Needs Review` into `Approved` should move the card.
   - Actual: Approved column remains unchanged after drag/drop.
   - Evidence: `Campaign Board cards move between columns` failed.

## Additional Manual QA Notes

- Upload-generated drafts do not visibly identify ORC, SENTINEL, SCRIBE, or LEXI outputs.
- Upload, Records, Drafts, Board, and Export are mostly independent demo-state screens, so workflow data does not persist across modules.
- The Admin Console, user provisioning/editing, Brain Center settings, environment mode, Reply Assistant, Export Center, and safety messaging are covered and passing in the automated run.

