import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserSession {
  id: number;
  email: string;
  role: "RECRUITER" | "INDIVIDUAL";
  token: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: UserSession | null;
  role: "RECRUITER" | "INDIVIDUAL" | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: UserSession) => void;
  logout: () => void;
  updateUserContext: (updates: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
        } catch (e) {
          console.error("Failed to parse persisted user session:", e);
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateUserContext = (updates: Partial<UserSession>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    role: user ? user.role : null,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUserContext,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
