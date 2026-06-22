import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const AddAsset = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hardware',
    serialNumber: '',
    purchasePrice: '',
    status: 'Available'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets', formData);
      navigate('/');
    } catch (err) {
      setError('Failed to add asset. Please check your inputs.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Create New Asset</h2>
          <p className="text-sm text-slate-500 mt-1">Add a new piece of hardware or software to the inventory.</p>
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

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          
          <div className="p-8 space-y-6">
            {/* Full Width Asset Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Asset Name <span className="text-red-500">*</span></label>
              <input 
                type="text" name="name" required
                placeholder="e.g., MacBook Pro 16-inch M3"
                onChange={handleChange} value={formData.name}
                className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <hr className="border-slate-100" />

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Column 1 */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select 
                    name="category" 
                    onChange={handleChange} value={formData.category}
                    className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Price ($) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" name="purchasePrice" step="0.01" required
                    placeholder="0.00"
                    onChange={handleChange} value={formData.purchasePrice}
                    className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Status</label>
                  <select 
                    name="status" 
                    onChange={handleChange} value={formData.status}
                    className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Serial Number / Asset Tag</label>
                  <input 
                    type="text" name="serialNumber"
                    placeholder="Leave blank to auto-generate"
                    onChange={handleChange} value={formData.serialNumber}
                    className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Form Footer */}
          <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="px-5 py-2.5 rounded-md text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              Save Asset
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddAsset;