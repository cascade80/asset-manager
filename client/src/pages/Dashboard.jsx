import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await api.delete(`/assets/${id}`);
        setAssets(assets.filter((asset) => asset._id !== id));
      } catch (error) {
        console.error("Error deleting asset:", error);
        alert("Failed to delete asset.");
      }
    }
  };

  // --- STATS MATH ---
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + (Number(asset.purchasePrice) || 0), 0);
  const availableAssets = assets.filter(asset => asset.status === 'Available').length;
  const deployedAssets = assets.filter(asset => asset.status === 'In Use').length;

  if (loading) return <div className="text-center mt-20 text-slate-500">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      
      {/* KPI STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Assets</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalAssets}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Value</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center border-l-4 border-l-blue-500">
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Ready to Deploy</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{availableAssets}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center border-l-4 border-l-purple-500">
          <p className="text-purple-600 text-xs font-semibold uppercase tracking-wider">Deployed</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{deployedAssets}</h3>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Table Header/Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h3 className="text-lg font-semibold text-slate-800">All Hardware & Software</h3>
          <Link to="/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            + New Asset
          </Link>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Asset Name</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Serial / Tag</th>
                <th className="px-6 py-3 font-semibold">Purchase Price</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No assets found. Click 'New Asset' to start building your inventory.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{asset.name}</td>
                    <td className="px-6 py-4 text-slate-600">{asset.category}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{asset.serialNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">${Number(asset.purchasePrice).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {/* Status Badge */}
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold
                        ${asset.status === 'Available' ? 'bg-green-100 text-green-700' : 
                          asset.status === 'In Use' ? 'bg-blue-100 text-blue-700' : 
                          'bg-amber-100 text-amber-700'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link to={`/edit/${asset._id}`} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(asset._id)} className="text-red-600 hover:text-red-800 font-medium transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;