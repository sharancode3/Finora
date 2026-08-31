import { FinancialMetricsProvider } from './context/FinancialMetricsContext';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AIProvider } from './context/AIContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

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
import Reconciliation from './pages/Reconciliation';
import DesignSystemGallery from './pages/DesignSystemGallery';
import AboutFinora from './pages/AboutFinora';
import DocumentAssistant from './pages/DocumentAssistant';
import TaxLineMatcher from './pages/TaxLineMatcher';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AIProvider>
          <FinancialMetricsProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Authenticated Routes wrapped in MainLayout */}
              <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
              <Route path="/reconciliation" element={<MainLayout><Reconciliation /></MainLayout>} />
              <Route path="/exceptions" element={<MainLayout><Exceptions /></MainLayout>} />
              
              {/* Ask Fino (Supports both /ask-your-books and /ask_your_books) */}
              <Route path="/ask_your_books" element={<MainLayout><AskYourBooks /></MainLayout>} />
              <Route path="/ask-your-books" element={<MainLayout><AskYourBooks /></MainLayout>} />
              <Route path="/ask-fino" element={<MainLayout><AskYourBooks /></MainLayout>} />
              
              {/* Treasury & Operations (Supports hyphen and underscore aliases) */}
              <Route path="/cash-position" element={<MainLayout><CashPosition /></MainLayout>} />
              <Route path="/cash_position" element={<MainLayout><CashPosition /></MainLayout>} />
              
              <Route path="/month-end-close" element={<MainLayout><MonthEndClose /></MainLayout>} />
              <Route path="/month_end_close" element={<MainLayout><MonthEndClose /></MainLayout>} />
              
              <Route path="/tax-matcher" element={<MainLayout><TaxLineMatcher /></MainLayout>} />
              <Route path="/tax_matcher" element={<MainLayout><TaxLineMatcher /></MainLayout>} />
              
              <Route path="/document-assistant" element={<MainLayout><DocumentAssistant /></MainLayout>} />
              <Route path="/document_assistant" element={<MainLayout><DocumentAssistant /></MainLayout>} />
              
              <Route path="/record/:type/:id" element={<MainLayout><RecordDetail /></MainLayout>} />
              <Route path="/accounts" element={<MainLayout><LinkedAccounts /></MainLayout>} />
              <Route path="/linked-accounts" element={<MainLayout><LinkedAccounts /></MainLayout>} />
              <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
              <Route path="/about" element={<MainLayout><AboutFinora /></MainLayout>} />
              <Route path="/design-system" element={<MainLayout><DesignSystemGallery /></MainLayout>} />

              {/* Catch-all Wildcard Route: Guarantees zero blank white screens */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </FinancialMetricsProvider>
          </AIProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
