import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';

// CHARGEMENT LAZY
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfileForm = lazy(() => import('./pages/ProfileForm'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const SuspendedService = lazy(() => import('./pages/SuspendedService'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
// 1. AJOUTE L'IMPORT ICI
const Accueil = lazy(() => import('./pages/Accueil')); 

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
          
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-center" />
      </BrowserRouter>
    </div>
  );
}

export default App;