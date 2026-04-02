import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

// Lazy load pages for speed
const Landing = lazy(() => import('./pages/Landing'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const JoinTest = lazy(() => import('./pages/JoinTest'));
const PreExam = lazy(() => import('./pages/PreExam'));
const Exam = lazy(() => import('./pages/Exam'));
const Results = lazy(() => import('./pages/Results'));

import './styles/Submission.css';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  // Show splash screen FIRST, then reveal the app
  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplashDone(true)} />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="ae-loading-screen" />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/join-test" element={
              <ProtectedRoute><JoinTest /></ProtectedRoute>
            } />
            <Route path="/pre-exam" element={
              <ProtectedRoute><PreExam /></ProtectedRoute>
            } />
            <Route path="/exam" element={
              <ProtectedRoute><Exam /></ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute><Results /></ProtectedRoute>
            } />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
