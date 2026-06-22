import { Link, useLocation } from 'react-router-dom';

const SidebarLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. DARK SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 font-bold text-white shadow-lg shadow-blue-500/30">
            AM
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            AssetManager
          </h1>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Inventory</p>
          
          <Link 
            to="/" 
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/' 
                ? 'bg-blue-600/10 text-blue-400' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          
          <Link 
            to="/add" 
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/add' 
                ? 'bg-blue-600/10 text-blue-400' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            Create New Asset
          </Link>
        </nav>
        
        {/* User Profile Area (Bottom) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
            IT
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">IT Admin</p>
            <p className="text-xs text-slate-500">View Profile</p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {location.pathname === '/' ? 'Overview & Statistics' : 
             location.pathname === '/add' ? 'Asset Creation' : 'Workspace'}
          </h2>
          
          {/* Placeholder for future global search */}
          <div className="flex items-center">
            <input 
              type="text" 
              placeholder="Search by Asset Tag..." 
              className="px-4 py-1.5 text-sm border border-slate-300 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors w-64"
            />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default SidebarLayout;