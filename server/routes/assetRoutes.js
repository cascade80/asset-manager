import express from 'express';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../controllers/assetController.js';

const router = express.Router();

// Routes for /api/assets
router.route('/')
  .get(getAssets)      // GET request fetches all assets
  .post(createAsset);  // POST request creates a new asset

// Routes for /api/assets/:id  (Targeting a specific asset by its database ID)
router.route('/:id')
  .put(updateAsset)    // PUT request updates the specific asset
  .delete(deleteAsset);// DELETE request removes the specific asset

export default router;