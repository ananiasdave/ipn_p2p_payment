import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { SendMoneyPage } from './pages/SendMoneyPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { ContactsPage } from './pages/ContactsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/send" element={<SendMoneyPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/history" element={<TransactionHistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
