import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext.jsx";
import {
  getAuthSession,
  mapSessionUser,
  onAuthStateChange,
  signInWithEmail,
  signOut as supabaseSignOut,
} from "../services/supabase/auth.js";
import { joinPresence, leavePresence } from "../services/supabase/presence.js";
import { useRealtime } from "../hooks/useRealtime.js";

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

  // Track this user as "online" via Realtime presence while signed in.
  useEffect(() => {
    if (!user?.id) return undefined;
    joinPresence(user.id);
    return () => leavePresence();
  }, [user?.id]);

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

  // If PDAO deactivates this account while the user is online, sign them out
  // right away. RLS scopes these events to the user's own row(s).
  const role = user?.role ?? null;
  const uid = user?.id ?? null;
  const onStatusChange = (payload) => {
    const row = payload?.new;
    if (!row) return;
    const deactivated =
      role === "pwd" ? row.active === false : row.guardian_active === false;
    if (deactivated) {
      toast.error("Your account has been deactivated. Contact the PDAO office.");
      logout();
    }
  };
  useRealtime(
    role === "pwd" ? "profiles" : null,
    onStatusChange,
    uid ? `id=eq.${uid}` : undefined
  );
  useRealtime(
    role === "guardian" ? "guardian_ward_links" : null,
    onStatusChange,
    uid ? `guardian_id=eq.${uid}` : undefined
  );

  const value = useMemo(
    () => ({
      user,
      setUser,
      signIn,
      logout,
      isAuthenticated: Boolean(user),
      role: user?.role ?? null,
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
