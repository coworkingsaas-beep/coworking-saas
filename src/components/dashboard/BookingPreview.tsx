"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const dates = [26, 27, 28, 29, 30, 31, 1];
const today = 28; // simulate today

const bookings: Record<number, { time: string; member: string; space: string; type: "cabin" | "desk" | "meeting" }[]> = {
  26: [{ time: "10:00", member: "Rohit S.", space: "C1", type: "cabin" }],
  27: [
    { time: "9:00", member: "Priya P.", space: "D12", type: "desk" },
    { time: "14:00", member: "Ankit M.", space: "MR-A", type: "meeting" },
  ],
  28: [
    { time: "9:30", member: "Kavya S.", space: "D7", type: "desk" },
    { time: "11:00", member: "Raj K.", space: "MR-B", type: "meeting" },
    { time: "15:00", member: "Neha T.", space: "C3", type: "cabin" },
  ],
  29: [{ time: "13:00", member: "Arjun V.", space: "D20", type: "desk" }],
  30: [{ time: "10:00", member: "Divya N.", space: "MR-A", type: "meeting" }],
};

const typeColors = {
  cabin: { bg: "#EDE9FE", text: "#7C3AED" },
  desk: { bg: "#D1FAE5", text: "#065F46" },
  meeting: { bg: "#DBEAFE", text: "#1D4ED8" },
};

export default function BookingPreview() {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        padding: "24px",
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
          Booking Preview
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--neutral)",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={14} color="var(--text-secondary)" />
          </button>
          <button
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--neutral)",
              cursor: "pointer",
            }}
          >
            <ChevronRight size={14} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 8,
        }}
      >
        {days.map((day, i) => {
          const d = dates[i];
          const isToday = d === today;
          return (
            <div key={day} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 4 }}>
                {day}
              </div>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: isToday ? "var(--primary)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? "#fff" : "var(--text-secondary)",
                }}
              >
                {d}
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking dots */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginBottom: 20,
        }}
      >
        {dates.map((d) => {
          const count = bookings[d]?.length || 0;
          return (
            <div key={d} style={{ display: "flex", justifyContent: "center", gap: 3, minHeight: 8 }}>
              {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: d === today ? "var(--primary)" : "var(--tertiary-light)",
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Today's bookings */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Today's Bookings
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(bookings[today] || []).map((b, i) => {
            const colors = typeColors[b.type];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--neutral)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {b.member}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.time}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: colors.text,
                      background: colors.bg,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {b.space}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
