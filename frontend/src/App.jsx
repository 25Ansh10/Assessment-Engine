import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import JoinTest from './pages/JoinTest';
import PreExam from './pages/PreExam';
import Exam from './pages/Exam';
import Results from './pages/Results';

import './styles/Submission.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />

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
      </BrowserRouter>
    </AuthProvider>
  );
}
