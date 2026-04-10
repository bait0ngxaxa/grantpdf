Coding conventions/rules from AGENTS.md:
- Priorities: Correctness > Security > Performance > Maintainability > Speed.
- Type safety: avoid any, use unknown + guards, explicit return types.
- Validation at boundaries using schemas; do not leak internal errors.
- Dependency flow: UI -> Hooks -> Services -> Data layer.
- DB rules: no SELECT *, use transactions for multi-step ops.
- Performance: prefer <= O(n log n), use Promise.all where possible.
- Defensive coding: null/undefined handling and server-side re-checks.
- Keep Thai text encoding intact (UTF-8), avoid mojibake; preserve Thai language text unless explicitly asked.
- For edits in this workspace, prefer apply_patch and UTF-8 safe operations.