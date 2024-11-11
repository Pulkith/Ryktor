import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import BillingHelper from './pages/BillingHelper';
import BillDetail from './pages/BillDetail';
import { AuthProvider } from './context/AuthContext';
import MapDashboard from './pages/MapDashboard';
import Records from './pages/Records';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MapDashboard />} />
          <Route path="/billing" element={<BillingHelper />} />
          <Route path="/bills/:id" element={<BillDetail />} />
          <Route path="/records" element={<Records />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;