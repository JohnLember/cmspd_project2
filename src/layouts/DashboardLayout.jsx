import AppShell from "./AppShell.jsx";
import { navigationItems } from "../constants/navigation.js";

export default function DashboardLayout() {
  return (
    <AppShell
      brandTitle="PDAO Loreto"
      brandSubtitle="PWD Monitoring System"
      portalLabel="PDAO portal"
      headerTitle="Community Monitoring System for PWD"
      nav={navigationItems}
    />
  );
}
