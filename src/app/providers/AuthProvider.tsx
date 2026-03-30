import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  authenticateUser,
  clearSession,
  getCurrentSessionUser,
} from "../lib/api";
import { initializeDb } from "../lib/db";
import { UserRecord } from "../lib/types";

interface AuthContextValue {
  currentUser: UserRecord | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserRecord>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDb();

    getCurrentSessionUser()
      .then((user) => setCurrentUser(user))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isLoading,
      async login(email, password) {
        const user = await authenticateUser(email, password);
        setCurrentUser(user);
        return user;
      },
      logout() {
        clearSession();
        setCurrentUser(null);
      },
    }),
    [currentUser, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
