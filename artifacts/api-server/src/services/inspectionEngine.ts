import {
  getInstitute,
  inspectors,
  inspections,
  sortedInstitutes,
  type Inspection,
  type Institute,
} from "../data/mockData";
import { getRiskLevel } from "./riskEngine";

function nextInspectionId() {
  return `INS-${String(inspections.length + 1).padStart(3, "0")}`;
}

export function generateInspection(preferredInstituteId?: string): Inspection | null {
  const assignedIds = new Set(
    inspections
      .filter((inspection) => inspection.assignmentStatus === "ASSIGNED")
      .map((inspection) => inspection.institute.id),
  );
  const preferred = preferredInstituteId ? getInstitute(preferredInstituteId) : undefined;
  const eligible = sortedInstitutes().filter(
    (institute) =>
      institute.riskScore >= 60 &&
      !assignedIds.has(institute.id) &&
      institute.status !== "NON_COMPLIANT",
  );
  const institute = preferred && eligible.some((item) => item.id === preferred.id)
    ? preferred
    : eligible[0];
  const inspector = inspectors.find((item) => item.available);

  if (!institute || !inspector) return null;

  inspector.available = false;
  institute.status = "INSPECTION_ASSIGNED";

  const inspection: Inspection = {
    id: nextInspectionId(),
    institute: { ...institute },
    inspector: inspector.id,
    reason: "Attendance anomaly",
    riskScore: institute.riskScore,
    assignmentStatus: "ASSIGNED",
    timestamp: new Date().toISOString(),
    confirmed: null,
    notes: null,
    latitude: null,
    longitude: null,
    evidence: null,
  };

  inspections.unshift(inspection);
  return inspection;
}

export function submitInspection(
  id: string,
  submission: {
    confirmed: boolean;
    notes?: string;
    latitude?: number;
    longitude?: number;
    evidence?: string;
  },
) {
  const inspection = inspections.find((item) => item.id === id);
  if (!inspection) return null;

  const institute = getInstitute(inspection.institute.id);
  if (!institute) return null;

  inspection.assignmentStatus = "SUBMITTED";
  inspection.confirmed = submission.confirmed;
  inspection.notes = submission.notes ?? null;
  inspection.latitude = submission.latitude ?? null;
  inspection.longitude = submission.longitude ?? null;
  inspection.evidence = submission.evidence ?? null;

  const assignedInspector = inspectors.find((item) => item.id === inspection.inspector);
  if (assignedInspector) assignedInspector.available = true;

  const riskDelta = submission.confirmed ? 13 : -20;
  institute.riskScore = Math.max(0, Math.min(100, institute.riskScore + riskDelta));
  institute.riskLevel = getRiskLevel(institute.riskScore);
  institute.status = submission.confirmed ? "NON_COMPLIANT" : "MONITORING";
  inspection.institute = { ...institute };

  return {
    inspection,
    institute: { ...institute },
    riskDelta,
    escalationRequired: submission.confirmed && institute.riskScore >= 80,
  };
}