import type { Institute } from "../data/mockData";

export type MonitoringObservation = {
  observedAttendance: number;
  confidence: number;
  modelVersion: string;
  inferenceTimestamp: string;
};

export type MonitoringRequest = {
  institute: Institute;
  observedAttendance: number;
};

export interface MonitoringProvider {
  observe(request: MonitoringRequest): MonitoringObservation;
}

export class SimulatedMonitoringProvider implements MonitoringProvider {
  observe({ observedAttendance }: MonitoringRequest): MonitoringObservation {
    return {
      observedAttendance,
      confidence: 0.99,
      modelVersion: "simulated-attendance-v1",
      inferenceTimestamp: new Date().toISOString(),
    };
  }
}

export const monitoringProvider: MonitoringProvider = new SimulatedMonitoringProvider();