import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getApiErrorMessage } from "../services/api";
import { getCurrentUser, login, register } from "../services/authApi";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";
import { clearAuthSession, getStoredToken, getStoredUser, storeAuthSession } from "../utils/authStorage";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBootstrapping: boolean;
  loginUser: (payload: LoginPayload) => Promise<void>;
  registerUser: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch {
        clearAuthSession();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsBootstrapping(false);
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginUser = useCallback(async (payload: LoginPayload) => {
    try {
      const session = await login(payload);
      storeAuthSession(session);
      setUser(session.user);
    } catch (error) {
      throw new Error(getApiErrorMessage(error), { cause: error });
    }
  }, []);

  const registerUser = useCallback(async (payload: RegisterPayload) => {
    try {
      const session = await register(payload);
      storeAuthSession(session);
      setUser(session.user);
    } catch (error) {
      throw new Error(getApiErrorMessage(error), { cause: error });
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isBootstrapping,
      loginUser,
      registerUser,
      logout
    }),
    [isBootstrapping, loginUser, logout, registerUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
