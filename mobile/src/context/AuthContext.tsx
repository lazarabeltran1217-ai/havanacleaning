import React, { createContext, useContext, useState, useEffect } from "react";
import { apiLogin, apiRegister, clearSession, getSession } from "../lib/api";

type UserRole = "CUSTOMER" | "EMPLOYEE" | "OWNER";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        if (session?.user) setUser(session.user);
      } catch {
        // No session
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const session = await apiLogin(email, password);
    if (session?.user) setUser(session.user);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const session = await apiRegister(data);
    if (session?.user) setUser(session.user);
  };

  const logout = async () => {
    await clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
