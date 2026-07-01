import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Papa from 'papaparse';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

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
            name: row['Name'] || row.name,
            email: row['Email'] || row.email,
            
            department: row['Department'] || 'Engineering', 
            
            role: 'User'
          }));

          
          await api.post('/users/bulk', formattedData);
          
          alert(`Successfully imported ${formattedData.length} users!`);
          
          fetchUsers(); 
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
    
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    role: 'User' 
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      
      setFormData({ name: '', email: '', department: 'Engineering', role: 'User' });
      
      fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("Error creating user. Check console.");
    }
  };

  if (loading) return <div className="p-6 text-slate-500">Loading directory...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Employee Directory</h2>
        <p className="text-sm text-slate-500 mt-1">Manage staff members and hardware assignments.</p>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
        <div className="flex gap-3">
          
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current.click()} 
            disabled={isImporting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow-sm transition-colors h-10.5"
          >
            {isImporting ? 'Importing...' : 'Import Users (CSV)'}
          </button>
          
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-blue-600 uppercase mb-4">Onboard New Employee</h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex-1 min-w-50">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="w-48">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
            <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
            </select>
          </div>
          
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow-sm transition-colors h-10.5">
            + Add User
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-semibold">Employee</th>
              <th className="px-6 py-3 font-semibold">Department</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No employees found. Add one above!</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.department}</td>
                  <td className="px-6 py-4 text-slate-600">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Users;