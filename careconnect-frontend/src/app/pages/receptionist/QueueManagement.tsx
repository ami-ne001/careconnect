import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const initialQueue = [
  { ticket: "T-042", name: "Omar Benali", checkin: "08:58 AM", wait: "5 min", type: "General Checkup", doctor: "Dr. Mitchell", status: "serving" },
  { ticket: "T-043", name: "Yasmine Tazi", checkin: "09:08 AM", wait: "12 min", type: "Follow-up", doctor: "Dr. Park", status: "waiting" },
  { ticket: "T-044", name: "Carlos Rivera", checkin: "09:15 AM", wait: "20 min", type: "Consultation", doctor: "Dr. Mitchell", status: "waiting" },
  { ticket: "T-045", name: "Sarah Kim", checkin: "09:22 AM", wait: "28 min", type: "Lab Review", doctor: "Dr. Ross", status: "waiting" },
  { ticket: "T-046", name: "Luca Bianchi", checkin: "09:30 AM", wait: "35 min", type: "Checkup", doctor: "Dr. Chen", status: "waiting" },
  { ticket: "T-047", name: "Priya Sharma", checkin: "09:40 AM", wait: "40 min", type: "Follow-up", doctor: "Dr. Mitchell", status: "waiting" },
];

export function QueueManagement() {
  const [queue, setQueue] = useState(initialQueue);

  const callNext = () => {
    setQueue((prev) => {
      const next = prev.find((p) => p.status === "waiting");
      if (!next) return prev;
      return prev.map((p) => {
        if (p.status === "serving") return { ...p, status: "completed" };
        if (p.ticket === next.ticket) return { ...p, status: "serving" };
        return p;
      });
    });
  };

  const serving = queue.find((q) => q.status === "serving");
  const waiting = queue.filter((q) => q.status === "waiting");
  const served = queue.filter((q) => q.status === "completed").length;

  return (
    <div>
      <PageHeader title="Queue Management" subtitle="Manage patient flow and waiting queue" />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-6">
        {[
          { label: "Avg Wait Time", val: "14 min", color: "text-[#0EA5E9]" },
          { label: "Total Served Today", val: served + 18, color: "text-[#10B981]" },
          { label: "Currently Waiting", val: waiting.length, color: "text-[#F59E0B]" },
          { label: "No Shows", val: 2, color: "text-[#EF4444]" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-[#E2E8F0] text-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <p className="text-xs uppercase tracking-wider text-[#64748B] font-semibold mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Now Serving */}
        <div className="bg-[#1E3A5F] rounded-xl p-6 text-white" style={{ boxShadow: "0 4px 16px rgba(30,58,95,0.3)" }}>
          <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-4">Now Serving</p>
          {serving ? (
            <>
              <div className="text-center mb-5">
                <div className="text-5xl font-black text-[#0EA5E9] mb-2">{serving.ticket}</div>
                <p className="text-xl font-bold text-white">{serving.name}</p>
                <p className="text-white/60 text-sm mt-1">{serving.type}</p>
                <p className="text-white/50 text-xs">{serving.doctor}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-white/60 text-xs">Check-in</p>
                  <p className="text-white font-semibold text-sm">{serving.checkin}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-white/60 text-xs">Wait Time</p>
                  <p className="text-white font-semibold text-sm">{serving.wait}</p>
                </div>
              </div>
              <button onClick={callNext} className="w-full h-11 rounded-xl bg-[#0EA5E9] text-white font-semibold text-sm hover:opacity-90 transition-all">
                📢 Call Next Patient
              </button>
            </>
          ) : (
            <p className="text-white/50 text-center py-8">Queue is empty</p>
          )}
        </div>

        {/* Waiting Queue */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="font-semibold text-[#0F172A]">Waiting Queue ({waiting.length})</h3>
            <p className="text-xs text-[#64748B]">Drag to reorder</p>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {waiting.map((q, i) => (
              <div key={q.ticket} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] cursor-grab">
                <span className="text-[#94A3B8] text-sm">⠿</span>
                <div className="w-10 h-10 rounded-full bg-[#F0F4F8] flex items-center justify-center text-sm font-bold text-[#1E3A5F] shrink-0">
                  {i + 2}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#0F172A] text-sm">{q.name}</p>
                  <p className="text-xs text-[#64748B]">{q.type} · {q.doctor} · Check-in: {q.checkin}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#F59E0B]">⏱ {q.wait}</p>
                  <p className="text-[10px] text-[#94A3B8]">{q.ticket}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={callNext} className="px-2.5 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium">Call</button>
                  <button className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#EF4444] hover:bg-red-50">No Show</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
