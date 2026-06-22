import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './pages/Dashboard';

import AddAsset from './pages/AddAsset';
import EditAsset from './pages/EditAsset';

function App() {
  return (
    <BrowserRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddAsset />} />
          <Route path="/edit/:id" element={<EditAsset />} />
        </Routes>
      </SidebarLayout>
    </BrowserRouter>
  );
}

export default App;