import AppShell from "./AppShell.jsx";
import VoiceNav from "../components/ui/VoiceNav.jsx";
import { pwdNavigationItems } from "../constants/pwdNavigation.js";

export default function PwdLayout() {
  return (
    <AppShell
      brandTitle="PWD Beneficiary"
      brandSubtitle="My Services"
      portalLabel="PWD portal"
      headerTitle="Community Monitoring System for PWD"
      nav={pwdNavigationItems}
    >
      <VoiceNav />
    </AppShell>
  );
}
