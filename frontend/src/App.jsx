import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import BillingHelper from './pages/BillingHelper';
import BillDetail from './pages/BillDetail';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/billing" element={<BillingHelper />} />
        <Route path="/bills/:id" element={<BillDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;