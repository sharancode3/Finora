import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AIProvider } from './context/AIContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Exceptions from './pages/Exceptions';
import AskYourBooks from './pages/AskYourBooks';
import CashPosition from './pages/CashPosition';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import RecordDetail from './pages/RecordDetail';
import LinkedAccounts from './pages/LinkedAccounts';
import Settings from './pages/Settings';
import MonthEndClose from './pages/MonthEndClose';
import DesignSystemGallery from './pages/DesignSystemGallery';
import AboutFinora from './pages/AboutFinora';

import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <AIProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Authenticated Routes wrapped in MainLayout */}
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/exceptions" element={<MainLayout><Exceptions /></MainLayout>} />
          <Route path="/ask_your_books" element={<MainLayout><AskYourBooks /></MainLayout>} />
          <Route path="/cash-position" element={<MainLayout><CashPosition /></MainLayout>} />
          <Route path="/record/:type/:id" element={<MainLayout><RecordDetail /></MainLayout>} />
          <Route path="/accounts" element={<MainLayout><LinkedAccounts /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          <Route path="/month-end-close" element={<MainLayout><MonthEndClose /></MainLayout>} />
          <Route path="/about" element={<MainLayout><AboutFinora /></MainLayout>} />
          <Route path="/design-system" element={<MainLayout><DesignSystemGallery /></MainLayout>} />
        </Routes>
      </AIProvider>
    </BrowserRouter>
  );
}

export default App;
