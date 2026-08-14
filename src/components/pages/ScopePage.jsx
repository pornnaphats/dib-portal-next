"use client";

import { useEffect, useState } from "react";
import { Layers, Search, ChevronDown, ChevronRight } from "lucide-react";

export default function ScopePage() {
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) { setLoading(false); return; }

    const fetchAllScopes = async () => {
      let allData = [];
      let offset = 0;
      let limit = 1000;
      let hasMore = true;
      while (hasMore) {
        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/project_scopes?select=*&limit=${limit}&offset=${offset}`, {
            headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              allData = allData.concat(data);
              offset += limit;
              if (data.length < limit) {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        } catch (e) {
          hasMore = false;
        }
      }

      // Group by project
      const grouped = {};
      allData.forEach(row => {
        const acc = row.project || "Uncategorized";
        if (!grouped[acc]) grouped[acc] = { account: acc, items: [] };
        grouped[acc].items.push({
          id: row.id,
          name: row.work_detail || "Unnamed",
          node: row.node || "Other",
          progress: parseInt(row.percentage) || 0,
          status: row.status || "",
          assignee: row.assignee || "",
        });
      });
      setScopes(Object.values(grouped));
      if (Object.keys(grouped).length > 0) {
        setExpanded({ [Object.keys(grouped)[0]]: true });
      }
      setLoading(false);
    };

    fetchAllScopes();
  }, []);

  const filtered = scopes.filter(g =>
    !search || g.account.toLowerCase().includes(search.toLowerCase()) ||
    g.items.some(it => it.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getProgressColor = (p) => {
    if (p >= 100) return "#10b981";
    if (p >= 70) return "#635bff";
    if (p >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ padding: "24px 28px", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #635bff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Layers size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#24204D", margin: 0 }}>Workship by Scope</h2>
            <p style={{ fontSize: "0.78rem", color: "#8f97b0", margin: 0 }}>ภาพรวมงานตาม Project / Account</p>
          </div>
        </div>
        {/* Search */}
        <div className="search-box" style={{ width: "260px" }}>
          <Search size={14} style={{ color: "#b0b8cc", flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหา Account / งาน..."
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "จำนวน Account", value: scopes.length, color: "#635bff" },
          { label: "งานทั้งหมด", value: scopes.reduce((s, g) => s + g.items.length, 0), color: "#10b981" },
          { label: "งานเสร็จแล้ว", value: scopes.reduce((s, g) => s + g.items.filter(i => i.progress >= 100).length, 0), color: "#f59e0b" },
        ].map((stat, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #eef0f6", padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.78rem", color: "#8f97b0", marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#8f97b0" }}>กำลังโหลดข้อมูล...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#b0b8cc" }}>ไม่พบข้อมูล</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((group) => {
            const isOpen = !!expanded[group.account];
            const avgProgress = group.items.length ? Math.round(group.items.reduce((s, i) => s + i.progress, 0) / group.items.length) : 0;
            return (
              <div key={group.account} style={{ background: "#fff", borderRadius: "16px", border: "1px solid #eef0f6", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                {/* Account header */}
                <div
                  onClick={() => setExpanded(prev => ({ ...prev, [group.account]: !prev[group.account] }))}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", cursor: "pointer", background: isOpen ? "linear-gradient(135deg, #f8f6ff, #f4f4fb)" : "#fff", transition: "background 0.2s" }}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #635bff22, #a78bfa22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isOpen ? <ChevronDown size={16} color="#635bff" /> : <ChevronRight size={16} color="#635bff" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#24204D", fontSize: "0.95rem" }}>{group.account}</div>
                    <div style={{ fontSize: "0.73rem", color: "#8f97b0" }}>{group.items.length} งาน</div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "120px", height: "6px", background: "#f0f2f8", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ width: `${avgProgress}%`, height: "100%", background: getProgressColor(avgProgress), borderRadius: "99px", transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: getProgressColor(avgProgress), minWidth: "36px" }}>{avgProgress}%</span>
                  </div>
                </div>

                {/* Items */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid #f0f2f8" }}>
                    {group.items.map((item, idx) => (
                      <div key={item.id || idx} style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "12px 20px 12px 64px",
                        borderBottom: idx < group.items.length - 1 ? "1px solid #f8f8fc" : "none",
                        transition: "background 0.15s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: "#24204D", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "#8f97b0" }}>{item.node}</div>
                        </div>
                        {item.assignee && (
                          <span style={{ fontSize: "0.72rem", color: "#635bff", background: "#f0eeff", borderRadius: "99px", padding: "2px 10px" }}>{item.assignee}</span>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "80px", height: "5px", background: "#f0f2f8", borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{ width: `${item.progress}%`, height: "100%", background: getProgressColor(item.progress), borderRadius: "99px" }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: getProgressColor(item.progress), minWidth: "34px", textAlign: "right" }}>{item.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
