import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const appointments = [
  { time: "08:30", patient: "Ahmed Al-Farsi", type: "General Checkup", room: "Room 204", status: "completed", date: "Jun 16" },
  { time: "09:15", patient: "Maria Santos", type: "Follow-up", room: "Room 204", status: "completed", date: "Jun 16" },
  { time: "11:00", patient: "John Whitaker", type: "Emergency", room: "Room 201", status: "urgent", date: "Jun 16" },
  { time: "12:30", patient: "Carlos Rivera", type: "Follow-up", room: "Room 204", status: "pending", date: "Jun 16" },
  { time: "14:00", patient: "Fatima Al-Zahrani", type: "Checkup", room: "Room 204", status: "pending", date: "Jun 16" },
  { time: "09:00", patient: "Oliver Bennett", type: "Follow-up", room: "Room 204", status: "active", date: "Jun 17" },
  { time: "10:30", patient: "Layla Hassan", type: "Checkup", room: "Room 205", status: "active", date: "Jun 17" },
  { time: "14:30", patient: "Nour El-Din", type: "Consultation", room: "Room 204", status: "pending", date: "Jun 17" },
  { time: "09:30", patient: "Sofia Park", type: "Follow-up", room: "Room 204", status: "pending", date: "Jun 18" },
  { time: "11:00", patient: "Thomas Grey", type: "Checkup", room: "Room 201", status: "pending", date: "Jun 18" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [16, 17, 18, 19, 20, 21, 22];
const apptDates = [16, 17, 18, 19, 20];

const tabs = ["All", "Today", "This Week", "Pending", "Completed"];

const statusBadge = (s: string): "completed" | "pending" | "urgent" | "active" => {
  if (s === "completed") return "completed";
  if (s === "urgent") return "urgent";
  if (s === "active") return "active";
  return "pending";
};

export function DoctorAppointments() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = appointments.filter((a) => {
    if (activeTab === "Today") return a.date === "Jun 16";
    if (activeTab === "This Week") return true;
    if (activeTab === "Pending") return a.status === "pending";
    if (activeTab === "Completed") return a.status === "completed";
    return true;
  });

  return (
    <div>
      <PageHeader title="My Appointments" subtitle="Manage your schedule and patient appointments" />

      {/* Mini calendar */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0F172A]">June 2025</h3>
          <div className="flex gap-2">
            <button className="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8FAFC]"><ChevronLeft size={14} /></button>
            <button className="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center hover:bg-[#F8FAFC]"><ChevronRight size={14} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-[#94A3B8] py-1">{d}</div>
          ))}
          {/* Padding for start of month */}
          {Array.from({ length: 6 }).map((_, i) => <div key={`pad-${i}`} />)}
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
            <div
              key={d}
              className={`relative text-center text-sm py-1.5 rounded-lg cursor-pointer transition-colors
                ${d === 16 ? "bg-[#1E3A5F] text-white font-semibold" : "hover:bg-[#F0F4F8] text-[#0F172A]"}`}
            >
              {d}
              {apptDates.includes(d) && d !== 16 && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0EA5E9]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-5 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Date", "Time", "Patient", "Type", "Room", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.date}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{a.time}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#0EA5E9] text-xs font-semibold">
                        {a.patient.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-[#0F172A]">{a.patient}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.type}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.room}</td>
                  <td className="px-5 py-3.5"><Badge variant={statusBadge(a.status)} dot>{a.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium hover:opacity-90">Start</button>
                      <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]">Reschedule</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
