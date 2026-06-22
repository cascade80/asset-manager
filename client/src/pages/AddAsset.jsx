import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AddAsset = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // State to hold our form data
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hardware', // Default value
    serialNumber: '',
    purchasePrice: '',
    status: 'Available'   // Default value
  });

  // Updates state when user types in an input field
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    try {
      // Send the POST request to our backend
      await api.post('/assets', formData);
      // If successful, redirect back to the Dashboard
      navigate('/');
    } catch (err) {
      setError('Failed to add asset. Please check your inputs.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6">Add New Asset</h2>
      
      {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Asset Name *</label>
          <input 
            type="text" name="name" required
            onChange={handleChange} value={formData.name}
            className="w-full p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select 
              name="category" 
              onChange={handleChange} value={formData.category}
              className="w-full p-2 rounded border border-gray-600"
            >
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Furniture">Furniture</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select 
              name="status" 
              onChange={handleChange} value={formData.status}
              className="w-full p-2 rounded border border-gray-600"
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Serial Number</label>
            <input 
              type="text" name="serialNumber"
              onChange={handleChange} value={formData.serialNumber}
              className="w-full p-2 rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Purchase Price ($) *</label>
            <input 
              type="number" name="purchasePrice" step="0.01" required
              onChange={handleChange} value={formData.purchasePrice}
              className="w-full p-2 rounded border border-gray-600"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium">
            Save Asset
          </button>
          <button type="button" onClick={() => navigate('/')} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-medium">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAsset;