"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useData } from "../providers/DataProvider";
import { Shield, Save, Check, RefreshCw, AlertCircle, Info, Users, Layout } from "lucide-react";

export default function PermissionSettingsView() {
  const { user } = useAuth();
  const { employees, pagePermissions: initialPermissions } = useData();

  const [permissions, setPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  // Extract unique positions dynamically from the employees list
  const allPositions = useMemo(() => {
    if (!employees || employees.length === 0) {
      return ["Director", "Manager", "Assistant Manager", "Senior", "Junior"];
    }
    const uniq = new Set();
    employees.forEach((emp) => {
      const pos = emp.position || emp.pos;
      if (pos && pos !== "-") {
        uniq.add(pos);
      }
    });
    
    const positionsList = Array.from(uniq);

    // Custom sorting based on hierarchy
    const hierarchy = [
      "director",
      "manager",
      "assistant manager",
      "assistant",
      "senior",
      "junior"
    ];

    return positionsList.sort((a, b) => {
      const aLower = a.toLowerCase().trim();
      const bLower = b.toLowerCase().trim();
      
      const idxA = hierarchy.indexOf(aLower);
      const idxB = hierarchy.indexOf(bLower);

      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      
      return a.localeCompare(b);
    });
  }, [employees]);

  // List of all pages with human-readable labels
  const pageDetails = {
    "/structure-team": "Structure Team",
    "/employee": "Employee Detail",
    "/leave-management": "Leave Management",
    "/workship": "Plan Workship",
    "/schedule": "Schedule",
    "/project-scope-portal": "Workship by Scope",
    "/qc-realcyber-plan": "RealCyber Plan",
    "/public-holiday": "Public Holiday",
    "/my-plan": "My Plan",
    "/permission-settings": "Permission Settings",
  };

  // Sync initial permissions from Provider state
  useEffect(() => {
    if (initialPermissions && initialPermissions.length > 0) {
      const map = new Map(initialPermissions.map((p) => [p.page_path, p]));
      const merged = Object.keys(pageDetails).map((path) => {
        const existing = map.get(path);
        return {
          page_path: path,
          allowed_positions: existing 
            ? existing.allowed_positions 
            : (path === "/permission-settings" ? "Manager" : "Manager,Team Lead")
        };
      });
      setPermissions(merged);
    } else {
      const defaults = Object.keys(pageDetails).map((path) => ({
        page_path: path,
        allowed_positions: path === "/permission-settings" ? "Manager" : "Manager,Team Lead"
      }));
      setPermissions(defaults);
    }
  }, [initialPermissions]);

  // Toggle position selection for a specific page path in local state
  const handleTogglePosition = (pagePath, position) => {
    setPermissions((prev) => {
      return prev.map((p) => {
        if (p.page_path !== pagePath) return p;

        let arr = p.allowed_positions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        const posLower = position.toLowerCase();
        const existingIdx = arr.findIndex((item) => item.toLowerCase() === posLower);

        if (existingIdx > -1) {
          arr.splice(existingIdx, 1);
        } else {
          arr.push(position);
        }

        return { ...p, allowed_positions: arr.join(",") };
      });
    });
  };

  // Save all permissions at once using Supabase bulk upsert
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase configuration");
      }

      const payload = permissions.map(p => ({
        page_path: p.page_path,
        allowed_positions: p.allowed_positions
      }));

      const res = await fetch(`${supabaseUrl}/rest/v1/page_permissions?on_conflict=page_path`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to upsert permissions");
      }

      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus(null);
        window.location.reload();
      }, 2000);
    } catch (e) {
      console.error("Save all error:", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        padding: "24px",
        fontFamily: "'Kanit', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
        height: "100%",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
          Permission Settings
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "4px 0 0" }}>
          Manage page visibility and access rights based on employee positions.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "24px",
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* Left Column: Permissions Table */}
        <div
          className="table-wrap"
          style={{
            border: "1px solid var(--border)",
            borderRadius: "20px",
            overflow: "hidden",
            background: "var(--surface)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
          }}
        >
          <table
            className="data-table"
            style={{ width: "100%", borderCollapse: "collapse", border: "none" }}
          >
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
                <th
                  style={{
                    padding: "18px 24px",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#475569",
                    width: "280px",
                  }}
                >
                  Page / Module
                </th>
                <th
                  style={{
                    padding: "18px 24px",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  Allowed Positions
                </th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((page) => {
                const allowedList = page.allowed_positions
                  .split(",")
                  .map((p) => p.trim().toLowerCase())
                  .filter(Boolean);

                return (
                  <tr
                    key={page.page_path}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#fcfdfe";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Page Title & Path */}
                    <td style={{ padding: "18px 24px", verticalAlign: "middle" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" }}>
                        {pageDetails[page.page_path] || page.page_path}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "#94a3b8",
                          fontFamily: "monospace",
                          marginTop: "4px",
                        }}
                      >
                        {page.page_path}
                      </div>
                    </td>

                    {/* Positions chips */}
                    <td style={{ padding: "18px 24px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {allPositions.map((pos) => {
                          const isChecked = allowedList.includes(pos.toLowerCase());
                          return (
                            <button
                              key={pos}
                              onClick={() => handleTogglePosition(page.page_path, pos)}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "99px",
                                border: isChecked ? "1.5px solid #635BFF" : "1.5px solid #e2e8f0",
                                background: isChecked ? "#f5f3ff" : "#ffffff",
                                color: isChecked ? "#635BFF" : "#64748b",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {isChecked && <Check size={12} strokeWidth={3} />}
                              {pos}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column: Sticky Action & Guide Sidebar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Main Save Action Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid var(--border)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "#eef2ff",
                  color: "#635BFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={20} />
              </div>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>
                Save Changes
              </span>
            </div>

            <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5, margin: 0 }}>
              Once you have updated the permissions, click the button below to save the settings to the system.
            </p>

            {saveStatus === "success" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#ecfdf5",
                  border: "1.5px solid #a7f3d0",
                  padding: "12px",
                  borderRadius: "12px",
                  color: "#065f46",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                <Check size={16} /> Permissions saved successfully! Reloading page...
              </div>
            )}

            {saveStatus === "error" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#fef2f2",
                  border: "1.5px solid #fca5a5",
                  padding: "12px",
                  borderRadius: "12px",
                  color: "#991b1b",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={16} /> An error occurred while saving the data
              </div>
            )}

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "99px",
                border: "none",
                background: saveStatus === "success" ? "#10b981" : "#635BFF",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: saveStatus === "success"
                  ? "0 4px 14px rgba(16, 185, 129, 0.3)"
                  : "0 4px 14px rgba(99, 101, 255, 0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (saveStatus !== "success") e.currentTarget.style.background = "#4f46e5";
              }}
              onMouseLeave={(e) => {
                if (saveStatus !== "success") e.currentTarget.style.background = "#635BFF";
              }}
            >
              {isSaving ? (
                <RefreshCw size={16} className="spin" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Save size={16} />
              )}
              Save All Permissions
            </button>
          </div>

          {/* Quick Guide & Stats Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid var(--border)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
              <Info size={16} color="#64748b" />
              <span>Permission Summary</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Stat 1 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #e2e8f0", paddingBottom: "10px" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layout size={14} /> Total Pages
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                  {Object.keys(pageDetails).length} Pages
                </span>
              </div>
              
              {/* Stat 2 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "6px" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Users size={14} /> System Positions
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                  {allPositions.length} Positions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
