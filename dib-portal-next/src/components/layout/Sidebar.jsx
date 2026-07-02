"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Network, 
  Users, 
  Calendar 
} from "lucide-react";

import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedGroup, setExpandedGroup] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (pathname.includes("/leave-management") || pathname.includes("/employee")) {
      setExpandedGroup("employee");
    } else if (pathname.includes("/schedule") || pathname.includes("/workship") || pathname.includes("/qc-realcyber") || pathname.includes("/project-scope") || pathname.includes("/public-holiday")) {
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
  };

  const toggleGroup = (group, e) => {
    e.preventDefault();
    setExpandedGroup(prev => prev === group ? "" : group);
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
            <Link href="/structure-team" className={`nav-item ${pathname === "/structure-team" ? "active" : ""}`}>
              <Network className="nav-icon" />
              <span className="nav-text">Structure Team</span>
            </Link>
          </div>
          
          <div className="nav-group expanded">
            <Link href="/employee" className={`nav-item ${pathname === "/employee" ? "active" : ""}`}>
              <Users className="nav-icon" />
              <span className="nav-text">Employee Detail</span>
            </Link>
            <Link href="/leave-management" className={`nav-item sub ${pathname === "/leave-management" ? "active" : ""}`}>
              <span className="nav-subdot"></span>
              <span className="nav-text">Leave Management</span>
            </Link>
          </div>
          
          <div className="nav-group expanded">
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
            <Link href="/schedule" className={`nav-item sub ${pathname === "/schedule" ? "active" : ""}`}>
              <span className="nav-subdot"></span>
              <span className="nav-text">Schedule</span>
            </Link>
            <Link href="/project-scope-portal" className={`nav-item sub ${pathname === "/project-scope-portal" ? "active" : ""}`}>
              <span className="nav-subdot"></span>
              <span className="nav-text">Workship by Scope</span>
            </Link>
            <Link href="/qc-realcyber-plan" className={`nav-item sub ${pathname === "/qc-realcyber-plan" ? "active" : ""}`}>
              <span className="nav-subdot"></span>
              <span className="nav-text">RealCyber Plan</span>
            </Link>
            <Link href="/public-holiday" className={`nav-item sub ${pathname === "/public-holiday" ? "active" : ""}`}>
              <span className="nav-subdot"></span>
              <span className="nav-text">Public Holiday</span>
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
