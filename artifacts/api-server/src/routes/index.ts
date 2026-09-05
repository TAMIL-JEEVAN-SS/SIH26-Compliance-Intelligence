import { Router, type IRouter } from "express";
import healthRouter from "./health";
import complianceRouter from "./compliance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(complianceRouter);

export default router;
