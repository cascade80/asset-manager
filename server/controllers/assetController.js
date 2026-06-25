import Asset from '../models/Asset.js';
import { createLog } from '../routes/auditRoutes.js';



export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({});
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not fetch assets' });
  }
};



export const createAsset = async (req, res) => {
  try {
    const newAsset = await Asset.create(req.body);
    await createLog('CREATE', newAsset, `Asset initialized under category: ${newAsset.category}`);
    res.status(201).json(newAsset);
  } catch (error) {
    res.status(400).json({ message: 'Invalid asset data received', error: error.message });
  }
};



export const updateAsset = async (req, res) => {
  try {
    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } 
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    await createLog('UPDATE', updatedAsset, `Asset details updated: ${Object.keys(req.body).join(', ')}`);
    res.status(200).json(updatedAsset);
  } catch (error) {
    res.status(400).json({ message: 'Could not update asset', error: error.message });
  }
};



export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    await createLog('DELETE', asset, `Asset permanently removed from database inventory.`);
    res.status(200).json({ message: 'Asset removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete asset' });
  }
};

export const createBulkAssets = async (req, res) => {
  try {
    const assetsArray = req.body; 
    
    
    const insertedAssets = await Asset.insertMany(assetsArray);
    
    res.status(201).json({ message: `Successfully imported ${insertedAssets.length} assets!` });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({ message: "Failed to import assets.", error });
  }
};

export const searchAssets = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchResults = await Asset.find({
      $or: [
        { assetTag: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { serialNumber: { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json(searchResults);
  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};