import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';

// CHARGEMENT LAZY
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfileForm = lazy(() => import('./pages/ProfileForm'));
const Subaccounts = lazy(() => import('./pages/Subaccounts'));
const LinkManagement = lazy(() => import('./pages/LinkManagement'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const SuspendedService = lazy(() => import('./pages/SuspendedService'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
// 1. AJOUTE L'IMPORT ICI
const Accueil = lazy(() => import('./pages/Accueil'));
const CommanderForm = lazy(() => import('./pages/CommanderForm'));
const Orders = lazy(() => import('./pages/Orders'));
const Stats = lazy(() => import('./pages/Stats'));

function AppRouter() {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Suspense fallback={<div className="h-screen bg-[#0a0a0b]" />}>
      <Routes>
          {/* 2. TA NOUVELLE PAGE D'ACCUEIL */}
          <Route path="/" element={<Accueil />} />
          <Route path="/commander" element={<CommanderForm />} />

          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
          <Route path="/subaccounts" element={<ProtectedRoute><Subaccounts /></ProtectedRoute>} />
          <Route path="/links" element={<ProtectedRoute><LinkManagement /></ProtectedRoute>} />
          <Route path="/profiles/new" element={<ProtectedRoute><ProfileForm /></ProtectedRoute>} />
          <Route path="/profiles/edit/:profileId" element={<ProtectedRoute><ProfileForm /></ProtectedRoute>} />
          <Route path="/suspended" element={<SuspendedService />} />
          
          <Route path="/p/:uniqueLink" element={<PublicProfile />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <HelmetProvider>
      <div className="App">
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-center" />
        </BrowserRouter>
      </div>
    </HelmetProvider>
  );
}

export default App;