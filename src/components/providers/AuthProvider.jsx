"use client";
import Loading from "@/components/Loading";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  const login = useCallback((payload, token) => {
    sessionStorage.setItem("dib_user_token", token);
    sessionStorage.setItem("dib_user_info", JSON.stringify(payload));
    setUser(payload);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("dib_user_token");
    sessionStorage.removeItem("dib_user_info");
    setUser(null);
    window.location.reload();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh", 
        width: "100vw",
        background: "linear-gradient(135deg, #e8eaf6 0%, #ede9f8 40%, #dce3f4 100%)",
        fontFamily: "'Kanit', sans-serif",
        color: "#635BFF",
        fontSize: "1.2rem",
        fontWeight: 500
      }}>
        <Loading></Loading>...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!user ? <LoginOverlay onLogin={login} /> : children}
    </AuthContext.Provider>
  );
}
