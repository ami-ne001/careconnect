import { Users, HeartPulse, Pill, ClipboardList, AlertTriangle, Check, X } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const patientCards = [
  { room: "Room 301", name: "Fatima Al-Zahrani", bp: "138/90", bpStatus: "watch", hr: "92", hrStatus: "watch", temp: "37.8", tempStatus: "watch", o2: "95", o2Status: "watch", type: "inpatient" },
  { room: "Room 302", name: "Carlos Rivera", bp: "124/78", bpStatus: "stable", hr: "74", hrStatus: "stable", temp: "36.9", tempStatus: "stable", o2: "98", o2Status: "stable", type: "outpatient" },
  { room: "Room 303", name: "John Whitaker", bp: "158/96", bpStatus: "critical", hr: "102", hrStatus: "critical", temp: "38.2", tempStatus: "critical", o2: "93", o2Status: "critical", type: "inpatient" },
  { room: "Room 304", name: "Layla Hassan", bp: "118/76", bpStatus: "stable", hr: "68", hrStatus: "stable", temp: "36.6", tempStatus: "stable", o2: "99", o2Status: "stable", type: "outpatient" },
  { room: "Room 305", name: "Omar Benali", bp: "142/88", bpStatus: "watch", hr: "84", hrStatus: "stable", temp: "37.2", tempStatus: "stable", o2: "96", o2Status: "stable", type: "inpatient" },
  { room: "Room 306", name: "Yasmine Tazi", bp: "110/70", bpStatus: "stable", hr: "70", hrStatus: "stable", temp: "36.7", tempStatus: "stable", o2: "98", o2Status: "stable", type: "outpatient" },
];

const medications = [
  { time: "09:00", patient: "Carlos Rivera", room: "302", med: "Metformin 500mg", route: "Oral", status: "administered" },
  { time: "10:00", patient: "Fatima Al-Zahrani", room: "301", med: "Bisoprolol 5mg", route: "Oral", status: "pending" },
  { time: "10:00", patient: "John Whitaker", room: "303", med: "Furosemide 40mg", route: "IV", status: "pending" },
  { time: "12:00", patient: "Omar Benali", room: "305", med: "Amlodipine 5mg", route: "Oral", status: "pending" },
];

const tasks = [
  { task: "Change dressing Room 302", priority: "high", patient: "Carlos Rivera", done: false },
  { task: "Monitor post-op patient Room 305", priority: "urgent", patient: "Omar Benali", done: false },
  { task: "Assist with patient transfer Room 308", priority: "normal", patient: "—", done: false },
  { task: "IV line check Room 301", priority: "urgent", patient: "Fatima Al-Zahrani", done: true },
];

const surgeryPrepTasks = [
  {
    patient: "John Whitaker",
    surgery: "CABG",
    or: "OR-2",
    time: "June 17, 06:30 AM",
    tasks: [
      { label: "Fasting confirmed", done: true },
      { label: "IV access", done: true },
      { label: "Consent signed", done: true },
      { label: "Pre-op meds", done: true },
    ],
    status: "ready",
  },
  {
    patient: "Thomas Green",
    surgery: "Knee Replacement",
    or: "OR-1",
    time: "June 18, 06:00 AM",
    tasks: [
      { label: "Fasting confirmed", done: true },
      { label: "IV access", done: false },
      { label: "Consent signed", done: true },
      { label: "Pre-op meds", done: false },
    ],
    status: "pending",
  },
];

const statusColors: Record<string, string> = {
  stable: "bg-emerald-500", watch: "bg-amber-500", critical: "bg-red-500",
};
const statusText: Record<string, string> = {
  stable: "text-emerald-700", watch: "text-amber-700", critical: "text-red-700",
};

