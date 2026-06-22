import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const AddAsset = () => {
  const navigate = useNavigate();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets', formData);
      navigate('/');
    } catch (err) {
      console.error("Error saving asset:", err);
      alert("Failed to save asset. Please check the console.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Create New Asset</h2>
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">Cancel</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-8">
            
            {/* Identification */}
            <div>
              <h4 className="text-sm font-bold text-blue-600 uppercase mb-4">Identification</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input type="text" name="assetTag" placeholder="Asset Tag *" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500" />
                <input type="text" name="name" placeholder="Asset Name *" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500" />
                <select name="category" onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300 bg-white">
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Furniture">Furniture</option>
                </select>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input type="text" name="model" placeholder="Model" onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300" />
              <input type="text" name="serialNumber" placeholder="Serial Number" onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300" />
              <input type="number" name="purchasePrice" placeholder="Purchase Price *" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300" />
            </div>

            {/* Status & Location */}
            <div>
              <h4 className="text-sm font-bold text-blue-600 uppercase mb-4">Status & Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <select name="status" onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300 bg-white">
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                <input type="text" name="location" placeholder="Location" onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300" />
                <input type="text" name="assignedTo" placeholder="Assigned To (User)" onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300" />
              </div>
            </div>

            <textarea name="notes" placeholder="Notes" rows="3" onChange={handleChange} className="w-full px-4 py-2.5 rounded-md border border-slate-300"></textarea>
          </div>

          <div className="bg-slate-50 px-8 py-5 border-t flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-blue-700">
              Save Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAsset;