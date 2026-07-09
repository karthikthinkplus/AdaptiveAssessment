"use client";
import AppShell from "@/components/layout/AppShell";
import SkillPieChart from "@/components/charts/SkillPieChart";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import { TOPIC_PERFORMANCE_RADAR } from "@/lib/mockData";
import { Users, BarChart2, AlertCircle, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const inferRole = (email: string, inst: string | null): string => {
  const e = email.toLowerCase();
  if (e.includes("admin")) return "Admin";
  if (e.includes("qbm") || e.includes("content")) return "QBM";
  if (e.includes("teacher") || inst === "School" || inst?.includes("Public School")) return "Teacher";
  return "Student";
};

export default function TeacherDashboard() {
  const [hasStudents, setHasStudents] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("Class 10 - A");
  const [selectedSubject, setSelectedSubject] = useState("Math");


  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setIsFiltering(true);
    setTimeout(() => {
      setIsFiltering(false);
    }, 450);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
    setIsFiltering(true);
    setTimeout(() => {
      setIsFiltering(false);
    }, 450);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("current_role", "teacher");
      const token = sessionStorage.getItem("tp_token");
      if (!token) return;

      api.get<any[]>("/api/v1/users").then((list) => {
        const studentList = (list || []).filter(u => inferRole(u.email, u.institution_name) === "Student");
        if (studentList.length > 0) {
          setHasStudents(true);
          setStudents(studentList);
        } else {
          setHasStudents(false);
        }
      }).catch((err) => {
        console.error("Teacher dashboard failed to load users from API, falling back to empty state", err);
        setHasStudents(false);
      });
    }
  }, []);


  // Interactive Date Range Picker States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 4, 6)); // Default: May 6, 2026
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 4, 12)); // Default: May 12, 2026
  const [tempStart, setTempStart] = useState<Date | null>(new Date(2026, 4, 6));
  const [tempEnd, setTempEnd] = useState<Date | null>(new Date(2026, 4, 12));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const [calMonth, setCalMonth] = useState(4); // Default to May
  const [calYear, setCalYear] = useState(2026);
  const [activePreset, setActivePreset] = useState("Last 7 Days");
  const [isFiltering, setIsFiltering] = useState(false);

  // Computations
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Generate dynamic chart data based on date range
  const getDynamicChartData = () => {
    const data = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    let step = 1;
    if (diffDays > 12) step = Math.ceil(diffDays / 8);
    
    const currentDate = new Date(startDate);
    let count = 0;
    while (currentDate <= endDate && count < 12) {
      const dayLabel = days[currentDate.getDay()] + " " + currentDate.getDate();
      // Increase variability by applying larger multipliers to date/month
      const dateSeed = currentDate.getDate() * 11 + currentDate.getMonth() * 17 + currentDate.getFullYear();
      let score = 58 + (dateSeed % 37); // Yields scores from 58% to 94%
      
      // Apply filters scaling
      if (selectedClass === "Class 10 - B") score = Math.max(40, Math.round(score * 0.9));
      else if (selectedClass === "Class 9 - A") score = Math.max(40, Math.round(score * 0.82));
      if (selectedSubject === "Science") score = Math.max(40, Math.round(score * 0.93));

      data.push({ day: dayLabel, score });
      
      currentDate.setDate(currentDate.getDate() + step);
      count++;
    }
    
    if (data.length === 0) {
      data.push({ day: "No Data", score: 0 });
    } else if (data.length === 1) {
      data.push({ day: "Next Day", score: Math.min(100, data[0].score + 2) });
    }
    
    return data;
  };

  const chartData = getDynamicChartData();
  const chartAvg = Math.round(chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length);
  const avgPerformance = `${chartAvg}%`;
  
  // Stats multipliers based on selectedClass/Subject
  let classMultiplier = 1.0;
  const totalStudents = students.length;
  const masteredTopics = 0;
  const needingAttention = 0;

  // Formatting Date Range for Display
  const formatDateRange = (start: Date, end: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
  };

  // Preset Selection Handler
  const handlePresetSelect = (preset: string) => {
    setActivePreset(preset);
    const today = new Date(2026, 4, 12); // May 12, 2026 is our reference "today" date
    let start = new Date(today);
    let end = new Date(today);
    
    if (preset === "Last 7 Days") {
      start.setDate(today.getDate() - 6);
      setCalMonth(4);
      setCalYear(2026);
    } else if (preset === "Last 30 Days") {
      start.setDate(today.getDate() - 29);
      setCalMonth(4);
      setCalYear(2026);
    } else if (preset === "This Month") {
      start = new Date(2026, 4, 1);
      end = new Date(2026, 4, 31);
      setCalMonth(4);
      setCalYear(2026);
    } else if (preset === "Last Month") {
      start = new Date(2026, 3, 1);
      end = new Date(2026, 3, 30);
      setCalMonth(3);
      setCalYear(2026);
    }
    
    setTempStart(start);
    setTempEnd(end);
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  // Apply range changes
  const handleApply = () => {
    if (tempStart && tempEnd) {
      setIsDatePickerOpen(false);
      setIsFiltering(true);
      setStartDate(tempStart);
      setEndDate(tempEnd);
      setTimeout(() => {
        setIsFiltering(false);
      }, 400);
    }
  };

  // Generate calendar days
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const monthDays = [];
    const totalDays = getDaysInMonth(calMonth, calYear);
    const firstDay = getFirstDayOfMonth(calMonth, calYear);
    
    // Previous month buffer
    const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
    const prevYear = calMonth === 0 ? calYear - 1 : calYear;
    const prevMonthTotalDays = getDaysInMonth(prevMonth, prevYear);
    for (let i = firstDay - 1; i >= 0; i--) {
      monthDays.push({
        day: prevMonthTotalDays - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false
      });
    }
    
    // Current month
    for (let i = 1; i <= totalDays; i++) {
      monthDays.push({
        day: i,
        month: calMonth,
        year: calYear,
        isCurrentMonth: true
      });
    }
    
    // Next month buffer to make it a grid of 42
    const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
    const nextYear = calMonth === 11 ? calYear + 1 : calYear;
    const nextBuffer = 42 - monthDays.length;
    for (let i = 1; i <= nextBuffer; i++) {
      monthDays.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false
      });
    }
    
    return monthDays;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const isSelectedStart = (d: typeof calendarDays[0]) => {
    return tempStart && tempStart.getDate() === d.day && tempStart.getMonth() === d.month && tempStart.getFullYear() === d.year;
  };
  
  const isSelectedEnd = (d: typeof calendarDays[0]) => {
    return tempEnd && tempEnd.getDate() === d.day && tempEnd.getMonth() === d.month && tempEnd.getFullYear() === d.year;
  };
  
  const isDateInRange = (d: typeof calendarDays[0]) => {
    const currentDate = new Date(d.year, d.month, d.day);
    if (tempStart && tempEnd) {
      return currentDate > tempStart && currentDate < tempEnd;
    }
    if (tempStart && hoverDate) {
      return currentDate > tempStart && currentDate <= hoverDate;
    }
    return false;
  };

  const handleDayClick = (d: typeof calendarDays[0]) => {
    const clickedDate = new Date(d.year, d.month, d.day);
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(clickedDate);
      setTempEnd(null);
      setActivePreset("Custom");
    } else {
      if (clickedDate < tempStart) {
        setTempStart(clickedDate);
      } else {
        setTempEnd(clickedDate);
      }
      setActivePreset("Custom");
    }
  };

  return (
    <AppShell title="Teacher Dashboard">

      {hasStudents ? (
        <>
          {/* Filters Row */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", alignItems: "center" }}>
            <select className="tp-select" style={{ width: 160 }} value={selectedClass} onChange={handleClassChange}>
              <option value="Class 10 - A">Class 10 - A</option>
              <option value="Class 10 - B">Class 10 - B</option>
              <option value="Class 9 - A">Class 9 - A</option>
            </select>
            <select className="tp-select" style={{ width: 140 }} value={selectedSubject} onChange={handleSubjectChange}>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
            </select>

            {/* Custom Interactive Date Picker */}
            <div style={{ position: "relative", marginLeft: "auto", zIndex: 45 }}>
              <button 
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="tp-btn-ghost"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem", 
                  fontSize: "0.8125rem", 
                  padding: "0.5rem 0.875rem", 
                  background: "#fff", 
                  border: "1px solid var(--border)", 
                  borderRadius: 8,
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <Calendar size={14} style={{ color: "var(--primary)" }} />
                <span style={{ fontWeight: 500 }}>{formatDateRange(startDate, endDate)}</span>
              </button>
              
              {isDatePickerOpen && (
                <>
                  {/* Backdrop overlay to close the popover on outside click */}
                  <div 
                    onClick={() => {
                      setIsDatePickerOpen(false);
                      setTempStart(startDate);
                      setTempEnd(endDate);
                    }} 
                    style={{ position: "fixed", inset: 0, zIndex: 49, cursor: "default", background: "transparent" }} 
                  />
                  
                  {/* Calendar Popover */}
                  <div className="animate-scale-in" style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.5rem",
                    background: "#ffffff",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 50,
                    display: "flex",
                    width: "460px",
                    overflow: "hidden"
                  }}>
                    {/* Left Sidebar: Presets */}
                    <div style={{ 
                      width: "130px", 
                      borderRight: "1px solid var(--border)", 
                      padding: "0.75rem 0.5rem", 
                      background: "var(--surface)", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "0.25rem" 
                    }}>
                      {["Last 7 Days", "Last 30 Days", "This Month", "Last Month"].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handlePresetSelect(preset)}
                          style={{
                            textAlign: "left",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            borderRadius: "6px",
                            border: "none",
                            background: activePreset === preset ? "var(--primary-light)" : "transparent",
                            color: activePreset === preset ? "var(--primary)" : "var(--text-secondary)",
                            cursor: "pointer",
                            transition: "all 0.15s ease"
                          }}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    
                    {/* Right Pane: Calendar */}
                    <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {/* Month Navigation */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {monthNames[calMonth]} {calYear}
                        </span>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button onClick={handlePrevMonth} className="tp-btn-ghost" style={{ padding: "0.25rem", borderRadius: "50%", minWidth: "auto" }}>
                            <ChevronLeft size={14} />
                          </button>
                          <button onClick={handleNextMonth} className="tp-btn-ghost" style={{ padding: "0.25rem", borderRadius: "50%", minWidth: "auto" }}>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Days Header */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center" }}>
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                          <span key={d} style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)" }}>{d}</span>
                        ))}
                      </div>
                      
                      {/* Days Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: "2px", columnGap: "2px" }}>
                        {calendarDays.map((d, idx) => {
                          const start = isSelectedStart(d);
                          const end = isSelectedEnd(d);
                          const inRange = isDateInRange(d);
                          const isCurrent = d.isCurrentMonth;
                          
                          return (
                            <div
                              key={idx}
                              onClick={() => handleDayClick(d)}
                              onMouseEnter={() => !tempEnd && setHoverDate(new Date(d.year, d.month, d.day))}
                              style={{
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: (start || end) ? "700" : "500",
                                color: (start || end) ? "#ffffff" : isCurrent ? "var(--text-primary)" : "var(--text-muted)",
                                background: (start || end) 
                                  ? "var(--primary)" 
                                  : inRange 
                                    ? "var(--primary-light)" 
                                    : "transparent",
                                borderRadius: start 
                                  ? "6px 0 0 6px" 
                                  : end 
                                    ? "0 6px 6px 0" 
                                    : inRange 
                                      ? "0" 
                                      : "6px",
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                              title={`${monthNames[d.month]} ${d.day}, ${d.year}`}
                            >
                              {d.day}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Footer Actions */}
                      <div style={{ 
                        borderTop: "1px solid var(--border)", 
                        paddingTop: "0.75rem", 
                        marginTop: "0.5rem", 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center" 
                      }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                          {tempStart ? formatDateRange(tempStart, tempEnd || tempStart) : "Select range"}
                        </span>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button 
                            onClick={() => {
                              setIsDatePickerOpen(false);
                              setTempStart(startDate);
                              setTempEnd(endDate);
                            }}
                            className="tp-btn-ghost"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleApply}
                            disabled={!tempStart || !tempEnd}
                            className="tp-btn-primary"
                            style={{ 
                              padding: "0.3rem 0.75rem", 
                              fontSize: "0.7rem",
                              opacity: (!tempStart || !tempEnd) ? 0.5 : 1,
                              cursor: (!tempStart || !tempEnd) ? "not-allowed" : "pointer"
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dynamic Content wrapper with loading overlay */}
          <div style={{ 
            position: "relative", 
            opacity: isFiltering ? 0.6 : 1, 
            filter: isFiltering ? "blur(1.5px)" : "none", 
            transition: "all 0.25s ease" 
          }}>
            {isFiltering && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.45)",
                zIndex: 10,
                borderRadius: "12px"
              }}>
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
                <div style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  border: "4px solid var(--border)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }} />
              </div>
            )}

            {/* ── Dashboard Cards ───────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Total Students", value: totalStudents, icon: <Users size={18} color="var(--primary)" />, trend: "+2 this week" },
                { label: "Average Performance", value: avgPerformance, icon: <BarChart2 size={18} color="var(--success)" />, trend: "+1.5% vs last month" },
                { label: "Mastered Topics", value: masteredTopics, icon: <BarChart2 size={18} color="var(--warning)" />, trend: "Out of 20 active modules" },
                { label: "Students Needing Attention", value: needingAttention, icon: <Users size={18} color="var(--danger)" />, trend: "Score below 65%" },
              ].map((s, i) => (
                <div key={i} className="tp-stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s`, justifyContent: "space-between", height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="tp-stat-label">{s.label}</div>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.icon}
                    </div>
                  </div>
                  <div className="tp-stat-value" style={{ margin: "0.25rem 0" }}>{s.value}</div>
                  <div className="tp-stat-trend" style={{ fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.25rem" }}>
                    {s.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
              {/* Bar Chart: Class Performance */}
              <div className="tp-card animate-fade-in-up stagger-1">
                <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem" }}>Class Performance</div>
                <SimpleBarChart
                  data={chartData}
                  xKey="day"
                  bars={[{ key: "score", color: "var(--primary)", name: "Avg Score" }]}
                  height={200}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  <span>Class avg: {avgPerformance}</span>
                  <span style={{ color: "var(--primary)", fontWeight: 600 }}>Top 25%</span>
                </div>
              </div>

              {/* Pie Chart: Strengths & Weaknesses */}
              <div className="tp-card animate-fade-in-up stagger-2">
                <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.25rem" }}>Topic Performance Breakdown</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Class-wide skill coverage</div>
                <SkillPieChart data={TOPIC_PERFORMANCE_RADAR} height={180} />
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── Empty State ───────────────────────────────────────────── */
        <div className="tp-card animate-fade-in-up" style={{ maxWidth: 500, margin: "4rem auto", padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle size={30} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              No student records available.
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Student data will appear once assessments are completed.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
