import {
  Bell,
  ClipboardList,
  FileText,
  Gauge,
  Settings,
  UserCircle2,
} from "lucide-react";

export const navigationItems = [
  { label: "PDAO Dashboard", to: "/pdao", icon: Gauge },
  { label: "PWD Management", to: "/pwd", icon: UserCircle2 },
  { label: "Applications", to: "/applications", icon: ClipboardList },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Settings", to: "/settings", icon: Settings },
];
