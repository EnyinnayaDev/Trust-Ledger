import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Role } from "@/lib/types";
import { api, isMockMode, setMockMode } from "@/lib/api";
import { mockUsers } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => void;
  mockMode: boolean;
  toggleMockMode: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockModeState] = useState(isMockMode());

  useEffect(() => {
    const stored = localStorage.getItem("trustledger_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await api.login(username, password);
      setUser(loggedInUser);
      localStorage.setItem("trustledger_user", JSON.stringify(loggedInUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("trustledger_user");
  };

  const switchRole = (role: Role) => {
    const newUser = mockUsers.find(u => u.role === role) || mockUsers[0];
    setUser(newUser);
    localStorage.setItem("trustledger_user", JSON.stringify(newUser));
  };

  const toggleMockMode = () => {
    const newMode = !mockMode;
    setMockMode(newMode);
    setMockModeState(newMode);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchRole, mockMode, toggleMockMode }}>
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
