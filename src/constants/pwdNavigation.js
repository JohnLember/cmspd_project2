import { BadgeCheck, Bell, FileText, IdCard, User } from "lucide-react";

export const pwdNavigationItems = [
  {
    label: "PWD Dashboard",
    to: "/app/pwd-beneficiary",
    icon: BadgeCheck,
    end: true,
  },
  {
    label: "Digital ID",
    to: "/app/pwd-beneficiary/digital-id",
    icon: IdCard,
  },
  {
    label: "Subsidy Status",
    to: "/app/pwd-beneficiary/subsidy-status",
    icon: FileText,
  },
  {
    label: "Announcements",
    to: "/app/pwd-beneficiary/announcements",
    icon: Bell,
  },
  {
    label: "Profile Management",
    to: "/app/pwd-beneficiary/profile",
    icon: User,
  },
];
