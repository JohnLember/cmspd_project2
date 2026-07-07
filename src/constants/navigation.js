import {
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  Gauge,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";

export const navigationItems = [
  { label: "PDAO Dashboard", to: "/app/pdao", icon: Gauge },
  {
    label: "Users",
    icon: Users,
    children: [
      { label: "PWD Management", to: "/app/pwd", icon: UserCircle2 },
      { label: "Guardian Management", to: "/app/guardians", icon: ShieldCheck },
    ],
  },
  { label: "Applications", to: "/app/applications", icon: ClipboardList },
  { label: "Reports", to: "/app/reports", icon: FileText },
  { label: "Announcements", to: "/app/notifications", icon: Bell },
  { label: "Events", to: "/app/events", icon: CalendarDays },
  { label: "Settings", to: "/app/settings", icon: Settings },
];
