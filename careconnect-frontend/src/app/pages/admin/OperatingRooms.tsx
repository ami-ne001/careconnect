import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { DoorOpen } from "lucide-react";

const orData = [
  {
    name: "OR-1",
    status: "Available",
    lastSurgery: { date: "June 16, 2025, 14:30", type: "Total Knee Replacement", surgeon: "Dr. Ross" },
    nextSurgery: { date: "June 18, 2025, 07:30 AM", type: "Total Knee Replacement", surgeon: "Dr. Ross" },
    upcoming: [
      { date: "June 18, 07:30 AM", type: "Knee Replacement", surgeon: "Dr. Ross" },
      { date: "June 21, 09:00 AM", type: "Hip Replacement", surgeon: "Dr. Ross" },
    ],
    progress: null,
  },
  {
    name: "OR-2",
    status: "Occupied",
    lastSurgery: null,
    nextSurgery: null,
    upcoming: [],
    current: {
      type: "Coronary Artery Bypass Graft",
      patient: "John Whitaker",
      surgeon: "Dr. Mitchell",
      started: "08:00 AM",
      estEnd: "12:00 PM",
    },
    progress: 60,
  },
  {
    name: "OR-3",
    status: "Available",
    lastSurgery: { date: "June 15, 2025, 11:00", type: "Appendectomy", surgeon: "Dr. Mitchell" },
    nextSurgery: { date: "June 19, 2025, 10:00 AM", type: "Laparoscopic Cholecystectomy", surgeon: "Dr. Mitchell" },
    upcoming: [
      { date: "June 19, 10:00 AM", type: "Laparoscopic Cholecystectomy", surgeon: "Dr. Mitchell" },
    ],
    progress: null,
  },
  {
    name: "OR-4",
    status: "Cleaning",
    lastSurgery: { date: "June 16, 2025, 11:45", type: "C-Section", surgeon: "Dr. Chen" },
    nextSurgery: null,
    estReady: "June 16, 2025, 13:30 PM",
    upcoming: [],
    progress: null,
  },
];

// Weekly schedule data
const weekDays = ["Mon Jun 16", "Tue Jun 17", "Wed Jun 18", "Thu Jun 19", "Fri Jun 20", "Sat Jun 21", "Sun Jun 22"];
const timeSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const surgeryBlocks: { day: number; start: number; span: number; label: string; or: string; color: string }[] = [
  { day: 0, start: 2, span: 2, label: "CABG — J. Whitaker", or: "OR-2", color: "bg-[#1E3A5F] text-white" },
  { day: 1, start: 1, span: 4, label: "CABG — J. Whitaker", or: "OR-2", color: "bg-[#1E3A5F] text-white" },
  { day: 2, start: 1, span: 3, label: "Knee Repl. — T. Green", or: "OR-1", color: "bg-[#0EA5E9] text-white" },
  { day: 3, start: 4, span: 2, label: "Cholecystectomy — L. Hassan", or: "OR-3", color: "bg-[#10B981] text-white" },
  { day: 4, start: 2, span: 2, label: "Hip Repl. — O. Benali", or: "OR-1", color: "bg-[#8B5CF6] text-white" },
  { day: 5, start: 3, span: 2, label: "Hip Repl. — O. Benali", or: "OR-1", color: "bg-[#8B5CF6] text-white" },
];

