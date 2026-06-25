import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Papa from 'papaparse';

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef(null);

  const fetchAssets = () => {
    api.get('/assets').then(res => {
      setAssets(res.data);
      setFilteredAssets(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const applyFilters = (data, search, status, category) => {
    let result = data;

    
    if (search.trim()) {
      result = result.filter(asset =>
        asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        (asset.serialNumber && asset.serialNumber.toLowerCase().includes(search.toLowerCase()))
      );
    }

    
    if (status) {
      result = result.filter(asset => asset.status === status);
    }

    
    if (category) {
      result = result.filter(asset => asset.category === category);
    }

    return result;
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      const filtered = applyFilters(assets, '', filterStatus, filterCategory);
      setFilteredAssets(filtered);
      return;
    }

    setIsSearching(true);
    try {
      const res = await api.get('/assets/search', { params: { query } });
      const filtered = applyFilters(res.data, query, filterStatus, filterCategory);
      setFilteredAssets(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      setFilteredAssets([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    const filtered = applyFilters(assets, searchQuery, status, filterCategory);
    setFilteredAssets(filtered);
  };

  const handleCategoryFilter = (category) => {
    setFilterCategory(category);
    const filtered = applyFilters(assets, searchQuery, filterStatus, category);
    setFilteredAssets(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setFilterCategory('');
    setFilteredAssets(assets);
  };

  const availableCount = filteredAssets.filter(asset => asset.status === 'Available').length;
  const licenceCount = filteredAssets.filter(asset => asset.category === 'Licence').length;
  const accessoriesCount = filteredAssets.filter(asset => asset.category === 'Accessories').length;
  const consumablesCount = filteredAssets.filter(asset => asset.category === 'Consumables').length;
 
  const handleDelete = async (id) => {
   if (!window.confirm("Are you sure you want to delete this asset?")) return;
  try {
      await api.delete(`/assets/${id}`);
     const updated = assets.filter(asset => asset._id !== id);
     setAssets(updated);
     const filtered = applyFilters(updated, searchQuery, filterStatus, filterCategory);
     setFilteredAssets(filtered);
   } catch (error) {
     console.error("Failed to delete asset:", error);
     alert("Could not delete asset. Check the console.");
   }
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

  
    setIsImporting(true);

    Papa.parse(file, {
      header: true, 
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data;
          
          
          const formattedData = rawData.map(row => ({
            assetTag: row['Asset Tag'] || row.assetTag,
            name: row['Name'] || row.name,
            category: row['Category'] || row.category || 'Hardware',
            purchasePrice: parseFloat(row['Purchase Price'] || row.purchasePrice || 0),
            status: row['Status'] || row.status || 'Available',
            assignedTo: row['Assigned To'] || row.assignedTo || '',
            location: row['Location'] || row.location || ''
          }));

          
          await api.post('/assets/bulk', formattedData);
          
          alert(`Successfully imported ${formattedData.length} assets!`);
          fetchAssets(); 
        } catch (error) {
          console.error("Import failed:", error);
          alert("Import failed. Check console for details.");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = ''; 
        }
      }
    });
  };

  return (
  
    <div className="space-y-6">
      
      {}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
        <div className="flex gap-3">
          
          {}
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          
          {}
          <button 
            onClick={() => fileInputRef.current.click()} 
            disabled={isImporting}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition  flex items-center"
          >
            {isImporting ? 'Importing...' : 'Import CSV'}
          </button>
          
          <Link to="/add" className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition ">
            + New Asset
          </Link>
        </div>
      </div>

      {}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by asset tag, name, or serial number..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isSearching && <p className="text-sm text-slate-500 mt-1">Searching...</p>}
      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-lg  p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Damaged">Damaged</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Hardware">Hardware</option>
              <option value="Licence">Licence</option>
              <option value="Accessories">Accessories</option>
              <option value="Consumables">Consumables</option>
            </select>
          </div>

          {(searchQuery || filterStatus || filterCategory) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium self-end"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 ">
          <p className="text-slate-500 text-xs font-bold uppercase">Total Assets</p>
          <h3 className="text-2xl font-bold mt-1">{searchQuery ? filteredAssets.length : assets.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 ">
          <p className="text-slate-500 text-xs font-bold uppercase">Available</p>
          <h3 className="text-2xl font-bold mt-1">{availableCount}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 ">
          <p className="text-slate-500 text-xs font-bold uppercase">Consumables</p>
          <h3 className="text-2xl font-bold mt-1">{consumablesCount}</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 ">
          <p className="text-slate-500 text-xs font-bold uppercase">Licence</p>
          <h3 className="text-2xl font-bold mt-1">{licenceCount}</h3>
        </div>

      </div>

      {}
      <div className="bg-white border border-slate-200 rounded-lg  overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-semibold">Tag</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Category</th>
              <th className="px-6 py-3 font-semibold">Assigned To</th>
              <th className="px-6 py-3 font-semibold">Location</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
           {filteredAssets.length > 0 ? (
             filteredAssets.map((a) => (
               <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-6 py-4 font-mono text-slate-600">{a.assetTag}</td>
                 <td className="px-6 py-4 font-medium text-slate-900">{a.name}</td>
                 <td className="px-6 py-4 text-slate-600">{a.category}</td>
                  <td className="px-6 py-4 text-slate-600">{a.assignedTo || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{a.location || '-'}</td>
                 <td className="px-6 py-4">
                   <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                     a.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                   }`}>
                     {a.status}
                   </span>
                 </td>
                 <td className="px-6 py-4 text-right flex justify-end gap-3">
                   <Link to={`/edit/${a._id}`} className="text-blue-600 hover:text-blue-800 font-medium">Edit</Link>
                   <button 
                     onClick={() => handleDelete(a._id)} 
                     className="text-red-600 hover:text-red-800 font-medium"
                   >
                     Delete
                   </button>
                 </td>
               </tr>
             ))
           ) : (
             <tr>
               <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                 {searchQuery ? 'No assets found matching your search.' : 'No assets available.'}
               </td>
             </tr>
           )}
          </tbody>
        </table>
      </div>
      
    </div>
    
  );};


export default Dashboard;