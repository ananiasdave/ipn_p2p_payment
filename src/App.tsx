import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { SendMoneyPage } from './pages/SendMoneyPage';

// Placeholder components for other routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-400 mb-2">{title}</h2>
      <p className="text-gray-500">This feature is coming soon.</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/send" element={<SendMoneyPage />} />
          <Route path="/contacts" element={<PlaceholderPage title="Contacts & Beneficiary Accounts" />} />
          <Route path="/history" element={<PlaceholderPage title="Transaction History" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
