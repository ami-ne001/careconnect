import { useState } from "react";
import { Plus, X, Calendar, MapPin } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const upcoming = [
  { doctor: "Dr. Sarah Mitchell", initials: "SM", specialty: "Cardiology", date: "June 18, 2025", time: "10:30 AM", type: "Follow-up", room: "Room 204", status: "active" },
  { doctor: "Dr. Alan Park", initials: "AP", specialty: "Neurology", date: "June 25, 2025", time: "09:00 AM", type: "Consultation", room: "Room 112", status: "pending" },
  { doctor: "Dr. Sarah Mitchell", initials: "SM", specialty: "Cardiology", date: "July 8, 2025", time: "11:00 AM", type: "Checkup", room: "Room 204", status: "pending" },
];

const past = [
  { date: "June 10, 2025", doctor: "Dr. Sarah Mitchell", specialty: "Cardiology", type: "Follow-up", notes: "Available", receipt: "Available" },
  { date: "May 28, 2025", doctor: "Dr. Sarah Mitchell", specialty: "Cardiology", type: "Consultation", notes: "Available", receipt: "Available" },
  { date: "Apr 15, 2025", doctor: "Dr. Sarah Mitchell", specialty: "Cardiology", type: "Checkup", notes: "Available", receipt: "Available" },
  { date: "Mar 5, 2025", doctor: "Dr. Alan Park", specialty: "Neurology", type: "Consultation", notes: "Available", receipt: "Available" },
  { date: "Feb 12, 2025", doctor: "Dr. Sarah Mitchell", specialty: "Cardiology", type: "Follow-up", notes: "Available", receipt: "Available" },
];

const steps = ["Choose Specialty", "Choose Doctor", "Choose Date", "Choose Time", "Confirm"];

export function PatientAppointments() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [showBook, setShowBook] = useState(false);
  const [step, setStep] = useState(0);

  return (
    <div>
      <PageHeader
        title="My Appointments"
        subtitle="View and manage your appointments"
        actions={
          <button onClick={() => { setShowBook(true); setStep(0); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={15} />Book New Appointment
          </button>
        }
      />

      <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-5 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {["Upcoming", "Past"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"}`}>{t}</button>
        ))}
      </div>

      {activeTab === "Upcoming" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {upcoming.map((a, i) => (
            <div key={i} className={`bg-white rounded-xl border-2 p-5 ${a.status === "active" ? "border-[#0EA5E9]" : "border-[#E2E8F0]"}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white font-bold">{a.initials}</div>
                  <div>
                    <p className="font-bold text-[#0F172A]">{a.doctor}</p>
                    <p className="text-xs text-[#64748B]">{a.specialty}</p>
                  </div>
                </div>
                <Badge variant={a.status === "active" ? "active" : "pending"}>{a.status === "active" ? "Confirmed" : "Scheduled"}</Badge>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Calendar size={14} className="text-[#0EA5E9]" />
                  <span className="font-medium text-[#0F172A]">{a.date}</span>
                  <span>at</span>
                  <span className="font-bold text-[#0EA5E9]">{a.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <MapPin size={14} className="text-[#0EA5E9]" />
                  <span>{a.room}</span>
                  <span>·</span>
                  <span>{a.type}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 h-9 rounded-xl border border-[#E2E8F0] text-sm text-[#64748B] font-medium hover:bg-[#F8FAFC]">Reschedule</button>
                <button className="flex-1 h-9 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Past" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Date", "Doctor", "Specialty", "Visit Type", "Notes", "Receipt"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {past.map((p, i) => (
                  <tr key={i} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                    <td className="px-5 py-3.5 text-[#64748B]">{p.date}</td>
                    <td className="px-5 py-3.5 font-medium text-[#0F172A]">{p.doctor}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{p.specialty}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{p.type}</td>
                    <td className="px-5 py-3.5"><button className="text-[#0EA5E9] text-xs font-medium hover:underline">View Notes</button></td>
                    <td className="px-5 py-3.5"><button className="text-[#0EA5E9] text-xs font-medium hover:underline">Download</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Modal */}
      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0F172A]">Book Appointment</h3>
                <p className="text-xs text-[#64748B]">Step {step + 1} of {steps.length}: {steps[step]}</p>
              </div>
              <button onClick={() => setShowBook(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="flex gap-1 mb-5">
              {steps.map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? "bg-[#0EA5E9]" : "bg-[#E2E8F0]"}`} />
              ))}
            </div>
            <div className="min-h-[200px] flex flex-col justify-between">
              <div>
                {step === 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Emergency", "General"].map((s) => (
                      <button key={s} onClick={() => setStep(1)} className="p-4 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#0F172A] hover:border-[#0EA5E9] hover:bg-[#EFF6FF] transition-all text-center">{s}</button>
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <div className="space-y-3">
                    {["Dr. Sarah Mitchell — Cardiology", "Dr. Emily Ross — Cardiology", "Dr. Alan Park — Neurology"].map((d) => (
                      <button key={d} onClick={() => setStep(2)} className="w-full p-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] hover:border-[#0EA5E9] hover:bg-[#EFF6FF] text-left transition-all">{d}</button>
                    ))}
                  </div>
                )}
                {step === 2 && <input type="date" defaultValue="2025-06-18" className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />}
                {step === 3 && (
                  <div className="grid grid-cols-3 gap-2">
                    {["09:00", "09:30", "10:00", "11:00", "14:00", "15:30"].map((t) => (
                      <button key={t} onClick={() => setStep(4)} className="p-3 rounded-xl border border-[#E2E8F0] text-sm font-medium hover:border-[#0EA5E9] hover:bg-[#EFF6FF] transition-all">{t}</button>
                    ))}
                  </div>
                )}
                {step === 4 && (
                  <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2 text-sm">
                    {[["Doctor", "Dr. Sarah Mitchell"], ["Specialty", "Cardiology"], ["Date", "June 18, 2025"], ["Time", "10:00 AM"], ["Type", "Consultation"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span className="text-[#64748B]">{k}</span><span className="font-medium text-[#0F172A]">{v}</span></div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-5">
                {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">← Back</button>}
                {step === 4 && <button onClick={() => setShowBook(false)} className="flex-1 h-10 rounded-lg bg-[#10B981] text-white text-sm font-semibold">✓ Confirm Booking</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
