import { BadgeCheck, Bell, IdCard, User } from "lucide-react";

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
