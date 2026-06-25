import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import AddAsset from './pages/AddAsset';
import EditAsset from './pages/EditAsset';
import NotFound from './pages/NotFound';
import Users from './pages/Users';

function App() {
  return (
    <BrowserRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddAsset />} />
          <Route path="/edit/:id" element={<EditAsset />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarLayout>
    </BrowserRouter>
  );
}

export default App;