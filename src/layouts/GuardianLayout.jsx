import AppShell from "./AppShell.jsx";
import { guardianNavigationItems } from "../constants/guardianNavigation.js";

export default function GuardianLayout() {
  return (
    <AppShell
      brandTitle="Guardian Portal"
      brandSubtitle="My Wards"
      portalLabel="Guardian portal"
      headerTitle="Community Monitoring System for PWD"
      nav={guardianNavigationItems}
    />
  );
}
