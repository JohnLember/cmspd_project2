import { LayoutDashboard, User } from "lucide-react";

export const guardianNavigationItems = [
  {
    label: "Guardian Dashboard",
    to: "/app/guardian",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "My Profile",
    to: "/app/guardian/profile",
    icon: User,
  },
];
