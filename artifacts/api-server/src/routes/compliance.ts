import { Router, type IRouter } from "express";
import {
  GenerateInspectionBody,
  GetInstituteParams,
  ListInstitutesResponse,
  ListInspectionsResponse,
  RunMonitoringBody,
  RunMonitoringParams,
  SubmitInspectionBody,
  SubmitInspectionParams,
} from "@workspace/api-zod";
import { getInstitute, institutes, inspections, sortedInstitutes } from "../data/mockData";
import { generateInspection, submitInspection } from "../services/inspectionEngine";
import { calculateRisk } from "../services/riskEngine";

const router: IRouter = Router();

router.get("/institutes", (_req, res) => {
  res.json(ListInstitutesResponse.parse(sortedInstitutes()));
});

router.get("/institutes/:id", (req, res) => {
  const { id } = GetInstituteParams.parse(req.params);
  const institute = getInstitute(id);
  if (!institute) {
    res.status(404).json({ error: "Institute not found" });
    return;
  }
  res.json(institute);
});

router.post("/monitor/:id", (req, res) => {
  const { id } = RunMonitoringParams.parse(req.params);
  const { observedAttendance } = RunMonitoringBody.parse(req.body);
  const institute = getInstitute(id);
  if (!institute) {
    res.status(404).json({ error: "Institute not found" });
    return;
  }

  const result = calculateRisk(institute, observedAttendance);
  const previousRiskScore = institute.riskScore;
  institute.observedAttendance = observedAttendance;
  institute.riskScore = result.riskScore;
  institute.riskLevel = result.riskLevel;
  institute.status = result.anomalyDetected ? "INSPECTION_REQUIRED" : "MONITORING";
  institute.lastMonitoredAt = new Date().toISOString();

  res.json({
    ...result,
    previousRiskScore,
    institute: { ...institute },
  });
});

router.post("/inspections/generate", (req, res) => {
  const parsed = GenerateInspectionBody.safeParse(req.body ?? {});
  const inspection = generateInspection(parsed.success ? parsed.data.instituteId : undefined);
  if (!inspection) {
    res.status(409).json({ error: "No eligible institute or inspector is available" });
    return;
  }
  res.status(201).json(inspection);
});

router.get("/inspections", (_req, res) => {
  res.json(ListInspectionsResponse.parse(inspections));
});

router.post("/inspections/:id/submit", (req, res) => {
  const { id } = SubmitInspectionParams.parse(req.params);
  const submission = SubmitInspectionBody.parse(req.body);
  const result = submitInspection(id, submission);
  if (!result) {
    res.status(404).json({ error: "Inspection not found" });
    return;
  }
  res.json(result);
});

export default router;