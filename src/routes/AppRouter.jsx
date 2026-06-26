import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router";
import LoadingScreen from "../components/ui/LoadingScreen.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const LandingPage = lazy(() => import("../pages/landing/LandingPage.jsx"));
const AuthLayout = lazy(() => import("../layouts/AuthLayout.jsx"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout.jsx"));
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const GuardianDashboard = lazy(
  () => import("../pages/dashboard/GuardianDashboard.jsx")
);
const GuardianProfile = lazy(
  () => import("../pages/guardian/GuardianProfile.jsx")
);
const PdaoDashboard = lazy(() => import("../pages/dashboard/PdaoDashboard.jsx"));
const PwdDashboard = lazy(() => import("../pages/dashboard/PwdDashboard.jsx"));
const PwdManagement = lazy(() => import("../pages/pwd/PwdManagement.jsx"));
const PwdLayout = lazy(() => import("../layouts/PwdLayout.jsx"));
const GuardianLayout = lazy(() => import("../layouts/GuardianLayout.jsx"));
const PwdBeneficiaryDashboard = lazy(
  () => import("../pages/pwd-beneficiary/PwdBeneficiaryDashboard.jsx")
);
const PwdDigitalId = lazy(
  () => import("../pages/pwd-beneficiary/PwdDigitalId.jsx")
);
const PwdAnnouncements = lazy(
  () => import("../pages/pwd-beneficiary/PwdAnnouncements.jsx")
);
const PwdProfile = lazy(() => import("../pages/pwd-beneficiary/PwdProfile.jsx"));
const Applications = lazy(() => import("../pages/applications/Applications.jsx"));
const Reports = lazy(() => import("../pages/reports/Reports.jsx"));
const Notifications = lazy(
  () => import("../pages/notifications/Notifications.jsx")
);
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
            <ProtectedRoute allowRoles={["pdao"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PdaoDashboard />} />
          <Route path="pdao" element={<PdaoDashboard />} />
          <Route path="pwd" element={<PwdManagement />} />
          <Route path="pwd/dashboard" element={<PwdDashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route
          path="/app/pwd-beneficiary"
          element={
            <ProtectedRoute allowRoles={["pwd"]}>
              <PwdLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PwdBeneficiaryDashboard />} />
          <Route path="digital-id" element={<PwdDigitalId />} />
          <Route path="announcements" element={<PwdAnnouncements />} />
          <Route path="profile" element={<PwdProfile />} />
        </Route>

        <Route
          path="/app/guardian"
          element={
            <ProtectedRoute allowRoles={["guardian"]}>
              <GuardianLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GuardianDashboard />} />
          <Route path="profile" element={<GuardianProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
