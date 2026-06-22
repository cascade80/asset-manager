import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to fetch data from our backend
    const fetchAssets = async () => {
      try {
        const response = await api.get('/assets'); // This hits http://127.0.0.1:5000/api/assets
        setAssets(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assets:", error);
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  if (loading) {
    return <div className="text-center mt-20 text-xl text-gray-500">Loading assets...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Asset Dashboard</h2>
        <Link to="/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
       + Add Asset
        </Link>
      </div>

      {assets.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No assets found. Add one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{asset.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-800">Category:</span> {asset.category}</p>
                <p><span className="font-semibold text-gray-800">Serial:</span> {asset.serialNumber || 'N/A'}</p>
                <p><span className="font-semibold text-gray-800">Price:</span> ${asset.purchasePrice}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                  ${asset.status === 'Available' ? 'bg-green-100 text-green-800' : 
                    asset.status === 'In Use' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {asset.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;