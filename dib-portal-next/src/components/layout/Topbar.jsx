"use client";

import { Bell, RefreshCw, LogOut, Shield } from "lucide-react";
import { useState } from "react";

export default function Topbar({ title = "Overview", breadcrumb = "..." }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{title}</h1>
        <div className="breadcrumb">{breadcrumb}</div>
      </div>
      
      <div className="topbar-right">
        <button className="tb-icon-btn" style={{ marginLeft: "8px", marginRight: "8px", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
          <RefreshCw size={16} />
        </button>
        
        <div className="tb-notification-wrapper">
          <button className="tb-icon-btn">
            <Bell size={20} />
            <span className="tb-badge">3</span>
          </button>
        </div>
        
        <div className="tb-user-menu" style={{ position: "relative" }}>
          <div className="tb-avatar" onClick={() => setMenuOpen(!menuOpen)}>AD</div>
          
          {menuOpen && (
            <div className="tb-user-dropdown" style={{ display: "block", position: "absolute", top: "45px", right: "0", background: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", borderRadius: "12px", padding: "8px", width: "160px", zIndex: 9999 }}>
              <button style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "transparent", color: "#334155", display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield size={16} /> Permissions
              </button>
              <button style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "transparent", color: "#ef4444", display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
