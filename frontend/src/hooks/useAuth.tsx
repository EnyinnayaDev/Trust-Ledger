import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, clearToken, getToken } from "@/lib/api";
import type { TraderProfile, Lender } from "@/lib/api";

export type Role = "trader" | "lender" | "admin";

export interface User {
  id: number;
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("trustledger_user");
    const token = getToken();
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

 const login = async (username: string, password: string, role: Role) => {
    setLoading(true);
    try {
      const result = await api.login(username, password, role);
      const userData: User = { id: 0, username: result.username, role };
      setUser(userData);
      localStorage.setItem("trustledger_user", JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
    localStorage.removeItem("trustledger_user");
    localStorage.removeItem("trustledger_refresh_token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}