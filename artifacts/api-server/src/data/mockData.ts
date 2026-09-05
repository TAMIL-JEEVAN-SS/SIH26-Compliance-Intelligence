export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type InstituteStatus =
  | "MONITORING"
  | "INSPECTION_REQUIRED"
  | "INSPECTION_ASSIGNED"
  | "NON_COMPLIANT";

export type Institute = {
  id: string;
  name: string;
  location: string;
  reportedAttendance: number;
  observedAttendance: number | null;
  riskScore: number;
  riskLevel: RiskLevel;
  status: InstituteStatus;
  historyRisk: number;
  reportingRisk: number;
  complianceRisk: number;
  alertRisk: number;
  lastMonitoredAt: string | null;
};

export type Inspection = {
  id: string;
  institute: Institute;
  inspector: string;
  reason: string;
  riskScore: number;
  assignmentStatus: "ASSIGNED" | "SUBMITTED";
  timestamp: string;
  confirmed: boolean | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  evidence: string | null;
};

export const institutes: Institute[] = [
  {
    id: "saksham-rehabilitation-centre",
    name: "Saksham Rehabilitation Centre",
    location: "New Delhi, Delhi",
    reportedAttendance: 86,
    observedAttendance: null,
    riskScore: 42,
    riskLevel: "LOW",
    status: "MONITORING",
    historyRisk: 15,
    reportingRisk: 13,
    complianceRisk: 10,
    alertRisk: 8,
    lastMonitoredAt: null,
  },
  {
    id: "sunrise-care-institute",
    name: "Sunrise Care Institute",
    location: "Jaipur, Rajasthan",
    reportedAttendance: 78,
    observedAttendance: 57,
    riskScore: 73,
    riskLevel: "HIGH",
    status: "INSPECTION_REQUIRED",
    historyRisk: 14,
    reportingRisk: 13,
    complianceRisk: 9,
    alertRisk: 7,
    lastMonitoredAt: "2026-09-05T08:30:00.000Z",
  },
  {
    id: "hope-foundation",
    name: "Hope Foundation",
    location: "Bhubaneswar, Odisha",
    reportedAttendance: 64,
    observedAttendance: 49,
    riskScore: 68,
    riskLevel: "HIGH",
    status: "INSPECTION_REQUIRED",
    historyRisk: 14,
    reportingRisk: 11,
    complianceRisk: 8,
    alertRisk: 7,
    lastMonitoredAt: "2026-09-04T11:15:00.000Z",
  },
  {
    id: "aarohan-ngo",
    name: "Aarohan NGO",
    location: "Ranchi, Jharkhand",
    reportedAttendance: 52,
    observedAttendance: 47,
    riskScore: 47,
    riskLevel: "MEDIUM",
    status: "MONITORING",
    historyRisk: 10,
    reportingRisk: 8,
    complianceRisk: 6,
    alertRisk: 5,
    lastMonitoredAt: "2026-09-03T09:20:00.000Z",
  },
  {
    id: "seva-foundation",
    name: "Seva Foundation",
    location: "Kochi, Kerala",
    reportedAttendance: 91,
    observedAttendance: 89,
    riskScore: 21,
    riskLevel: "LOW",
    status: "MONITORING",
    historyRisk: 5,
    reportingRisk: 4,
    complianceRisk: 2,
    alertRisk: 2,
    lastMonitoredAt: "2026-09-02T07:45:00.000Z",
  },
];

export const inspections: Inspection[] = [];

export const inspectors = [
  { id: "PMU-07", available: true },
  { id: "PMU-12", available: true },
  { id: "PMU-21", available: true },
];

export function getInstitute(id: string) {
  return institutes.find((institute) => institute.id === id);
}

export function sortedInstitutes() {
  return [...institutes].sort((a, b) => b.riskScore - a.riskScore);
}