export function NurseDashboard() {
  return (
    <div>
      <PageHeader title="Nurse Dashboard" subtitle="Patient monitoring and care tasks overview" />

      {/* Discharge Alert */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">3 patients are scheduled for discharge today</p>
          <p className="text-xs text-amber-700 mt-0.5">Carlos Rivera (Room 305) · Kevin Osei (Room 309) · Nadia Kowalski (Room 207)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Patients Assigned" value="18" subtitle="Your ward" icon={<Users size={20} className="text-[#1E3A5F]" />} iconBg="bg-blue-50" />
        <StatCard title="Vitals Due Today" value="7" subtitle="Pending rounds" icon={<HeartPulse size={20} className="text-[#EF4444]" />} iconBg="bg-red-50" />
        <StatCard title="Medications to Administer" value="12" subtitle="This shift" icon={<Pill size={20} className="text-[#0EA5E9]" />} iconBg="bg-sky-50" />
        <StatCard title="Tasks Pending" value="4" subtitle="Requires attention" icon={<ClipboardList size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
      </div>

      {/* Patient monitoring grid */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 className="font-semibold text-[#0F172A] mb-4">Patient Monitoring Grid</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {patientCards.map((p, i) => {
            const overall = p.bpStatus === "critical" || p.hrStatus === "critical" || p.tempStatus === "critical" || p.o2Status === "critical" ? "critical" : p.bpStatus === "watch" || p.hrStatus === "watch" || p.tempStatus === "watch" ? "watch" : "stable";
            return (
              <div key={i} className={`rounded-xl p-4 border-2 ${overall === "critical" ? "border-red-200 bg-red-50" : overall === "watch" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{p.name}</p>
                    <p className="text-xs text-[#64748B]">{p.room}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.type === "inpatient" ? "bg-[#1E3A5F] text-white" : "bg-slate-200 text-slate-600"}`}>
                      {p.type === "inpatient" ? "Inpatient" : "Outpatient"}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${statusColors[overall]}`} />
                      <span className={`text-xs font-semibold capitalize ${statusText[overall]}`}>{overall}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "BP", val: p.bp, unit: "mmHg", status: p.bpStatus },
                    { label: "HR", val: p.hr, unit: "bpm", status: p.hrStatus },
                    { label: "Temp", val: p.temp, unit: "°C", status: p.tempStatus },
                    { label: "O₂", val: p.o2, unit: "%", status: p.o2Status },
                  ].map((v) => (
                    <div key={v.label} className={`p-1.5 rounded-lg ${v.status === "critical" ? "bg-red-100" : v.status === "watch" ? "bg-amber-100" : "bg-white"}`}>
                      <p className="text-[10px] text-[#64748B] mb-0.5">{v.label}</p>
                      <p className="text-xs font-bold text-[#0F172A]">{v.val}</p>
                      <p className="text-[9px] text-[#94A3B8]">{v.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Medication schedule */}
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Upcoming Medications</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {medications.map((m, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-sm font-bold text-[#0F172A] w-12 shrink-0">{m.time}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0F172A]">{m.patient}</p>
                  <p className="text-xs text-[#64748B]">{m.med} · {m.route} · {m.room}</p>
                </div>
                {m.status === "administered" ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">✓ Done</span>
                ) : (
                  <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium">Administer</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Care Tasks</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {tasks.map((t, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3.5 ${t.done ? "opacity-60" : ""}`}>
                <input type="checkbox" defaultChecked={t.done} className="w-4 h-4 accent-[#10B981]" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${t.done ? "line-through text-[#94A3B8]" : "text-[#0F172A]"}`}>{t.task}</p>
                  <p className="text-xs text-[#64748B]">{t.patient}</p>
                </div>
                <Badge variant={t.priority as any}>{t.priority}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Surgery Prep Tasks */}
      <div className="mt-6 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
          <span className="text-lg">🔪</span>
          <h3 className="font-semibold text-[#0F172A]">Surgery Prep Tasks</h3>
        </div>
        <div className="p-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {surgeryPrepTasks.map((s, i) => (
            <div key={i} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-[#0F172A] text-sm">{s.patient}</p>
                  <p className="text-xs text-[#64748B]">{s.surgery} · {s.or} · {s.time}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {s.status === "ready" ? "Ready" : "Pending"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {s.tasks.map((t, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-xs">
                    {t.done ? (
                      <Check size={12} className="text-emerald-500 shrink-0" />
                    ) : (
                      <X size={12} className="text-red-400 shrink-0" />
                    )}
                    <span className={t.done ? "text-[#64748B]" : "text-[#0F172A] font-medium"}>{t.label}</span>
                  </div>
                ))}
              </div>
              {s.status === "pending" && (
                <button className="w-full h-8 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium hover:opacity-90">Complete Tasks</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}