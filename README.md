# Adaptive Compliance Intelligence & Surprise Inspection Platform

SIH 2026 foundation for continuous compliance monitoring of DoSJE-funded institutes, projects, and NGOs.

The MVP implements one connected product loop:

**Monitor → Detect anomaly → Calculate risk → Prioritize → Trigger surprise inspection → Inspector verifies GPS/evidence → Update risk → Escalate**

## What is included

- Responsive React + Vite command dashboard at `/`
- Responsive inspector field view at `/inspector`
- Express REST API under `/api`
- JavaScript/TypeScript risk and inspection engines
- Deterministic in-memory mock data for five institutes and three inspectors
- Browser geolocation capture and camera-ready image evidence input
- Typed OpenAPI contract with generated React Query hooks and Zod schemas

Authentication, CCTV, YOLO inference, advanced ML, blockchain, video conferencing, complex GIS, and a persistent database are intentionally out of scope for this foundation.

## Architecture

```text
React dashboard / inspector view
              ↓
        OpenAPI REST API
              ↓
    Risk engine / inspection engine
              ↓
       In-memory data layer
```

The frontend only displays server data and calls API hooks. Risk calculation and inspection selection stay in backend services so they can later be reused with Supabase or another persistent data layer.

## Run locally in Replit

The managed preview workflows are the recommended way to run the app:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/compliance-command run dev
```

Open the project preview at the root path. The API is available through the same preview host at `/api`.

For a normal local shell with the expected environment values:

```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
PORT=24773 BASE_PATH=/ pnpm --filter @workspace/compliance-command run dev
```

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Dashboard health |
| GET | `/api/healthz` | Service health |
| GET | `/api/institutes` | Risk-sorted institute list |
| GET | `/api/institutes/:id` | Institute detail |
| POST | `/api/monitor/:id` | Calculate discrepancy and update risk |
| POST | `/api/inspections/generate` | Assign the highest-priority eligible institute |
| GET | `/api/inspections` | List inspection records |
| POST | `/api/inspections/:id/submit` | Submit GPS, evidence, notes, and finding |

## Risk scoring

The risk engine returns a score from 0–100 using:

- Attendance anomaly: maximum 35
- Historical behaviour: maximum 15
- Reporting inconsistency: maximum 13
- Compliance: maximum 10
- Alerts: maximum 8

Risk levels are `LOW` (0–29), `MEDIUM` (30–59), `HIGH` (60–79), and `CRITICAL` (80–100). Attendance discrepancy bands are normal below 10%, low from 10–19.9%, moderate from 20–34.9%, serious from 35–49.9%, and severe at 50% or above.

## Hero demo

1. Open the root dashboard; Saksham Rehabilitation Centre is selected at risk `42`.
2. Enter observed attendance `41` and run monitoring.
3. The API returns `52.3%` discrepancy, a severe anomaly, and risk `81 / CRITICAL`.
4. Generate the surprise inspection; deterministic demo selection assigns `PMU-07`.
5. Open Inspector view, verify GPS, choose an evidence image, select **Anomaly confirmed**, and submit.
6. The confirmed inspection adds `+13`, producing risk `94 / CRITICAL`, `NON_COMPLIANT`, and an escalation-required result.

Unconfirmed inspections reduce risk by 20 points with a floor of zero.

## Simulated data

Attendance observations, risk inputs, inspector availability, inspection records, timestamps, and evidence references are all held in memory and reset when the API workflow restarts. Browser GPS is real when permission is granted; no geofence is performed.

## Next step: Supabase

Replace `artifacts/api-server/src/data/mockData.ts` with persistent institute, inspector, and inspection tables in the existing data layer. Add migrations and repository functions first, then keep the route and risk-engine contracts unchanged while swapping the data access implementation. Store evidence bytes in Supabase Storage and persist only the storage path and metadata in the inspection record.

## Next step: real YOLO inference

Replace the `observedAttendance` value sent by the dashboard with a backend monitoring adapter that sends an authorized CCTV frame or video sample to a YOLO inference service. Map the returned person detections to the existing observed-attendance field, preserve the discrepancy/risk API response, and add confidence, model version, and inference timestamp metadata before enabling production monitoring.