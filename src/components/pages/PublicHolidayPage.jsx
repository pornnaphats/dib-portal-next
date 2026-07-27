"use client";

import { useEffect, useState } from "react";
import { CalendarOff, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];

export default function PublicHolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) { setLoading(false); return; }

    fetch(`${supabaseUrl}/rest/v1/public_holidays?select=*&order=date.asc&limit=500`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
    })
      .then(r => r.json())
      .then(data => { setHolidays(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const yearHolidays = holidays.filter(h => h.date?.startsWith(String(year)));
  const filtered = selectedMonth !== null
    ? yearHolidays.filter(h => new Date(h.date).getMonth() === selectedMonth)
    : yearHolidays;

  const holidaySet = new Set(yearHolidays.map(h => h.date));

  return (
    <div style={{ padding: "24px 28px", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #635bff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarOff size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#24204D", margin: 0 }}>วันหยุดราชการ</h2>
            <p style={{ fontSize: "0.78rem", color: "#8f97b0", margin: 0 }}>Public Holiday {year}</p>
          </div>
        </div>
        {/* Year selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f4f4fb", borderRadius: "9999px", padding: "6px 14px" }}>
          <button onClick={() => setYear(y => y - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#635bff", display: "flex", alignItems: "center" }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 700, color: "#24204D", fontSize: "0.9rem", minWidth: "50px", textAlign: "center" }}>{year}</span>
          <button onClick={() => setYear(y => y + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#635bff", display: "flex", alignItems: "center" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#8f97b0" }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "start" }}>
          {/* Mini calendars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {MONTHS_TH.map((m, mi) => {
              const monthHols = yearHolidays.filter(h => new Date(h.date).getMonth() === mi);
              const firstDay = new Date(year, mi, 1).getDay();
              const daysInMonth = new Date(year, mi + 1, 0).getDate();
              const cells = [];
              for (let i = 0; i < firstDay; i++) cells.push(null);
              for (let d = 1; d <= daysInMonth; d++) cells.push(d);

              return (
                <div
                  key={mi}
                  onClick={() => setSelectedMonth(selectedMonth === mi ? null : mi)}
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    border: selectedMonth === mi ? "2px solid #635bff" : "1px solid #eef0f6",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    padding: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: selectedMonth === mi ? "#635bff" : "#24204D" }}>{m}</span>
                    {monthHols.length > 0 && (
                      <span style={{ background: "#635bff", color: "#fff", fontSize: "0.65rem", fontWeight: 700, borderRadius: "99px", padding: "2px 8px" }}>{monthHols.length} วัน</span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                    {DAYS_SHORT.map(d => (
                      <div key={d} style={{ fontSize: "0.6rem", textAlign: "center", color: "#b0b8cc", fontWeight: 700, paddingBottom: "2px" }}>{d}</div>
                    ))}
                    {cells.map((d, i) => {
                      if (!d) return <div key={`e${i}`} />;
                      const dateStr = `${year}-${String(mi + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      const isHol = holidaySet.has(dateStr);
                      const isSun = new Date(dateStr).getDay() === 0;
                      const isSat = new Date(dateStr).getDay() === 6;
                      return (
                        <div key={d} style={{
                          fontSize: "0.62rem",
                          textAlign: "center",
                          lineHeight: "22px",
                          borderRadius: "50%",
                          fontWeight: isHol ? 700 : 400,
                          background: isHol ? "#635bff" : "transparent",
                          color: isHol ? "#fff" : isSun ? "#ef4444" : isSat ? "#f59e0b" : "#4b5675",
                        }}>{d}</div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Holiday list */}
          <div>
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #eef0f6", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f2f8", background: "linear-gradient(135deg, #f8f6ff, #f4f4fb)" }}>
                <h3 style={{ margin: 0, fontWeight: 700, color: "#24204D", fontSize: "0.95rem" }}>
                  {selectedMonth !== null ? `วันหยุด${MONTHS_TH[selectedMonth]} ${year}` : `วันหยุดทั้งหมดปี ${year}`}
                  <span style={{ marginLeft: "8px", background: "#635bff", color: "#fff", fontSize: "0.7rem", borderRadius: "99px", padding: "2px 10px", fontWeight: 700 }}>{filtered.length} วัน</span>
                </h3>
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding: "48px", textAlign: "center", color: "#b0b8cc" }}>ไม่มีวันหยุดในช่วงนี้</div>
              ) : (
                <div>
                  {filtered.map((h, i) => {
                    const d = new Date(h.date);
                    const dayName = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"][d.getDay()];
                    return (
                      <div key={h.id || i} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 20px",
                        borderBottom: i < filtered.length - 1 ? "1px solid #f5f5fa" : "none",
                        transition: "background 0.15s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ textAlign: "center", minWidth: "52px", background: "linear-gradient(135deg, #635bff, #a78bfa)", borderRadius: "10px", padding: "8px 6px", color: "#fff" }}>
                          <div style={{ fontSize: "1.2rem", fontWeight: 800, lineHeight: 1 }}>{d.getDate()}</div>
                          <div style={{ fontSize: "0.6rem", fontWeight: 600, opacity: 0.85 }}>{MONTHS_TH[d.getMonth()].slice(0, 3)}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: "#24204D", fontSize: "0.9rem" }}>{h.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#8f97b0" }}>วัน{dayName} · {MONTHS_TH[d.getMonth()]} {year}</div>
                        </div>
                        <span style={{ background: "#f0eeff", color: "#635bff", fontSize: "0.7rem", fontWeight: 700, borderRadius: "99px", padding: "3px 12px" }}>หยุด</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
