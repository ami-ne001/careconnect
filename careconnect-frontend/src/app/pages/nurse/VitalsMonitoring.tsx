import { useState } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

const patients = [
  { room: "301", name: "Fatima Al-Zahrani", lastRecorded: "08:30 AM", bp: "138/90", hr: "92", temp: "37.8", o2: "95", status: "watch" },
  { room: "302", name: "Carlos Rivera", lastRecorded: "08:45 AM", bp: "124/78", hr: "74", temp: "36.9", o2: "98", status: "stable" },
  { room: "303", name: "John Whitaker", lastRecorded: "07:50 AM", bp: "158/96", hr: "102", temp: "38.2", o2: "93", status: "critical" },
  { room: "304", name: "Layla Hassan", lastRecorded: "09:00 AM", bp: "118/76", hr: "68", temp: "36.6", o2: "99", status: "stable" },
  { room: "305", name: "Omar Benali", lastRecorded: "08:15 AM", bp: "142/88", hr: "84", temp: "37.2", o2: "96", status: "watch" },
  { room: "306", name: "Yasmine Tazi", lastRecorded: "09:10 AM", bp: "110/70", hr: "70", temp: "36.7", o2: "98", status: "stable" },
  { room: "307", name: "Thomas Grey", lastRecorded: "07:40 AM", bp: "148/92", hr: "88", temp: "37.0", o2: "94", status: "watch" },
  { room: "308", name: "Maria Santos", lastRecorded: "08:55 AM", bp: "126/80", hr: "72", temp: "37.1", o2: "97", status: "stable" },
];

const borderMap: Record<string, string> = { stable: "border-emerald-200", watch: "border-amber-200", critical: "border-red-200" };
const bgMap: Record<string, string> = { stable: "bg-emerald-50", watch: "bg-amber-50", critical: "bg-red-50" };
const dotMap: Record<string, string> = { stable: "bg-emerald-500", watch: "bg-amber-500", critical: "bg-red-500" };

export function NurseVitals() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");

  const critical = patients.filter((p) => p.status === "critical" || p.o2 < "95");

  return (
    <div>
      <PageHeader
        title="Vitals Monitoring"
        subtitle="Real-time patient vitals dashboard"
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={15} />Record Vitals
          </button>
        }
      />

      {/* Alert bar */}
      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex items-center gap-3">
          <AlertTriangle size={18} className="text-[#EF4444] shrink-0" />
          <p className="text-sm text-[#EF4444] font-medium">
            <strong>{critical.length} patient{critical.length > 1 ? "s" : ""}</strong> flagged with abnormal vitals — immediate attention required:{" "}
            {critical.map((p) => `${p.name} (${p.room})`).join(", ")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {patients.map((p, i) => (
          <div key={i} className={`bg-white rounded-xl border-2 p-4 ${borderMap[p.status]}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-[#0F172A] text-sm">{p.name}</p>
                <p className="text-xs text-[#64748B]">{p.room} · Last: {p.lastRecorded}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full animate-pulse ${dotMap[p.status]}`} />
                <span className="text-xs font-semibold capitalize" style={{ color: p.status === "critical" ? "#EF4444" : p.status === "watch" ? "#F59E0B" : "#10B981" }}>{p.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { l: "BP", v: p.bp, u: "" },
                { l: "HR", v: p.hr, u: "bpm" },
                { l: "Temp", v: p.temp, u: "°C" },
                { l: "O₂", v: p.o2, u: "%" },
              ].map((v) => (
                <div key={v.l} className={`p-2 rounded-lg text-center ${p.status === "critical" ? "bg-red-50" : p.status === "watch" ? "bg-amber-50" : "bg-[#F8FAFC]"}`}>
                  <p className="text-[9px] text-[#94A3B8] uppercase font-medium">{v.l}</p>
                  <p className="text-xs font-bold text-[#0F172A] leading-tight">{v.v}</p>
                  {v.u && <p className="text-[9px] text-[#94A3B8]">{v.u}</p>}
                </div>
              ))}
            </div>
            {/* Sparkline placeholder */}
            <div className="h-8 bg-[#F0F4F8] rounded mb-3 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 120 30" className="w-full h-full" preserveAspectRatio="none">
                <polyline points="0,20 15,15 30,18 45,12 60,16 75,10 90,14 105,8 120,12" fill="none" stroke={p.status === "critical" ? "#EF4444" : p.status === "watch" ? "#F59E0B" : "#10B981"} strokeWidth="2" />
              </svg>
            </div>
            <button onClick={() => { setSelectedPatient(p.name); setShowModal(true); }} className="w-full py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:opacity-90 transition-all">
              Record New Vitals
            </button>
          </div>
        ))}
      </div>

      {/* Record Vitals Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">Record Vitals</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Patient</label>
                <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                  <option value="">Select patient...</option>
                  {patients.map((p) => <option key={p.name} value={p.name}>{p.name} — {p.room}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "BP Systolic", placeholder: "e.g. 128" },
                  { label: "BP Diastolic", placeholder: "e.g. 84" },
                  { label: "Heart Rate (bpm)", placeholder: "e.g. 78" },
                  { label: "Temperature (°C)", placeholder: "e.g. 37.1" },
                  { label: "O₂ Saturation (%)", placeholder: "e.g. 97" },
                  { label: "Weight (kg)", placeholder: "e.g. 74" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Notes</label>
                <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold">Save Vitals</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
