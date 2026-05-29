import { useMemo, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";

const demoUser = {
  id: "demo-user",
  name: "Maria Santos",
  role: "pwd",
  email: "maria.santos@pdao.gov.ph",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(demoUser);

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout: () => setUser(null),
      isAuthenticated: Boolean(user),
      role: user?.role ?? "guest",
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
