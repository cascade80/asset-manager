import { useState,useEffect } from "react";
import api from "../api/axios";
import { useParams, useNavigate, Link } from 'react-router-dom';
const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeList, setEmployeeList] = useState([]);
  
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
  
  useEffect(() => {
    
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/users');
        setEmployeeList(res.data);
      } catch (err) {
        console.error("Could not fetch employees:", err);
      }
    };
 
    
    const fetchAssetDetails = async () => {
      try {
        const response = await api.get('/assets');
        const currentAsset = response.data.find(asset => asset._id === id);
        
        if (currentAsset) {
          setFormData({
            assetTag: currentAsset.assetTag || '',
            name: currentAsset.name || '',
            category: currentAsset.category || 'Hardware',
            status: currentAsset.status || 'Available',
            model: currentAsset.model || '',
            serialNumber: currentAsset.serialNumber || '',
            warrantyMonths: currentAsset.warrantyMonths || null,
            productKey: currentAsset.productKey || '',
            seats: currentAsset.seats || '',
            expirationDate: currentAsset.expirationDate ? currentAsset.expirationDate.split('T')[0] : '',
            purchasePrice: currentAsset.purchasePrice || '',
            purchaseDate: currentAsset.purchaseDate ? currentAsset.purchaseDate.split('T')[0] : '',
            supplier: currentAsset.supplier || '',
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

    fetchEmployees();
    fetchAssetDetails();
  }, [id]);

     const getStatus = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-50 text-emerald-700';
      case 'In Use': return 'bg-rose-50 text-rose-700';
      case 'Maintainance': return 'bg-amber-50 text-amber-700';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }};
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    
    if (name === 'assignedTo') {
      if (value !== '') {
        updatedData.status = 'In Use';
      } else {
        updatedData.status = 'Available';
      }
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assets/${id}`, formData);
      navigate('/');
    } catch (err) {
      setError('Failed to update asset.');
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><p className="text-slate-500 animate-pulse">Loading...</p></div>;

  return (
    <div className="max-w-4xl mx-auto">
     
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Details</h2>
        </div>
         <div className="">
          
        </div>
        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">&larr; Back</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {}
            <div className="flex">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-blue-600 uppercase mb-4">Identification</h4>
              <div className="gap-6 space-y-5">
                <div className="w-50 flex">
                

                  <p className="block text-xs font-semibold text-slate-500 mb-1">Asset Tag :</p>
                  <h2 className="w-full px-1  rounded-md border-0 border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none cursor-default select-none font-bold" > {formData.assetTag}</h2>
                </div>
                <div className="w-100 flex">
                  <p className="block text-xs font-semibold text-slate-500 mb-1">Asset Name :</p>
                  <h2 className="w-full px-2  rounded-md border-0 border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none cursor-default select-none font-bold"  > {formData.name} </h2>
                </div>
                <div className="w-50 flex items-center">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category:</label>
                 <h2 className="w-full px-2  rounded-md border-0 border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none cursor-default select-none font-bold" > {formData.category} </h2>
                </div>
              </div>
            </div>
            </div>
            {}
            {formData.category === 'Hardware' && (
                <>
                <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">Hardware Specs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Model</label>
                    <p className="w-full px-0 py-0 text-sm rounded-md border-0 border-slate-300" > {formData.model} </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Serial Number</label>
                   <p className="w-full px-0 py-0 text-sm rounded-md border-0 border-slate-300" > {formData.serialNumber} </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 ">Warranty</label>
                    <p className="w-full px-0 py-0 text-sm rounded-md border-0 border-slate-300" > {formData.warrantyMonths?.split("T")[0]} </p>
                  </div>
                </div>
                </>
              
            )}

            {}
            {formData.category === 'Licence' && (
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-bold text-blue-700 uppercase mb-4">Software Licence Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Product Key</label>
                    <h2  className="w-full px-4 py-2 text-sm rounded-md border border-blue-300 font-mono" placeholder="XXXX-XXXX-XXXX-XXXX" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Total Seats (Users Allowed)</label>
                    <input type="number" name="seats" onChange={handleChange} value={formData.seats} className="w-full px-4 py-2 text-sm rounded-md border border-blue-300" />
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
                  <h2 className="w-full px-0 py-0 rounded-md border-0 border-slate-300 outline-none" >{formData.supplier}</h2>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Purchase Date</label>
                  <h2 type="date" className="w-full px-0 py-0 rounded-md border-0 border-slate-300 outline-none" >{formData.purchaseDate}</h2>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Purchase Price</label>
                  <h2 type="price" className="w-full px-0 py-0 rounded-md border-0 border-slate-300 outline-none" >{formData.purchasePrice}</h2>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                 <h2 className={`w-full rounded-md bg-white ${getStatus(formData.status)}`}>
                 {formData.status}
                 </h2>
               </div>
               
               {}
               <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1">Assigned To</label>
                 <h2
                   
                   className="w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                   {formData.assignedTo}
                 </h2>
               </div>
               
               {}
               {formData.category !== 'Licence' && (
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Physical Location</label>
                    <h2
                   
                   className="w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                 >
                   {formData.location}
                 </h2>
               </div>
                 
               )}
            </div>

          </div>
      </div>
    </div>
  );
};

export default AssetDetails;