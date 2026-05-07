# Manual QA Checklist

Date: 2026-05-06
App: EmailORC / Growth Center
URL: http://localhost:3000

## Checked

- Login and logout with Super Admin and Client Admin demo accounts.
- Role-based sidebar visibility for Admin Console.
- Admin Console user list, user provisioning modal, edit user modal, and environment controls.
- Dashboard credit display and safety banners.
- Brain Center usage, model settings, API connection, and playbook tabs.
- Upload flow with a 3-contact CSV fixture.
- Records page validation states for missing email and do-not-contact records.
- Draft review, QA scores, and approval actions.
- Reply Assistant classification and approval flow.
- Campaign Board drag/drop movement.
- Export Center action state.
- Security messaging for auto-send, DNC, and masked API key.

## UX and Functional Notes

- Several screens are demo-only and do not persist workflow data between Upload, Records, Drafts, Board, and Export.
- CSV upload has no explicit field-mapping step, even though the workflow expects one.
- Upload generation does not visibly label ORC, SENTINEL, SCRIBE, or LEXI outputs.
- Draft approval currently allows below-90 QA scores to be approved.
- Client Admin can directly load `/mvp/admin`; the UI allows Client Admin admin access even though the Super Admin-only sidebar hides the link.

