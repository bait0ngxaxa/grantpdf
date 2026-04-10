When task is complete, run and report:
1) npm run lint
2) npm run test (or targeted tests)
3) npm run build for production-impacting changes
For auth/session/middleware changes, additionally verify:
- login success flow (signin -> dashboard)
- protected route redirect behavior
- admin route access control
- API auth endpoints unaffected (especially /api/auth/*).
Keep changes minimal, preserve existing Thai strings, and avoid encoding corruption.