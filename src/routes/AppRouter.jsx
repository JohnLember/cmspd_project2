import { Routes, Route } from "react-router";
import AdminLayout from "../layouts/AdminLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Login from "../pages/auth/Login.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import GuardianDashboard from "../pages/dashboard/GuardianDashboard.jsx";
import PdaoDashboard from "../pages/dashboard/PdaoDashboard.jsx";
import PwdDashboard from "../pages/dashboard/PwdDashboard.jsx";
import Settings from "../pages/settings/Settings.jsx";
import NotFound from "../pages/system/NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute allowRoles={["pdao", "pwd", "guardian"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PdaoDashboard />} />
        <Route path="pdao" element={<AdminLayout />}>
          <Route index element={<PdaoDashboard />} />
        </Route>
        <Route path="pwd" element={<PwdDashboard />} />
        <Route path="guardian" element={<GuardianDashboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
