import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ChangePasswordPage } from './pages/ChangePasswordPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { BoardPage } from './pages/BoardPage.jsx';
import { AdminUsersPage } from './pages/AdminUsersPage.jsx';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/change-password" element={<Protected allowPasswordChange><ChangePasswordPage /></Protected>} />
      <Route path="/" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/boards/:id" element={<Protected><BoardPage /></Protected>} />
      <Route path="/admin/users" element={<Protected><AdminUsersPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Protected({ children, allowPasswordChange = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-sm text-slate-600">Cargando sesion...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.must_change_password && !allowPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}