export function OperatingRooms() {
  return (
    <div>
      <PageHeader
        title="Operating Rooms"
        subtitle="Real-time OR availability and scheduling · /admin/operating-rooms"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Total ORs" value="4" subtitle="Operating rooms" icon={<DoorOpen size={20} className="text-[#1E3A5F]" />} iconBg="bg-blue-50" />
        <StatCard title="Currently In Use" value="1" subtitle="Active procedures" icon={<DoorOpen size={20} className="text-[#EF4444]" />} iconBg="bg-red-50" />
        <StatCard title="Available Now" value="2" subtitle="Ready to use" icon={<DoorOpen size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
        <StatCard title="Under Cleaning" value="1" subtitle="In preparation" icon={<DoorOpen size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
      </div>

      {/* OR Cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
        {orData.map((or) => (
          <div key={or.name} className={`bg-white rounded-xl border-2 overflow-hidden ${or.status === "Occupied" ? "border-red-200" : or.status === "Cleaning" ? "border-amber-200" : "border-emerald-200"}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className={`px-5 py-3 flex items-center justify-between ${or.status === "Occupied" ? "bg-red-50" : or.status === "Cleaning" ? "bg-amber-50" : "bg-emerald-50"}`}>
              <h3 className="font-bold text-[#0F172A] text-lg">{or.name}</h3>
              <Badge variant={or.status === "Available" ? "active" : or.status === "Occupied" ? "critical" : "pending"}>
                {or.status === "Occupied" ? "In Use" : or.status}
              </Badge>
            </div>
            <div className="p-5 space-y-3">
              {or.status === "Occupied" && or.current && (
                <>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 space-y-1">
                    <p className="font-semibold text-[#0F172A] text-sm">{or.current.type}</p>
                    <p className="text-xs text-[#64748B]">Patient: {or.current.patient} · Surgeon: {or.current.surgeon}</p>
                    <p className="text-xs text-[#64748B]">Started: {or.current.started} · Est. End: {or.current.estEnd}</p>
                  </div>
                  {or.progress !== null && (
                    <div>
                      <div className="flex justify-between text-xs text-[#64748B] mb-1">
                        <span>Procedure Progress</span>
                        <span className="font-semibold text-[#F59E0B]">{or.progress}%</span>
                      </div>
                      <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-2.5 rounded-full bg-[#F59E0B]" style={{ width: `${or.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <button className="w-full h-9 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]">View Surgery</button>
                </>
              )}

              {or.status === "Available" && (
                <>
                  {or.lastSurgery && (
                    <div className="text-sm text-[#64748B]">
                      <span className="text-xs text-[#94A3B8]">Last used: </span>{or.lastSurgery.date} — {or.lastSurgery.type} ({or.lastSurgery.surgeon})
                    </div>
                  )}
                  {or.nextSurgery && (
                    <div className="bg-[#F0F9FF] rounded-xl p-3">
                      <p className="text-xs text-[#94A3B8] mb-1">Next Scheduled</p>
                      <p className="font-semibold text-[#0F172A] text-sm">{or.nextSurgery.type}</p>
                      <p className="text-xs text-[#64748B]">{or.nextSurgery.date} · {or.nextSurgery.surgeon}</p>
                    </div>
                  )}
                  {or.upcoming.length > 0 && (
                    <div className="space-y-1.5">
                      {or.upcoming.map((u, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg px-3 py-2">
                          <span className="font-medium text-[#0F172A]">{u.type}</span>
                          <span>{u.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="w-full h-9 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">Schedule Surgery</button>
                </>
              )}

              {or.status === "Cleaning" && (
                <>
                  {or.lastSurgery && (
                    <div className="text-sm text-[#64748B]">
                      <span className="text-xs text-[#94A3B8]">Last surgery ended: </span>{or.lastSurgery.date} — {or.lastSurgery.type}
                    </div>
                  )}
                  {"estReady" in or && or.estReady && (
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-xs text-[#94A3B8] mb-1">Estimated Ready</p>
                      <p className="font-semibold text-amber-700 text-sm">{or.estReady}</p>
                    </div>
                  )}
                  <button className="w-full h-9 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:opacity-90">✓ Mark as Ready</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly schedule */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Surgery Schedule — This Week</h3>
          <p className="text-xs text-[#64748B] mt-0.5">June 16–22, 2025 · Gantt view</p>
        </div>
        <div className="overflow-x-auto p-4">
          <div className="min-w-[700px]">
            {/* Header */}
            <div className="grid gap-0.5 mb-2" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
              <div />
              {weekDays.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-[#64748B] py-1">{d}</div>
              ))}
            </div>

            {/* OR rows */}
            {["OR-1", "OR-2", "OR-3", "OR-4"].map((orName) => (
              <div key={orName} className="grid gap-0.5 mb-1.5 items-stretch" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
                <div className="flex items-center justify-end pr-3">
                  <span className="text-xs font-semibold text-[#64748B]">{orName}</span>
                </div>
                {weekDays.map((_, dayIdx) => {
                  const blocks = surgeryBlocks.filter((b) => b.or === orName && b.day === dayIdx);
                  return (
                    <div key={dayIdx} className="h-10 bg-[#F8FAFC] rounded border border-[#E2E8F0] relative overflow-hidden">
                      {blocks.map((b, bi) => (
                        <div key={bi} className={`absolute inset-y-0 left-0 right-0 flex items-center px-1.5 rounded ${b.color}`}>
                          <span className="text-[9px] font-semibold truncate">{b.label}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex gap-4 mt-3 flex-wrap">
              {[
                { color: "bg-[#1E3A5F]", label: "Cardiac / CABG" },
                { color: "bg-[#0EA5E9]", label: "Orthopedics" },
                { color: "bg-[#10B981]", label: "General Surgery" },
                { color: "bg-[#8B5CF6]", label: "Scheduled (future)" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <span className={`w-3 h-3 rounded ${l.color}`} />{l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
