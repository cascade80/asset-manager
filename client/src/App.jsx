import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddAsset from './pages/AddAsset'; // <-- IMPORT ADDED

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-gray-100"> {/* Added dark mode backgrounds here! */}
        {/* Navigation Bar */}
        <nav className="bg-gray-800 shadow-md px-8 py-4 mb-4 border-b border-gray-700">
          <h1 className="text-2xl font-black text-blue-500 tracking-tight">
            Asset Manager
          </h1>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddAsset />} /> {/* <-- ROUTE ADDED */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;