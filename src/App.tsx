import { type ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainPage from "./pages/MainPage.tsx";
import DailyLogPage from "./pages/DailyLogPage.tsx";
import SalaryPage from "./pages/SalaryPage.tsx";
import SchedulePage from "./pages/SchedulePage.tsx";
import NoticePage from "./pages/NoticePage.tsx";
import AdminExportPage from "./pages/AdminExportPage.tsx";
import AdminUserManagement from "./pages/AdminUserManagement.tsx";
import AllowedNamesManagement from "./pages/AllowedNamesManagement.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";

function ProtectedRoute({ children, role }: { children: ReactNode; role: string | string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (role && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/daily-log"
            element={
              <ProtectedRoute role="worker">
                <DailyLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salary"
            element={
              <ProtectedRoute role="worker">
                <SalaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute role={['worker', 'boss']}>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices"
            element={
              <ProtectedRoute role={['worker', 'boss']}>
                <NoticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute role={['worker', 'manager', 'boss', 'admin']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/export"
            element={
              <ProtectedRoute role={['boss', 'admin']}>
                <AdminExportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/allowed-names"
            element={
              <ProtectedRoute role={['boss', 'admin']}>
                <AllowedNamesManagement />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
