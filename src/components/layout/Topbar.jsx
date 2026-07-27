"use client";

import { Bell, RefreshCw, LogOut, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useData } from "../providers/DataProvider";

export default function Topbar({ title = "Overview", breadcrumb = "..." }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const { employees } = useData();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find dynamic position/role from employees list based on the user's name
  const userName = user?.name || "Pornnaphat Srichanthong";
  const userEmail = user?.email || "";
  const matchedEmp = (employees || []).find(e =>
    (userEmail && (e.email?.toLowerCase().trim() === userEmail.toLowerCase().trim())) ||
    e.name?.toLowerCase().trim() === userName.toLowerCase().trim() ||
    e.name_en?.toLowerCase().trim() === userName.toLowerCase().trim()
  );
  
  const userPosition = matchedEmp?.position || matchedEmp?.pos || matchedEmp?.department || user?.role || "";

  // Get initials
  const initials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "PS";

  // Google Profile Picture
  const userPicture = user?.picture || "";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{title}</h1>
        <div className="breadcrumb">{breadcrumb}</div>
      </div>
      
      <div className="topbar-right">
        <div className="tb-user-menu" ref={menuRef} style={{ position: "relative" }}>
          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              background: "#edf2f7", 
              padding: "4px 16px 4px 6px", 
              borderRadius: "9999px", 
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            {userPicture ? (
              <img 
                src={userPicture} 
                alt={userName}
                referrerPolicy="no-referrer"
                style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  objectFit: "cover"
                }}
              />
            ) : (
              <div 
                style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  background: "#635bff", 
                  color: "#ffffff", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "0.85rem"
                }}
              >
                {initials}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.3", justifyContent: "center" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1e293b" }}>{userName}</span>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "500" }}>{userPosition}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px", alignSelf: "center" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          
          {menuOpen && (
            <div className="tb-user-dropdown" style={{ 
              display: "block", position: "absolute", top: "54px", right: "0",
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 12px 32px rgba(99,91,255,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              borderRadius: "16px",
              padding: "8px",
              width: "160px",
              zIndex: 9999,
              border: "1px solid rgba(99,91,255,0.08)"
            }}>
              <button
                onClick={logout}
                onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 14px",
                  background: "transparent", border: "none",
                  color: "#ef4444",
                  display: "flex", alignItems: "center", gap: "8px",
                  cursor: "pointer", borderRadius: "10px",
                  fontSize: "0.85rem", fontWeight: 600,
                  transition: "all 0.15s ease"
                }}
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
