"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Network, 
  Users, 
  Calendar,
  ClipboardList,
  Settings
} from "lucide-react";

import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useData } from "../providers/DataProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedGroup, setExpandedGroup] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { employees, pagePermissions } = useData();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.includes("/leave-management") || pathname.includes("/employee")) {
      setExpandedGroup("employee");
    } else if (pathname.includes("/schedule") || pathname.includes("/workship") || pathname.includes("/qc-realcyber-plan") || pathname.includes("/project-scope") || pathname.includes("/public-holiday") || pathname.includes("/my-plan") || pathname.includes("/permission-settings")) {
      setExpandedGroup("workship");
    } else {
      setExpandedGroup("");
    }
  }, [pathname]);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (newCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  };

  const toggleGroup = (group, e) => {
    e.preventDefault();
    setExpandedGroup(prev => prev === group ? "" : group);
  };

  // Find user position
  const matchedEmp = (employees || []).find((e) => {
    const userEmail = (user?.email || "").toLowerCase().trim();
    const userName = (user?.name || "").toLowerCase().trim();
    const empEmail = (e.email || "").toLowerCase().trim();
    const empName = (e.name || "").toLowerCase().trim();
    const empNameEn = (e.nameEn || "").toLowerCase().trim();

    if (userEmail && empEmail === userEmail) return true;
    if (userName && empName === userName) return true;
    if (userName && empNameEn === userName) return true;
    return false;
  });

  const userPosition = matchedEmp?.position || matchedEmp?.pos || "Guest";

  // Check permission for a path
  const hasPermission = (path) => {
    if (path === "/my-plan") return true; // Always allow users to see their own plan
    if (!pagePermissions || pagePermissions.length === 0) return true; // fallback to true while loading
    
    const rule = pagePermissions.find(p => p.page_path === path);
    if (!rule) {
      if (path === "/permission-settings") {
        const pos = userPosition.toLowerCase();
        return pos === "manager" || pos === "team lead" || pos === "assistant manager";
      }
      return true; // if no rule, allowed by default
    }

    const allowed = rule.allowed_positions
      .split(",")
      .map(p => p.trim().toLowerCase())
      .filter(Boolean);

    return allowed.includes(userPosition.toLowerCase());
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon" style={{ width: "34px", height: "34px" }}>
            <svg viewBox="0 0 40 40" style={{ width: "100%", height: "100%" }}>
              <circle cx="20" cy="20" r="20" fill="#635BFF" />
              <g transform="translate(20, 20) rotate(-45)">
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                <line x1="-8" y1="-8" x2="4" y2="-8" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                <line x1="-4" y1="8" x2="8" y2="8" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
              </g>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">RealSmart DIB</span>
            <span className="logo-sub">Department Portal</span>
          </div>
        </div>
        <button className="sidebar-toggle" id="sidebarToggle" onClick={handleToggle}>
          {isCollapsed ? ">" : "<"}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-label">INTERNAL MANAGEMENT</span>
          
          <div className="nav-group">
            {hasPermission("/structure-team") && (
              <Link href="/structure-team" className={`nav-item ${pathname === "/structure-team" ? "active" : ""}`}>
                <Network className="nav-icon" />
                <span className="nav-text">Structure Team</span>
              </Link>
            )}
          </div>
          
          <div className="nav-group expanded">
            {hasPermission("/employee") ? (
              <>
                <Link href="/employee" className={`nav-item ${pathname === "/employee" ? "active" : ""}`}>
                  <Users className="nav-icon" />
                  <span className="nav-text">Employee Detail</span>
                </Link>
                {hasPermission("/leave-management") && (
                  <Link href="/leave-management" className={`nav-item sub ${pathname === "/leave-management" ? "active" : ""}`}>
                    <span className="nav-subdot"></span>
                    <span className="nav-text">Leave Management</span>
                  </Link>
                )}
              </>
            ) : (
              hasPermission("/leave-management") && (
                <Link href="/leave-management" className={`nav-item ${pathname === "/leave-management" ? "active" : ""}`}>
                  <ClipboardList className="nav-icon" />
                  <span className="nav-text">Leave Management</span>
                </Link>
              )
            )}
          </div>
          
          <div className="nav-group expanded">
            {hasPermission("/workship") ? (
              <>
                <Link href="/workship" className={`nav-item ${pathname === "/workship" ? "active" : ""}`}>
                  <span className="nav-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <path d="M17 14h-10" />
                      <path d="M13 18H7" />
                    </svg>
                  </span>
                  <span className="nav-text">Plan Workship</span>
                </Link>
                {hasPermission("/schedule") && (
                  <Link href="/schedule" className={`nav-item sub ${pathname === "/schedule" ? "active" : ""}`}>
                    <span className="nav-subdot"></span>
                    <span className="nav-text">Schedule</span>
                  </Link>
                )}
                {hasPermission("/project-scope-portal") && (
                  <Link href="/project-scope-portal" className={`nav-item sub ${pathname === "/project-scope-portal" ? "active" : ""}`}>
                    <span className="nav-subdot"></span>
                    <span className="nav-text">Workship by Scope</span>
                  </Link>
                )}
                {hasPermission("/qc-realcyber-plan") && (
                  <Link href="/qc-realcyber-plan" className={`nav-item sub ${pathname === "/qc-realcyber-plan" ? "active" : ""}`}>
                    <span className="nav-subdot"></span>
                    <span className="nav-text">RealCyber Plan</span>
                  </Link>
                )}
                {hasPermission("/public-holiday") && (
                  <Link href="/public-holiday" className={`nav-item sub ${pathname === "/public-holiday" ? "active" : ""}`}>
                    <span className="nav-subdot"></span>
                    <span className="nav-text">Public Holiday</span>
                  </Link>
                )}
                {hasPermission("/my-plan") && (
                  <Link href="/my-plan" className={`nav-item sub ${pathname === "/my-plan" ? "active" : ""}`}>
                    <span className="nav-subdot"></span>
                    <span className="nav-text">My Plan</span>
                  </Link>
                )}
              </>
            ) : (
              <>
                {hasPermission("/schedule") && (
                  <Link href="/schedule" className={`nav-item ${pathname === "/schedule" ? "active" : ""}`}>
                    <Calendar className="nav-icon" />
                    <span className="nav-text">Schedule</span>
                  </Link>
                )}
                {hasPermission("/project-scope-portal") && (
                  <Link href="/project-scope-portal" className={`nav-item ${pathname === "/project-scope-portal" ? "active" : ""}`}>
                    <ClipboardList className="nav-icon" />
                    <span className="nav-text">Workship by Scope</span>
                  </Link>
                )}
                {hasPermission("/qc-realcyber-plan") && (
                  <Link href="/qc-realcyber-plan" className={`nav-item ${pathname === "/qc-realcyber-plan" ? "active" : ""}`}>
                    <ClipboardList className="nav-icon" />
                    <span className="nav-text">RealCyber Plan</span>
                  </Link>
                )}
                {hasPermission("/public-holiday") && (
                  <Link href="/public-holiday" className={`nav-item ${pathname === "/public-holiday" ? "active" : ""}`}>
                    <Calendar className="nav-icon" />
                    <span className="nav-text">Public Holiday</span>
                  </Link>
                )}
                {hasPermission("/my-plan") && (
                  <Link href="/my-plan" className={`nav-item ${pathname === "/my-plan" ? "active" : ""}`}>
                    <ClipboardList className="nav-icon" />
                    <span className="nav-text">My Plan</span>
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="nav-group" style={{ marginTop: "auto" }}>
            {hasPermission("/permission-settings") && (
              <Link href="/permission-settings" className={`nav-item ${pathname === "/permission-settings" ? "active" : ""}`}>
                <Settings className="nav-icon" />
                <span className="nav-text">Permission Settings</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}
