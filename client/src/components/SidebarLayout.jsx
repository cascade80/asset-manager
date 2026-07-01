import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const content = children ?? <Outlet />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
        
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          
          <h1 className="text-xl font-bold text-white tracking-wide">
            AssetManager
          </h1>
        </div>
        
        {}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          
          
          <Link 
            to="/" 
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/' 
                ? 'bg-blue-600/10 text-blue-400' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          
          <Link 
            to="/add" 
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/add' 
                ? 'bg-blue-600/10 text-blue-400' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            Create New Asset
          </Link>

          <Link to="/users" className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/users' 
                ? 'bg-blue-600/10 text-blue-400' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}>
            Users
          </Link>

          <Link to="/reports" className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/reports' 
                ? 'bg-blue-600/10 text-blue-400' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}>
            Reports
          </Link>

          {}
         <Link to="/logs" className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/logs' 
                ? 'bg-blue-600/10 text-blue-400' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}>
          Logs
          </Link>

        
        </nav>
        
        {}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white uppercase">
            {(user?.name || 'A').slice(0, 1)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'Signed in user'}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="ml-auto rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {location.pathname === '/' ? 'Overview & Statistics' : 
             location.pathname === '/add' ? 'Asset Creation' : 
             location.pathname === '/reports' ? 'Reports & Insights' : 
             location.pathname === '/logs' ? 'System Activity' : 'Workspace'}
          </h2>
          
          
        </header>

        {}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {content}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default SidebarLayout;