import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const EditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    category: 'Hardware',
    model: '',
    serialNumber: '',
    purchasePrice: '',
    purchaseDate: '',
    supplier: '',
    warrantyMonths: '',
    status: 'Available',
    assignedTo: '',
    location: '',
    notes: ''
  });

  // Fetch existing data when the page loads
  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        const response = await api.get('/assets');
        const currentAsset = response.data.find(asset => asset._id === id);
        
        if (currentAsset) {
          setFormData({
            assetTag: currentAsset.assetTag || '',
            name: currentAsset.name || '',
            category: currentAsset.category || 'Hardware',
            model: currentAsset.model || '',
            serialNumber: currentAsset.serialNumber || '',
            purchasePrice: currentAsset.purchasePrice || '',
            // Slices the MongoDB date to YYYY-MM-DD so the calendar input works
            purchaseDate: currentAsset.purchaseDate ? currentAsset.purchaseDate.split('T')[0] : '',
            supplier: currentAsset.supplier || '',
            warrantyMonths: currentAsset.warrantyMonths || '',
            status: currentAsset.status || 'Available',
            assignedTo: currentAsset.assignedTo || '',
            location: currentAsset.location || '',
            notes: currentAsset.notes || ''
          });
        } else {
          setError('Asset not found in database.');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch asset details.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchAssetDetails();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assets/${id}`, formData);
      navigate('/');
    } catch (err) {
      setError('Failed to update asset. Check console for details.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-500 font-medium animate-pulse">Loading asset details from database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Edit Asset</h2>
          <p className="text-sm text-slate-500 mt-1">Update information for this specific inventory item.</p>
        </div>
        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-8">
            
            {/* SECTION 1: Identification */}
            <div>
              <h4 className="text-sm font-bold text-blue-600 uppercase mb-4">Identification</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Asset Tag *</label>
                  <input type="text" name="assetTag" required onChange={handleChange} value={formData.assetTag} className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Asset Name *</label>
                  <input type="text" name="name" required onChange={handleChange} value={formData.name} className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  <select name="category" onChange={handleChange} value={formData.category} className="w-full px-4 py-2.5 rounded-md border border-slate-300 bg-white">
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Model</label>
                <input type="text" name="model" onChange={handleChange} value={formData.model} className="w-full px-4 py-2.5 rounded-md border border-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Serial Number</label>
                <input type="text" name="serialNumber" onChange={handleChange} value={formData.serialNumber} className="w-full px-4 py-2.5 rounded-md border border-slate-300 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Purchase Price *</label>
                <input type="number" name="purchasePrice" required onChange={handleChange} value={formData.purchasePrice} className="w-full px-4 py-2.5 rounded-md border border-slate-300" />
              </div>
            </div>

            {/* SECTION 3: Status & Assignment */}
            <div>
              <h4 className="text-sm font-bold text-blue-600 uppercase mb-4">Status & Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                  <select name="status" onChange={handleChange} value={formData.status} className="w-full px-4 py-2.5 rounded-md border border-slate-300 bg-white">
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                  <input type="text" name="location" onChange={handleChange} value={formData.location} className="w-full px-4 py-2.5 rounded-md border border-slate-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Assigned To</label>
                  <input type="text" name="assignedTo" onChange={handleChange} value={formData.assignedTo} className="w-full px-4 py-2.5 rounded-md border border-slate-300" />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
              <textarea name="notes" rows="3" onChange={handleChange} value={formData.notes} className="w-full px-4 py-2.5 rounded-md border border-slate-300"></textarea>
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-5 border-t flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/')} className="px-5 py-2.5 rounded-md text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-blue-700 shadow-sm transition-colors">
              Update Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAsset;