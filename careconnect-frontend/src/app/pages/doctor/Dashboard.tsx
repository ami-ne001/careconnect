import { Calendar, Users, FlaskConical, Stethoscope, Clock, ChevronRight, Bed } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router";

const schedule = [
  { time: "08:30", patient: "Ahmed Al-Farsi", type: "Checkup", room: "Room 204", status: "completed" },
  { time: "09:15", patient: "Maria Santos", type: "Follow-up", room: "Room 204", status: "completed" },
  { time: "10:00", patient: "Layla Hassan", type: "Checkup", room: "Room 204", status: "completed" },
  { time: "11:00", patient: "John Whitaker", type: "Emergency", room: "Room 201", status: "active" },
  { time: "12:30", patient: "Carlos Rivera", type: "Follow-up", room: "Room 204", status: "pending" },
  { time: "14:00", patient: "Fatima Al-Zahrani", type: "Checkup", room: "Room 204", status: "pending" },
  { time: "15:00", patient: "Oliver Bennett", type: "Follow-up", room: "Room 204", status: "pending" },
  { time: "16:30", patient: "Nour El-Din", type: "Checkup", room: "Room 204", status: "pending" },
];

const pendingLabs = [
  { patient: "John Whitaker", test: "Lipid Panel", ordered: "June 13" },
  { patient: "Maria Santos", test: "Complete Blood Count", ordered: "June 14" },
  { patient: "Carlos Rivera", test: "HbA1c", ordered: "June 14" },
  { patient: "Layla Hassan", test: "Thyroid Panel", ordered: "June 12" },
  { patient: "Ahmed Al-Farsi", test: "Renal Function", ordered: "June 10" },
];

const recentConsultations = [
  { patient: "Ahmed Al-Farsi", diagnosis: "Essential Hypertension", date: "June 14", status: "completed" },
  { patient: "Maria Santos", diagnosis: "Type 2 Diabetes — Follow-up", date: "June 13", status: "completed" },
  { patient: "Layla Hassan", diagnosis: "Hypertension — Medication Review", date: "June 12", status: "completed" },
  { patient: "Carlos Rivera", diagnosis: "T2DM — Insulin Adjustment", date: "June 10", status: "completed" },
  { patient: "Oliver Bennett", diagnosis: "Chronic Back Pain Assessment", date: "June 9", status: "completed" },
];

const typeColor: Record<string, "active" | "pending" | "critical"> = {
  Checkup: "active", "Follow-up": "pending", Emergency: "critical",
};

const admittedPatients = [
  { name: "Fatima Al-Zahrani", initials: "FA", room: "Room 301", ward: "Cardiology Ward", admitDate: "June 13", day: 4, bp: "138/88", hr: "84", border: "" },
  { name: "John Whitaker", initials: "JW", room: "Room 501", ward: "CCU", admitDate: "June 16", day: 1, bp: "152/94", hr: "98", border: "border-red-300" },
  { name: "Maria Santos", initials: "MS", room: "Room 208", ward: "Endocrinology", admitDate: "June 15", day: 2, bp: "130/84", hr: "76", border: "" },
  { name: "Kevin Osei", initials: "KO", room: "Room 309", ward: "Cardiology Ward", admitDate: "June 11", day: 6, bp: "124/80", hr: "72", border: "border-amber-300" },
];

const upcomingSurgeries = [
  { type: "CABG", patient: "John Whitaker", date: "June 17, 08:00 AM", or: "OR-2", status: "Pre-Op Prep", statusVariant: "pending" as const },
  { type: "Knee Replacement", patient: "Thomas Green", date: "June 18, 07:30 AM", or: "OR-1", status: "Scheduled", statusVariant: "info" as const },
  { type: "Laparoscopic Cholecystectomy", patient: "Layla Hassan", date: "June 19, 10:00 AM", or: "OR-3", status: "Scheduled", statusVariant: "info" as const },
];

export function DoctorDashboard() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0EA5E9] rounded-xl p-5 mb-6 text-white">
        <p className="text-white/70 text-sm mb-1">Good morning</p>
        <h2 className="font-bold text-xl">Dr. Sarah Mitchell 👋</h2>
        <p className="text-white/60 text-sm mt-0.5">Monday, June 16, 2025 · Cardiology</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Today's Appointments" value="8" subtitle="Next in 20 min" icon={<Calendar size={20} className="text-[#0EA5E9]" />} iconBg="bg-sky-50" />
        <StatCard title="Pending Consultations" value="3" subtitle="Awaiting review" icon={<Stethoscope size={20} className="text-[#8B5CF6]" />} iconBg="bg-purple-50" />
        <StatCard title="Lab Results Pending" value="5" subtitle="Awaiting review" icon={<FlaskConical size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
        <StatCard title="Active Patients" value="42" subtitle="Under your care" icon={<Users size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-7">
        {[
          { label: "Start Consultation", path: "/doctor/consultations" },
          { label: "Request Lab Test", path: "/doctor/lab-requests" },
          { label: "Write Prescription", path: "/doctor/prescriptions" },
          { label: "View Patient Records", path: "/doctor/medical-records" },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.path)} className="px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#0EA5E9] transition-all">
            {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Today's schedule */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="font-semibold text-[#0F172A]">Today's Schedule</h3>
            <button onClick={() => navigate("/doctor/appointments")} className="text-xs text-[#0EA5E9] font-medium hover:underline flex items-center gap-1">View All <ChevronRight size={12} /></button>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {schedule.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${s.status === "active" ? "bg-blue-50" : ""}`}>
                <div className="text-center shrink-0 w-12">
                  <p className="text-sm font-bold text-[#0F172A]">{s.time}</p>
                </div>
                <div className={`w-1 h-8 rounded-full shrink-0 ${s.status === "active" ? "bg-[#0EA5E9]" : s.status === "completed" ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0F172A]">{s.patient}</p>
                  <p className="text-xs text-[#64748B]">{s.room}</p>
                </div>
                <Badge variant={typeColor[s.type] || "pending"}>{s.type}</Badge>
                {s.status === "active" && (
                  <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium">Start</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending lab results */}
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Pending Lab Results</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {pendingLabs.map((l, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{l.patient}</p>
                  <p className="text-xs text-[#64748B]">{l.test} · {l.ordered}</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium hover:bg-[#0EA5E9]/20">Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Consultations */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Recent Consultations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Patient", "Diagnosis", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentConsultations.map((c, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{c.patient}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{c.diagnosis}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{c.date}</td>
                  <td className="px-5 py-3.5"><Badge variant="completed">{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Admitted Patients */}
      <div className="mt-6 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed size={18} className="text-[#1E3A5F]" />
            <h3 className="font-semibold text-[#0F172A]">My Admitted Patients</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#1E3A5F] text-white text-xs font-bold">4</span>
          </div>
          <button onClick={() => navigate("/receptionist/admissions")} className="text-xs text-[#0EA5E9] font-medium hover:underline flex items-center gap-1">View All <ChevronRight size={12} /></button>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {admittedPatients.map((p, i) => (
              <div key={i} className={`w-56 shrink-0 rounded-xl border-2 p-4 bg-white ${p.border || "border-[#E2E8F0]"}`} style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold shrink-0">{p.initials}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F172A] text-sm truncate">{p.name}</p>
                    <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E3A5F] text-[10px] font-bold">{p.room}</span>
                  </div>
                </div>
                <p className="text-xs text-[#64748B] mb-0.5">{p.ward}</p>
                <p className="text-xs text-[#64748B] mb-1">Admitted {p.admitDate}</p>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold mb-2">
                  Day {p.day}
                </div>
                <div className="grid grid-cols-2 gap-1 mb-3">
                  <div className="bg-[#F8FAFC] rounded-lg p-1.5 text-center">
                    <p className="text-[9px] text-[#94A3B8]">BP</p>
                    <p className="text-xs font-bold text-[#0F172A]">{p.bp}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-1.5 text-center">
                    <p className="text-[9px] text-[#94A3B8]">HR</p>
                    <p className="text-xs font-bold text-[#0F172A]">{p.hr}</p>
                  </div>
                </div>
                <button className="w-full h-7 rounded-lg bg-[#1E3A5F] text-white text-[10px] font-semibold hover:opacity-90">View Patient</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Surgeries */}
      <div className="mt-6 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔪</span>
            <h3 className="font-semibold text-[#0F172A]">Upcoming Surgeries</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#0EA5E9] text-white text-xs font-bold">3</span>
          </div>
          <button onClick={() => navigate("/doctor/surgeries")} className="text-xs text-[#0EA5E9] font-medium hover:underline flex items-center gap-1">View All Surgeries <ChevronRight size={12} /></button>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {upcomingSurgeries.map((s, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#0F172A] text-sm truncate">{s.type}</p>
                <p className="text-xs text-[#64748B]">{s.patient} · {s.date}</p>
              </div>
              <span className="text-xs text-[#64748B] font-medium shrink-0">{s.or}</span>
              <Badge variant={s.statusVariant}>{s.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}