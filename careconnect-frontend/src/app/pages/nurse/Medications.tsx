import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const schedule = [
  { time: "08:00", patient: "Carlos Rivera", room: "302", med: "Metformin 500mg", dose: "1 tab", route: "Oral", status: "administered" },
  { time: "08:00", patient: "Layla Hassan", room: "304", med: "Lisinopril 10mg", dose: "1 tab", route: "Oral", status: "administered" },
  { time: "09:00", patient: "Fatima Al-Zahrani", room: "301", med: "Bisoprolol 5mg", dose: "1 tab", route: "Oral", status: "administered" },
  { time: "10:00", patient: "John Whitaker", room: "303", med: "Furosemide 40mg", dose: "40mg", route: "IV", status: "pending" },
  { time: "10:00", patient: "Omar Benali", room: "305", med: "Amlodipine 5mg", dose: "1 tab", route: "Oral", status: "pending" },
  { time: "11:00", patient: "Yasmine Tazi", room: "306", med: "Ferrous Sulphate 200mg", dose: "1 tab", route: "Oral", status: "pending" },
  { time: "12:00", patient: "Thomas Grey", room: "307", med: "Atorvastatin 40mg", dose: "1 tab", route: "Oral", status: "pending" },
  { time: "12:00", patient: "Carlos Rivera", room: "302", med: "Insulin Glargine 10U", dose: "10U", route: "SC", status: "pending" },
  { time: "14:00", patient: "John Whitaker", room: "303", med: "Digoxin 0.125mg", dose: "1 tab", route: "Oral", status: "pending" },
  { time: "15:00", patient: "Maria Santos", room: "308", med: "Metformin 500mg", dose: "1 tab", route: "Oral", status: "pending" },
  { time: "16:00", patient: "Fatima Al-Zahrani", room: "301", med: "Potassium Chloride", dose: "20mEq", route: "IV", status: "pending" },
  { time: "18:00", patient: "Layla Hassan", room: "304", med: "Amlodipine 5mg", dose: "1 tab", route: "Oral", status: "pending" },
  { time: "19:00", patient: "Omar Benali", room: "305", med: "Pantoprazole 40mg", dose: "1 tab", route: "Oral", status: "pending" },
  { time: "20:00", patient: "Carlos Rivera", room: "302", med: "Metformin 500mg", dose: "1 tab", route: "Oral", status: "pending" },
  { time: "20:00", patient: "John Whitaker", room: "303", med: "Furosemide 40mg", dose: "40mg", route: "IV", status: "pending" },
];

const routeColors: Record<string, string> = {
  Oral: "bg-blue-100 text-blue-700",
  IV: "bg-purple-100 text-purple-700",
  SC: "bg-green-100 text-green-700",
  IM: "bg-orange-100 text-orange-700",
};

export function NurseMedications() {
  const [filter, setFilter] = useState("All");
  const [statuses, setStatuses] = useState<Record<number, string>>({});

  const filtered = schedule.filter((m) => {
    if (filter === "Pending") return (statuses[schedule.indexOf(m)] || m.status) === "pending";
    if (filter === "Administered") return (statuses[schedule.indexOf(m)] || m.status) === "administered";
    if (filter === "Skipped") return (statuses[schedule.indexOf(m)] || m.status) === "skipped";
    return true;
  });

  const markStatus = (idx: number, val: string) => {
    setStatuses((prev) => ({ ...prev, [idx]: val }));
  };

  return (
    <div>
      <PageHeader title="Medication Schedule" subtitle="Today's medication administration schedule" />

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {["All", "Pending", "Administered", "Skipped"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-[#1E3A5F] text-white" : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"}`}>
            {f}
          </button>
        ))}
        <input placeholder="Filter by patient..." className="ml-auto h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Time", "Patient", "Room", "Medication", "Dose", "Route", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const idx = schedule.indexOf(m);
                const currentStatus = statuses[idx] || m.status;
                return (
                  <tr key={i} className={`border-b border-[#F1F5F9] ${currentStatus === "administered" ? "bg-emerald-50/40" : currentStatus === "skipped" ? "bg-red-50/40" : i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                    <td className="px-5 py-3.5 font-bold text-[#0F172A]">{m.time}</td>
                    <td className="px-5 py-3.5 font-medium text-[#0F172A]">{m.patient}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{m.room}</td>
                    <td className="px-5 py-3.5 text-[#0F172A]">{m.med}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{m.dose}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${routeColors[m.route] || "bg-gray-100 text-gray-600"}`}>{m.route}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={currentStatus === "administered" ? "active" : currentStatus === "skipped" ? "critical" : "pending"} dot>{currentStatus}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {currentStatus === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => markStatus(idx, "administered")} className="px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-medium hover:opacity-90">✓ Administer</button>
                          <button onClick={() => markStatus(idx, "skipped")} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100">Skip</button>
                        </div>
                      )}
                      {currentStatus !== "pending" && <span className="text-xs text-[#94A3B8]">Recorded</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
