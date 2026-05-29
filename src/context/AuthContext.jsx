import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const demoUser = {
  id: "demo-user",
  name: "Maria Santos",
  role: "pdao",
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
