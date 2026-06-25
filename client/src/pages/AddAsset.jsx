import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const AddAsset = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    category: 'Hardware', 
    status: 'Available',  
    
    model: '',
    serialNumber: '',
    warrantyMonths: '',
    
    productKey: '',
    seats: '',
    expirationDate: '',
    
    purchasePrice: '',
    purchaseDate: '',
    supplier: '',
    assignedTo: '',
    location: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      
      await api.post('/assets', formData);
      navigate('/'); 
    } catch (err) {
      setError('Failed to create asset. Check console for details.');
      setIsSubmitting(false);
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Add New Asset</h2>
          <p className="text-sm text-slate-500 mt-1">Enter details for a new inventory item or software license.</p>
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
            
            {}
            <div>
              <h4 className="text-sm font-bold text-blue-600 uppercase mb-4">Identification</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Asset Tag *</label>
                  <input type="text" name="assetTag" required onChange={handleChange} value={formData.assetTag} className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. AST-1001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Asset Name *</label>
                  <input type="text" name="name" required onChange={handleChange} value={formData.name} className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. MacBook Pro 16" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category (Changes Form)</label>
                  <select name="category" onChange={handleChange} value={formData.category} className="w-full px-4 py-2.5 rounded-md border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700">
                    <option value="Hardware">Hardware</option>
                    <option value="Licence">Licence</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
            </div>

            {}
            {formData.category === 'Hardware' && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">Hardware Specs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Model</label>
                    <input type="text" name="model" onChange={handleChange} value={formData.model} className="w-full px-4 py-2 text-sm rounded-md border border-slate-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Serial Number</label>
                    <input type="text" name="serialNumber" onChange={handleChange} value={formData.serialNumber} className="w-full px-4 py-2 text-sm rounded-md border border-slate-300 font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Warranty (Months)</label>
                    <input type="number" name="warrantyMonths" onChange={handleChange} value={formData.warrantyMonths} className="w-full px-4 py-2 text-sm rounded-md border border-slate-300" placeholder="e.g. 12" />
                  </div>
                </div>
              </div>
            )}

            {}
            {formData.category === 'Licence' && (
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-bold text-blue-700 uppercase mb-4">Software Licence Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Product Key</label>
                    <input type="text" name="productKey" onChange={handleChange} value={formData.productKey} className="w-full px-4 py-2 text-sm rounded-md border border-blue-300 font-mono" placeholder="XXXX-XXXX-XXXX-XXXX" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Total Seats (Users Allowed)</label>
                    <input type="number" name="seats" onChange={handleChange} value={formData.seats} className="w-full px-4 py-2 text-sm rounded-md border border-blue-300" placeholder="e.g. 50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Expiration Date</label>
                    <input type="date" name="expirationDate" onChange={handleChange} value={formData.expirationDate} className="w-full px-4 py-2 text-sm rounded-md border border-blue-300" />
                  </div>
                </div>
              </div>
            )}

            {}
            <div>
              <h4 className="text-sm font-bold text-slate-600 uppercase mb-4">Purchase Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Supplier</label>
                  <input type="text" name="supplier" onChange={handleChange} value={formData.supplier} className="w-full px-4 py-2.5 rounded-md border border-slate-300 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Purchase Date</label>
                  <input type="date" name="purchaseDate" onChange={handleChange} value={formData.purchaseDate} className="w-full px-4 py-2.5 rounded-md border border-slate-300 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Purchase Price</label>
                  <input type="number" name="purchasePrice" onChange={handleChange} value={formData.purchasePrice} className="w-full px-4 py-2.5 rounded-md border border-slate-300 outline-none" />
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                 <select name="status" onChange={handleChange} value={formData.status} className="w-full px-4 py-2.5 rounded-md border border-slate-300 bg-white">
                   <option value="Available">Available</option>
                   <option value="In Use">In Use</option>
                   <option value="Maintenance">Maintenance</option>
                 </select>
               </div>
               
               {}
               {formData.category !== 'Licence' && (
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Physical Location</label>
                   <input type="text" name="location" onChange={handleChange} value={formData.location} className="w-full px-4 py-2.5 rounded-md border border-slate-300" placeholder="e.g. Server Room A" />
                 </div>
               )}
            </div>

            {}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
              <textarea name="notes" rows="3" onChange={handleChange} value={formData.notes} className="w-full px-4 py-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Add any extra details..."></textarea>
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-5 border-t flex justify-end gap-3">
            <Link to="/" className="px-5 py-2.5 rounded-md text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-blue-700 shadow-sm transition-colors disabled:bg-blue-400">
              {isSubmitting ? 'Creating...' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAsset;