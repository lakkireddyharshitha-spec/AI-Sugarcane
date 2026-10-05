import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FarmsPage from './pages/FarmsPage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import EnvironmentalPage from './pages/EnvironmentalPage';
import RiskPredictionPage from './pages/RiskPredictionPage';
import CropGrowthPage from './pages/CropGrowthPage';
import AlertsPage from './pages/AlertsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import DatasetStatusPage from './pages/DatasetStatusPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected app shell */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/farms" element={<FarmsPage />} />
              <Route path="/diseases" element={<DiseaseDetectionPage />} />
              <Route path="/environmental" element={<EnvironmentalPage />} />
              <Route path="/risk" element={<RiskPredictionPage />} />
              <Route path="/growth" element={<CropGrowthPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/dataset-status" element={<DatasetStatusPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

