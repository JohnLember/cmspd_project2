import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import {
  getAuthSession,
  onAuthStateChange,
  signInWithEmail,
  signOut as supabaseSignOut,
} from "../services/supabase/auth.js";

const mapSessionUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.user_metadata?.role || "guest",
  fullName:
    user.user_metadata?.full_name || user.user_metadata?.name || "",
  avatarUrl: user.user_metadata?.avatar_url || "",
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const { session } = await getAuthSession();
      if (!isMounted) return;
      setUser(session?.user ? mapSessionUser(session.user) : null);
      setIsInitializing(false);
    };

    initializeAuth();

    const { data } = onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setUser(session?.user ? mapSessionUser(session.user) : null);
    });

    return () => {
      isMounted = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }) => {
    const { error, user: signedInUser } = await signInWithEmail(email, password);
    if (error) {
      throw error;
    }
    setUser(signedInUser);
    return signedInUser;
  };

  const logout = async () => {
    await supabaseSignOut();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      signIn,
      logout,
      isAuthenticated: Boolean(user),
      role: user?.role ?? "guest",
    }),
    [user]
  );

  if (isInitializing) {
    return (
      <div className="grid min-h-screen place-items-center bg-[color:var(--gov-bg)] text-[color:var(--gov-text)]">
        <p className="text-sm text-[color:var(--gov-muted)]">Loading secure session…</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
