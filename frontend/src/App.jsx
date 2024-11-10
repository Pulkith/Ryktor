import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import BillingHelper from './pages/BillingHelper';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/billing" element={<BillingHelper />} />
      </Routes>
    </Layout>
  );
}

export default App;