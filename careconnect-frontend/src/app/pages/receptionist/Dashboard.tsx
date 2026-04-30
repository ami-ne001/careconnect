import { Calendar, UserCheck, Clock, CreditCard, Plus, Bed, LayoutGrid } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router";

const queue = [
  { num: 1, patient: "Omar Benali", wait: "5 min", type: "General Checkup", doctor: "Dr. Mitchell", status: "called" },
  { num: 2, patient: "Yasmine Tazi", wait: "12 min", type: "Follow-up", doctor: "Dr. Park", status: "waiting" },
  { num: 3, patient: "Carlos Rivera", wait: "20 min", type: "Consultation", doctor: "Dr. Mitchell", status: "waiting" },
  { num: 4, patient: "Sarah Kim", wait: "28 min", type: "Lab Results Review", doctor: "Dr. Ross", status: "waiting" },
  { num: 5, patient: "Luca Bianchi", wait: "35 min", type: "Checkup", doctor: "Dr. Chen", status: "waiting" },
  { num: 6, patient: "Priya Sharma", wait: "40 min", type: "Follow-up", doctor: "Dr. Mitchell", status: "waiting" },
];

const todaySchedule = [
  { time: "08:30", patient: "Ahmed Al-Farsi", type: "Checkup" },
  { time: "09:15", patient: "Maria Santos", type: "Follow-up" },
  { time: "10:00", patient: "Layla Hassan", type: "Consultation" },
  { time: "11:00", patient: "John Whitaker", type: "Emergency" },
  { time: "12:30", patient: "Carlos Rivera", type: "Follow-up" },
  { time: "14:00", patient: "Fatima Al-Zahrani", type: "Checkup" },
];

const todayDischarges = [
  { room: "Room 305", patient: "Carlos Rivera", time: "10:00 AM" },
  { room: "Room 309", patient: "Kevin Osei", time: "11:30 AM" },
  { room: "Room 207", patient: "Nadia Kowalski", time: "02:00 PM" },
];

const queueStatusBadge = (s: string): "active" | "pending" => s === "called" ? "active" : "pending";

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="Receptionist Dashboard" subtitle="Front desk operations overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Today's Appointments" value="24" subtitle="Total scheduled" icon={<Calendar size={20} className="text-[#0EA5E9]" />} iconBg="bg-sky-50" />
        <StatCard title="Checked In" value="11" subtitle="Arrived today" icon={<UserCheck size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
        <StatCard title="Queue Length" value="6" subtitle="Currently waiting" icon={<Clock size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
        <StatCard title="Pending Payments" value="$3,420" subtitle="Outstanding" icon={<CreditCard size={20} className="text-[#EF4444]" />} iconBg="bg-red-50" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-7">
        {[
          { label: "+ Schedule Appointment", path: "/receptionist/appointments", bg: "bg-[#1E3A5F] text-white" },
          { label: "+ Register New Patient", path: "/receptionist/patient-registration", bg: "bg-white border border-[#E2E8F0] text-[#0F172A]" },
          { label: "Process Payment", path: "/receptionist/billing", bg: "bg-white border border-[#E2E8F0] text-[#0F172A]" },
          { label: "Queue Management", path: "/receptionist/queue-management", bg: "bg-white border border-[#E2E8F0] text-[#0F172A]" },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.path)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-all ${a.bg}`}>
            {a.label}
          </button>
        ))}
        <button onClick={() => navigate("/receptionist/admissions")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#1E3A5F] text-white hover:opacity-90 transition-all">
          <Bed size={14} />Admit Patient
        </button>
        <button onClick={() => navigate("/receptionist/rooms")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#0EA5E9] text-white hover:opacity-90 transition-all">
          <LayoutGrid size={14} />Room Board
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live queue board */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="font-semibold text-[#0F172A]">Live Queue Board</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs text-[#10B981] font-medium">Live</span>
            </div>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {queue.map((q) => (
              <div key={q.num} className={`flex items-center gap-4 px-5 py-3.5 ${q.status === "called" ? "bg-blue-50" : ""}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${q.status === "called" ? "bg-[#0EA5E9] text-white" : "bg-[#F0F4F8] text-[#64748B]"}`}>
                  #{q.num}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#0F172A] text-sm">{q.patient}</p>
                  <p className="text-xs text-[#64748B]">{q.type} · {q.doctor}</p>
                </div>
                <span className="text-xs text-[#64748B]">⏱ {q.wait}</span>
                <Badge variant={queueStatusBadge(q.status)} dot>{q.status}</Badge>
                {q.status === "called" ? (
                  <button className="px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-medium">Check In</button>
                ) : (
                  <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]">Call</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Today's schedule */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Today's Schedule</h3>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {todaySchedule.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-sm font-bold text-[#0F172A] w-10 shrink-0">{s.time}</span>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{s.patient}</p>
                    <p className="text-xs text-[#64748B]">{s.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Discharges */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
              <Bed size={16} className="text-[#F59E0B]" />
              <h3 className="font-semibold text-[#0F172A]">Today's Discharges</h3>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {todayDischarges.map((d, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0F172A]">{d.patient}</p>
                    <p className="text-xs text-[#64748B]">{d.room} · {d.time}</p>
                  </div>
                  <button onClick={() => navigate("/receptionist/admissions")} className="px-3 py-1.5 rounded-lg bg-[#F59E0B] text-white text-xs font-medium hover:opacity-90">Process</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}