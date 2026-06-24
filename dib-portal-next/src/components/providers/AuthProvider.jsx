"use client";

import { createContext, useContext, useEffect, useState } from "react";
import LoginOverlay from "@/components/auth/LoginOverlay";


const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session storage on mount
    const savedInfo = sessionStorage.getItem("dib_user_info");
    if (savedInfo) {
      try {
        const payload = JSON.parse(savedInfo);
        setUser(payload);
      } catch (e) {
        console.error("Failed to parse user info", e);
      }
    }
    setLoading(false);
  }, []);

  const login = (payload, token) => {
    sessionStorage.setItem("dib_user_token", token);
    sessionStorage.setItem("dib_user_info", JSON.stringify(payload));
    setUser(payload);
  };

  const logout = () => {
    sessionStorage.removeItem("dib_user_token");
    sessionStorage.removeItem("dib_user_info");
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!user ? <LoginOverlay onLogin={login} /> : children}
    </AuthContext.Provider>
  );
}
