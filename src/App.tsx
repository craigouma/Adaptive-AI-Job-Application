import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApplicationProvider } from './contexts/ApplicationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ApplicationFlow } from './components/ApplicationFlow';
import { AdminDashboard } from './components/admin/AdminDashboard';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={
            <ApplicationProvider>
              <ApplicationFlow />
            </ApplicationProvider>
          } />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;