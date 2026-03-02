"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import { usePrivy, useWallets } from "@privy-io/react-auth";

interface User {
  id: string;
  email: string;
  name: string;
  walletAddress: string | null;
  kycStatus: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  walletAddress: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address || null;

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/user/me`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // Sync wallet address to backend
  useEffect(() => {
    if (walletAddress && user && user.walletAddress !== walletAddress) {
      fetch(`${API_URL}/user/wallet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ walletAddress }),
      }).catch(console.error);
      setUser((prev) => (prev ? { ...prev, walletAddress } : prev));
    }
  }, [walletAddress, user]);

  // Auto-load session on mount
  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await authClient.signIn.email({ email, password });
    if (res.error) throw new Error(res.error.message || "Erreur de connexion");
    await refreshUser();
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authClient.signUp.email({ name, email, password });
    if (res.error) throw new Error(res.error.message || "Erreur d'inscription");
    await refreshUser();
  };

  const loginWithGoogle = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000/dashboard",
    });
  };

  const logout = async () => {
    await authClient.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
        walletAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
