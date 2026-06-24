"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Network, 
  Users, 
  Calendar 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">DIB</div>
          <div className="logo-text">
            <span className="logo-name">RealSmart DIB</span>
            <span className="logo-sub">Department Portal</span>
          </div>
        </div>
        <button className="sidebar-toggle" id="sidebarToggle">&#9776;</button>
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
          
          <div className="nav-group">
            <Link href="/employee" className={`nav-item ${pathname === "/employee" ? "active" : ""}`}>
              <Users className="nav-icon" />
              <span className="nav-text">Employee Detail</span>
            </Link>
            <Link href="/leave-management" className={`nav-item sub ${pathname === "/leave-management" ? "active" : ""}`}>
              <span className="nav-subdot"></span>
              <span className="nav-text">Leave Management</span>
            </Link>
          </div>
          
          <div className="nav-group">
            <Link href="/workship" className={`nav-item ${pathname === "/workship" ? "active" : ""}`}>
              <Calendar className="nav-icon" />
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
