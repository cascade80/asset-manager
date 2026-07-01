import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './pages/Dashboard';
import AddAsset from './pages/AddAsset';
import EditAsset from './pages/EditAsset';
import NotFound from './pages/NotFound';
import Users from './pages/Users';
import Logs from './pages/Logs';
import AssetDetails from './pages/AssetDetails';
import Reports from './pages/reports';
import Login from './pages/Login';
import { useAuth } from './context/useAuth.js';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          element={isAuthenticated ? <SidebarLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddAsset />} />
          <Route path="/edit/:id" element={<EditAsset />} />
          <Route path="/details/:id" element={<AssetDetails />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
        </Route>
        <Route path="*" element={isAuthenticated ? <NotFound /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;