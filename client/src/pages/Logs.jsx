import { useState, useEffect } from 'react';
import api from '../api/axios';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit');
        setLogs(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionStyle = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DELETE': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'UPDATE': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading) return <div className="p-6 text-slate-500">Loading master logs...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">System Activity & Audit Log</h2>
        <p className="text-sm text-slate-500 mt-1">Immutable streaming log of all inventory modifications for security and compliance.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-200">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No system actions recorded yet. Adjust an asset to trigger logs!</div>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="p-4 flex items-start justify-between hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  {}
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getActionStyle(log.action)}`}>
                    {log.action}
                  </span>
                  
                  {}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {log.assetName} <span className="text-xs font-mono text-slate-400">[{log.assetTag}]</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{log.details}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Executed by: {log.performedBy}</p>
                  </div>
                </div>

                {}
                <div className="text-right text-xs text-slate-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;