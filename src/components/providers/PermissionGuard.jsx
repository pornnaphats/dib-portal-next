"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useData } from "./DataProvider";
import { ShieldAlert, LogOut, Home } from "lucide-react";

export default function PermissionGuard({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { employees, pagePermissions } = useData();

  if (!user) return children; // AuthProvider handles login redirect

  // Find matching employee profile to get position
  const matchedEmp = (employees || []).find((e) => {
    const userEmail = (user.email || "").toLowerCase().trim();
    const userName = (user.name || "").toLowerCase().trim();
    const empEmail = (e.email || "").toLowerCase().trim();
    const empName = (e.name || "").toLowerCase().trim();
    const empNameEn = (e.nameEn || "").toLowerCase().trim();

    if (userEmail && empEmail === userEmail) return true;
    if (userName && empName === userName) return true;
    if (userName && empNameEn === userName) return true;
    return false;
  });

  const userPosition = matchedEmp?.position || matchedEmp?.pos || "Guest";

  // Find permission rule for the current route
  const permissionRule = (pagePermissions || []).find(
    (p) => p.page_path === pathname
  );

  let isAllowed = true;
  if (pathname === "/my-plan") {
    isAllowed = true; // Always allow users to see their own plan
  } else if (permissionRule) {
    const allowed = permissionRule.allowed_positions
      .split(",")
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);

    isAllowed = allowed.includes(userPosition.toLowerCase());
  } else if (pathname === "/permission-settings") {
    // Default hardcoded fallback security for settings page if no DB row exists yet
    const pos = userPosition.toLowerCase();
    isAllowed = pos === "manager" || pos === "team lead" || pos === "assistant manager";
  }

  if (!isAllowed) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        fontFamily: "'Kanit', sans-serif",
        padding: "20px",
        boxSizing: "border-box"
      }}>
        <div style={{
          background: "#ffffff",
          padding: "48px 40px",
          borderRadius: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          textAlign: "center",
          maxWidth: "480px",
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px"
          }}>
            <ShieldAlert size={40} />
          </div>

          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1e293b",
            margin: "0 0 12px"
          }}>ไม่มีสิทธิ์เข้าถึงหน้านี้</h2>

          <p style={{
            fontSize: "0.95rem",
            color: "#64748b",
            lineHeight: 1.6,
            margin: "0 0 32px"
          }}>
            ขออภัย หน้าเว็บที่คุณต้องการเข้าถึงถูกจำกัดสิทธิ์เฉพาะบางตำแหน่งเท่านั้น
            <br />
            <span style={{ fontWeight: 600, color: "#475569" }}>
              ตำแหน่งปัจจุบันของคุณ: {userPosition}
            </span>
          </p>

          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center"
          }}>
            <button
              onClick={() => window.location.href = "/my-plan"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                borderRadius: "99px",
                border: "none",
                background: "#635BFF",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99, 101, 255, 0.2)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#4f46e5"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#635BFF"}
            >
              <Home size={16} /> ไปหน้าหลัก (My Plan)
            </button>
            
            <button
              onClick={logout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                borderRadius: "99px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#ef4444",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <LogOut size={16} /> ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
