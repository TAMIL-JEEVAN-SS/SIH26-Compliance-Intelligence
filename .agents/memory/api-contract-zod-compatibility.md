---
name: API contract Zod compatibility
description: OpenAPI integer schemas currently generate Zod 4-only helpers in this workspace.
---

When adding numeric fields to the OpenAPI contract, use number schemas and enforce integer semantics at the service boundary until the workspace Zod dependency is upgraded to a version that supports the generated integer helper.

**Why:** The current generated client/server validation uses Zod 3 while Orval emits `z.int()` for OpenAPI integer types, which breaks the shared library typecheck after otherwise successful code generation.

**How to apply:** Preserve min/max constraints in OpenAPI, validate integer-only inputs explicitly in backend logic when required, and rerun API codegen plus the root typecheck after contract changes.