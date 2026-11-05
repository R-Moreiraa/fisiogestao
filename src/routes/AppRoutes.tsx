import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GestaoLayout } from '../components/layout/GestaoLayout';
import { PatientLayout } from '../components/layout/PatientLayout';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginGestao } from '../pages/LoginGestao';
import { LoginPatient } from '../pages/LoginPatient';

// Gestão Pages
import { GestaoDashboard } from '../pages/GestaoDashboard';
import { AgendaPage } from '../pages/AgendaPage';
import { PatientsPage } from '../pages/PatientsPage';
import { PatientDetailPage } from '../pages/PatientDetailPage';
import { MedicalRecordsPage } from '../pages/MedicalRecordsPage';
import { TreatmentsPage } from '../pages/TreatmentsPage';
import { FinancialPage } from '../pages/FinancialPage';
import { ProfessionalsPage } from '../pages/ProfessionalsPage';
import { WebRequestsPage } from '../pages/WebRequestsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';

// Patient Pages
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { PatientAppointmentsPage } from '../pages/patient/PatientAppointmentsPage';
import { PatientTreatmentsPage } from '../pages/patient/PatientTreatmentsPage';
import { PatientClinicalHistoryPage } from '../pages/patient/PatientClinicalHistoryPage';
import { PatientFinancialPage } from '../pages/patient/PatientFinancialPage';
import { PatientProfilePage } from '../pages/patient/PatientProfilePage';

// Protected Route wrappers
const GestaoRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isGestao, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isGestao) return <Navigate to="/login/gestao" replace />;
  return <>{children}</>;
};

const PatientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPatient, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isPatient) return <Navigate to="/login/paciente" replace />;
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Landing Page & Auth */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/gestao" element={<LoginGestao />} />
      <Route path="/login/paciente" element={<LoginPatient />} />

      {/* 2. Clinic Management SaaS Routes */}
      <Route
        path="/gestao"
        element={
          <GestaoRoute>
            <GestaoLayout />
          </GestaoRoute>
        }
      >
        <Route index element={<Navigate to="/gestao/dashboard" replace />} />
        <Route path="dashboard" element={<GestaoDashboard />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="pacientes" element={<PatientsPage />} />
        <Route path="pacientes/:id" element={<PatientDetailPage />} />
        <Route path="prontuarios" element={<MedicalRecordsPage />} />
        <Route path="tratamentos" element={<TreatmentsPage />} />
        <Route path="financeiro" element={<FinancialPage />} />
        <Route path="profissionais" element={<ProfessionalsPage />} />
        <Route path="solicitacoes" element={<WebRequestsPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
      </Route>

      {/* 3. Patient Portal Exclusive Routes */}
      <Route
        path="/paciente"
        element={
          <PatientRoute>
            <PatientLayout />
          </PatientRoute>
        }
      >
        <Route index element={<Navigate to="/paciente/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="agenda" element={<PatientAppointmentsPage />} />
        <Route path="tratamentos" element={<PatientTreatmentsPage />} />
        <Route path="historico" element={<PatientClinicalHistoryPage />} />
        <Route path="financeiro" element={<PatientFinancialPage />} />
        <Route path="perfil" element={<PatientProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

