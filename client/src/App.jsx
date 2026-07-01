import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './pages/Dashboard';
import AddAsset from './pages/AddAsset';
import EditAsset from './pages/EditAsset';
import NotFound from './pages/NotFound';
import Users from './pages/Users';
import Logs from './pages/Logs';
import AssetDetails from './pages/AssetDetails';
import Reports from './pages/reports';
function App() {
  return (
    <BrowserRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddAsset />} />
          <Route path="/edit/:id" element={<EditAsset />} />
          <Route path="/details/:id" element={<AssetDetails />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </SidebarLayout>
        
    </BrowserRouter>
    
  );
}

export default App;