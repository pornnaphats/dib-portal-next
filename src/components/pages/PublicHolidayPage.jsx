"use client";

import { useEffect, useState } from "react";
import { CalendarOff, ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS_SHORT = ["อา","จ","อ","พ","พฤ","ศ","ส"];

export default function PublicHolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);

  // --- State สำหรับ Modal เพิ่มวันหยุด ---
  const [showModal, setShowModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchHolidays = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) { setLoading(false); return; }

    fetch(`${supabaseUrl}/rest/v1/public_holidays?select=*&order=date.asc&limit=500`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
    })
      .then(r => r.json())
      .then(data => { setHolidays(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // --- ฟังก์ชันบันทึกวันหยุดลง Supabase ---
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newDate || !newName.trim()) return alert("กรุณากรอกวันที่และชื่อวันหยุด");

    setSubmitting(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/public_holidays`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          date: newDate,
          name: newName.trim()
        })
      });

      if (res.ok) {
        setShowModal(false);
        setNewDate("");
        setNewName("");
        fetchHolidays(); // โหลดข้อมูลใหม่
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกวันหยุด");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    } finally {
      setSubmitting(false);
    }
  };

  // --- ฟังก์ชันลบวันหยุด ---
  const handleDeleteHoliday = async (id) => {
    if (!confirm("คุณต้องการลบวันหยุดนี้ใช่หรือไม่?")) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/public_holidays?id=eq.${id}`, {
        method: "DELETE",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      });

      if (res.ok) {
        fetchHolidays();
      } else {
        alert("เกิดข้อผิดพลาดในการลบวันหยุด");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    }
  };

  const yearHolidays = holidays.filter(h => h.date?.startsWith(String(year)));
  const filtered = selectedMonth !== null
    ? yearHolidays.filter(h => new Date(h.date).getMonth() === selectedMonth)
    : yearHolidays;

  const holidaySet = new Set(yearHolidays.map(h => h.date));

  return (
    <div style={{ padding: "24px 28px", minHeight: "100%", position: "relative" }}>
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

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* ➕ ปุ่มเพิ่มวันหยุด */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#635bff",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              padding: "8px 16px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(99, 91, 255, 0.3)"
            }}
          >
            <Plus size={16} /> เพิ่มวันหยุด
          </button>

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
                        
                        {/* 🗑️ ปุ่มลบวันหยุด */}
                        {h.id && (
                          <button
                            onClick={() => handleDeleteHoliday(h.id)}
                            title="ลบวันหยุด"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#ef4444",
                              padding: "6px",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0.6,
                              transition: "opacity 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Modal Pop-up สำหรับกรอกวันหยุดใหม่ */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(36, 32, 77, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "24px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#24204D" }}>เพิ่มวันหยุดนักขัตฤกษ์</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#8f97b0" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5675", marginBottom: "6px" }}>
                  วันที่วันหยุด
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #eef0f6",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5675", marginBottom: "6px" }}>
                  ชื่อวันหยุด
                </label>
                <input
                  type="text"
                  placeholder="เช่น วันหยุดพิเศษประจำบริษัท"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #eef0f6",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #eef0f6",
                    background: "#f4f4fb",
                    color: "#4b5675",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#635bff",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? "Saving..." : "Save Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}