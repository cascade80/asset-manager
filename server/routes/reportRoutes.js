import express from "express";
import { exportInventory, exportReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/inventory", exportInventory);
router.get("/export/:reportType", exportReport);

export default router;