import express from 'express';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  createBulkAssets,
  searchAssets
} from '../controllers/assetController.js';

const router = express.Router();


router.route('/')
  .get(getAssets)      
  .post(createAsset);  

router.get('/search', searchAssets);
router.post('/bulk', createBulkAssets);

router.route('/:id')
  .put(updateAsset)    
  .delete(deleteAsset);
  

export default router;