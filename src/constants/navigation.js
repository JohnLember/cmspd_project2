import {
  Bell,
  ClipboardList,
  FileText,
  Gauge,
  Settings,
  UserCircle2,
} from "lucide-react";

export const navigationItems = [
  { label: "PDAO Dashboard", to: "/app/pdao", icon: Gauge },
  { label: "PWD Management", to: "/app/pwd", icon: UserCircle2 },
  { label: "Applications", to: "/app/applications", icon: ClipboardList },
  { label: "Reports", to: "/app/reports", icon: FileText },
  { label: "Notifications", to: "/app/notifications", icon: Bell },
  { label: "Settings", to: "/app/settings", icon: Settings },
];
