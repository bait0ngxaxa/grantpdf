# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

This repo uses a single-context layout:

- `CONTEXT.md` at the repo root
- `docs/adr/` for architectural decision records

## Before exploring, read these

- `CONTEXT.md` at the repo root, if it exists
- relevant ADRs under `docs/adr/`, if they exist

If these files do not exist yet, proceed silently. They are created lazily when domain terms or decisions are resolved.

## Use the glossary's vocabulary

When output names a domain concept, use the term as defined in `CONTEXT.md`.

If the needed concept is missing, note the gap instead of inventing new project vocabulary.

## Flag ADR conflicts

If output contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
