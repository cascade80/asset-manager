import Asset from '../models/Asset.js';

// @desc    Get all assets
// @route   GET /api/assets
export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({});
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: Could not fetch assets' });
  }
};

// @desc    Create a new asset
// @route   POST /api/assets
export const createAsset = async (req, res) => {
  try {
    const newAsset = await Asset.create(req.body);
    res.status(201).json(newAsset);
  } catch (error) {
    res.status(400).json({ message: 'Invalid asset data received', error: error.message });
  }
};

// @desc    Update an asset
// @route   PUT /api/assets/:id
export const updateAsset = async (req, res) => {
  try {
    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Returns the updated document and checks schema rules
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    res.status(400).json({ message: 'Could not update asset', error: error.message });
  }
};

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.status(200).json({ message: 'Asset removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete asset' });
  }
};