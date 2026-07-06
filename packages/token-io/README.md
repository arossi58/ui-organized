# @ui-organized/token-io

Reading and writing the project document, and the adapters that connect it to the
outside world. **Pack-agnostic**: it serializes any DTCG project the same way,
whether or not a generator pack is active, and it never imports a pack.

Scope (built phase by phase):

- **Serialize / deserialize** the project document (Phase 0 — here now).
- **Import** arbitrary DTCG and Tokens Studio files, preserving unknown fields in
  `$extensions` (Phase 7).
- **GitHub adapter** — repo as the canonical store (Phase 4).
- **Supabase adapter** — hosted, non-GitHub collaborators (Phase 8).
- **Reconciler** — the non-destructive three-way merge over recipes + overrides
  (Phase 3).

## License

Apache-2.0
