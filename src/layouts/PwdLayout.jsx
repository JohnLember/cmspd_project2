import { Outlet } from "react-router";
import Navbar from "../components/ui/Navbar.jsx";
import PwdSidebar from "../components/ui/PwdSidebar.jsx";

export default function PwdLayout() {
  return (
    <div className="min-h-screen bg-[color:var(--gov-bg)] text-[color:var(--gov-text)]">
      <div className="flex">
        <PwdSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex-1 px-6 pb-10 pt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
