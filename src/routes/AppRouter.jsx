import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router";
import LoadingScreen from "../components/ui/LoadingScreen.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const LandingPage = lazy(() => import("../pages/landing/LandingPage.jsx"));
const AuthLayout = lazy(() => import("../layouts/AuthLayout.jsx"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout.jsx"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout.jsx"));
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const GuardianDashboard = lazy(
  () => import("../pages/dashboard/GuardianDashboard.jsx")
);
const PdaoDashboard = lazy(() => import("../pages/dashboard/PdaoDashboard.jsx"));
const PwdDashboard = lazy(() => import("../pages/dashboard/PwdDashboard.jsx"));
const PwdManagement = lazy(() => import("../pages/pwd/PwdManagement.jsx"));
const Settings = lazy(() => import("../pages/settings/Settings.jsx"));
const NotFound = lazy(() => import("../pages/system/NotFound.jsx"));
const BeneficiaryApply = lazy(
  () => import("../pages/beneficiary/BeneficiaryApply.jsx")
);

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/beneficiary-apply" element={<BeneficiaryApply />} />

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route
          path="/app"
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
          <Route path="pwd" element={<PwdManagement />} />
          <Route path="pwd/dashboard" element={<PwdDashboard />} />
          <Route path="guardian" element={<GuardianDashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
