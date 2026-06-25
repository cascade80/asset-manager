import express from 'express';
import AuditLog from '../models/Auditlogs.js';

const router = express.Router();


export const createLog = async (action, asset, details) => {
  try {
    const log = new AuditLog({
      action,
      assetTag: asset.assetTag,
      assetName: asset.name,
      details
    });
    await log.save();
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};


router.get('/', async (req, res) => {
  try {
    
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;