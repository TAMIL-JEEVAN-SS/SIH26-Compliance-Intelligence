import type { Institute, RiskLevel } from "../data/mockData";

export const RISK_COMPONENT_MAX = {
  attendance: 35,
  history: 15,
  reporting: 13,
  compliance: 10,
  alerts: 8,
} as const;

export type AnomalySeverity = "NORMAL" | "LOW" | "MODERATE" | "SERIOUS" | "SEVERE";

export function calculateDiscrepancy(reported: number, observed: number) {
  if (reported <= 0) return 0;
  return Number((Math.abs(reported - observed) / reported * 100).toFixed(1));
}

export function getAnomalySeverity(discrepancy: number): AnomalySeverity {
  if (discrepancy < 10) return "NORMAL";
  if (discrepancy < 20) return "LOW";
  if (discrepancy < 35) return "MODERATE";
  if (discrepancy < 50) return "SERIOUS";
  return "SEVERE";
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

export function calculateAttendanceRisk(discrepancy: number) {
  if (discrepancy >= 50) return RISK_COMPONENT_MAX.attendance;
  if (discrepancy >= 35) return 28;
  if (discrepancy >= 20) return 20;
  if (discrepancy >= 10) return 10;
  return 0;
}

export function calculateRisk(institute: Institute, observedAttendance: number) {
  const discrepancy = calculateDiscrepancy(
    institute.reportedAttendance,
    observedAttendance,
  );
  const attendanceRisk = calculateAttendanceRisk(discrepancy);
  const riskScore = Math.min(
    100,
    attendanceRisk +
      institute.historyRisk +
      institute.reportingRisk +
      institute.complianceRisk +
      institute.alertRisk,
  );

  return {
    discrepancy,
    anomalyDetected: discrepancy >= 20,
    anomalySeverity: getAnomalySeverity(discrepancy),
    attendanceRisk,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
  };
}