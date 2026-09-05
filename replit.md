# Adaptive Compliance Intelligence & Surprise Inspection Platform

An AI-assisted government monitoring dashboard that connects attendance anomaly detection to adaptive surprise inspection and field verification.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the Express API server
- `pnpm --filter @workspace/compliance-command run dev` — run the React command dashboard
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/compliance-command/src/pages/dashboard.tsx` — command dashboard
- `artifacts/compliance-command/src/pages/inspector.tsx` — inspector field view
- `artifacts/api-server/src/data/mockData.ts` — resettable in-memory institutes and inspections
- `artifacts/api-server/src/services/riskEngine.ts` — discrepancy, anomaly, and risk calculations
- `artifacts/api-server/src/services/inspectionEngine.ts` — prioritization, assignment, and submission rules
- `artifacts/api-server/src/routes/compliance.ts` — monitoring and inspection REST routes
- `lib/api-spec/openapi.yaml` — API source of truth

## Architecture decisions

- The first phase uses in-memory state so the SIH demo can be run without authentication or database setup.
- The hero flow is deterministic: the specified observation produces 52.3% discrepancy and PMU-07 is the first available inspector.
- OpenAPI is the contract; generated React Query hooks are used by the frontend and generated Zod schemas validate API boundaries.
- Risk and inspection rules live outside React so persistent storage and real inference can be introduced without rewriting the UI.

## Product

Program officers can monitor institutes, review risk-ranked priorities, run simulated attendance monitoring, generate surprise inspections, and hand off assignments to a mobile-friendly inspector view for GPS, evidence, and finding submission.

## User preferences

- Keep the SIH-26 MVP understandable and connected to the core product loop before adding advanced features.

## Gotchas

- Mock data resets when the API workflow restarts.
- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- The Vite artifact requires workflow-provided `PORT` and `BASE_PATH`; use the managed web workflow instead of a bare build command.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
