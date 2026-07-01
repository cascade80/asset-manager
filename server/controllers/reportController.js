import { generateReportWorkbook } from "../services/excelService.js";
import Asset from "../models/Asset.js";
import User from "../models/User.js";
import AuditLog from "../models/Auditlogs.js";

const exportReportFile = async (req, res, reportType = "inventory") => {
    try {
        const [assets, users, logs] = await Promise.all([
            Asset.find({}).sort({ createdAt: -1 }),
            User.find({}).sort({ name: 1 }),
            AuditLog.find({}).sort({ createdAt: -1 })
        ]);

        await generateReportWorkbook(res, {
            reportType,
            assets,
            users,
            logs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to generate report"
        });
    }
};

export const exportInventory = async (req, res) => {
    await exportReportFile(req, res, "inventory");
};

export const exportReport = async (req, res) => {
    await exportReportFile(req, res, req.params.reportType || "inventory");
};