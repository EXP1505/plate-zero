import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ParticleBackground from './components/ParticleBackground';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DataEntryPage from './pages/DataEntryPage';
import FeedbackPage from './pages/FeedbackPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ParticleBackground />
        <div className="relative z-10 w-full min-h-screen">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute requireAdmin>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entry"
              element={
                <ProtectedRoute requireAdmin>
                  <DataEntryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requireAdmin>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
