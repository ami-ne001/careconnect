import { useState } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const appointments = [
  { time: "08:30", patient: "Ahmed Al-Farsi", doctor: "Dr. Mitchell", dept: "Cardiology", type: "Checkup", room: "204", status: "completed" },
  { time: "09:15", patient: "Maria Santos", doctor: "Dr. Mitchell", dept: "Cardiology", type: "Follow-up", room: "204", status: "completed" },
  { time: "10:00", patient: "Layla Hassan", doctor: "Dr. Mitchell", dept: "Cardiology", type: "Checkup", room: "204", status: "active" },
  { time: "10:30", patient: "Omar Benali", doctor: "Dr. Park", dept: "Neurology", type: "Consultation", room: "112", status: "active" },
  { time: "11:00", patient: "John Whitaker", doctor: "Dr. Ross", dept: "Cardiology", type: "Emergency", room: "201", status: "urgent" },
  { time: "11:30", patient: "Carlos Rivera", doctor: "Dr. Mitchell", dept: "Cardiology", type: "Follow-up", room: "204", status: "pending" },
  { time: "12:00", patient: "Fatima Al-Zahrani", doctor: "Dr. Ross", dept: "Cardiology", type: "Checkup", room: "205", status: "pending" },
  { time: "13:00", patient: "Thomas Grey", doctor: "Dr. Ross", dept: "Cardiology", type: "Consultation", room: "205", status: "pending" },
  { time: "14:00", patient: "Yasmine Tazi", doctor: "Dr. Park", dept: "Neurology", type: "Follow-up", room: "112", status: "pending" },
  { time: "14:30", patient: "Sofia Park", doctor: "Dr. Chen", dept: "Pediatrics", type: "Checkup", room: "308", status: "pending" },
  { time: "15:00", patient: "Luca Bianchi", doctor: "Dr. Mitchell", dept: "Cardiology", type: "Checkup", room: "204", status: "pending" },
  { time: "15:30", patient: "Nour El-Din", doctor: "Dr. Park", dept: "Neurology", type: "Follow-up", room: "112", status: "pending" },
  { time: "16:00", patient: "Priya Sharma", doctor: "Dr. Mitchell", dept: "Cardiology", type: "Consultation", room: "204", status: "pending" },
  { time: "16:30", patient: "Oliver Bennett", doctor: "Dr. Lane", dept: "Orthopedics", type: "Follow-up", room: "215", status: "pending" },
  { time: "17:00", patient: "Chen Wei", doctor: "Dr. Chen", dept: "Pediatrics", type: "Checkup", room: "308", status: "pending" },
];

const days = ["Mon 16", "Tue 17", "Wed 18", "Thu 19", "Fri 20", "Sat 21", "Sun 22"];
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

type ModalStep = 1 | 2;

export function ReceptionistAppointments() {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<ModalStep>(1);
  const [selectedSlot, setSelectedSlot] = useState("");

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="View and manage all appointments"
        actions={
          <button onClick={() => { setShowModal(true); setStep(1); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={15} />New Appointment
          </button>
        }
      />

      {/* Week calendar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] mb-6 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="font-semibold text-[#0F172A]">Week of June 16–22, 2025</h3>
          <div className="flex gap-2">
            <button className="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center"><ChevronLeft size={14} /></button>
            <button className="w-7 h-7 rounded-lg border border-[#E2E8F0] flex items-center justify-center"><ChevronRight size={14} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-8 border-b border-[#E2E8F0]">
              <div className="p-3 text-xs text-[#94A3B8]">Time</div>
              {days.map((d) => (
                <div key={d} className={`p-3 text-center text-xs font-semibold border-l border-[#E2E8F0] ${d.startsWith("Mon") ? "bg-[#EFF6FF] text-[#0EA5E9]" : "text-[#64748B]"}`}>{d}</div>
              ))}
            </div>
            {hours.map((h) => (
              <div key={h} className="grid grid-cols-8 border-b border-[#F1F5F9] min-h-[44px]">
                <div className="p-2.5 text-xs text-[#94A3B8] border-r border-[#F1F5F9]">{h}</div>
                {days.map((d, di) => {
                  const hasAppt = appointments.some((a) => a.time.startsWith(h.slice(0, 2)));
                  const isToday = di === 0;
                  return (
                    <div key={d} className={`border-l border-[#F1F5F9] p-1 ${isToday ? "bg-[#EFF6FF]/30" : ""}`}>
                      {hasAppt && isToday && (
                        <div className="bg-[#0EA5E9] text-white text-[10px] rounded p-1 leading-tight truncate">
                          {appointments.find((a) => a.time.startsWith(h.slice(0, 2)))?.patient.split(" ")[0]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap gap-3 items-center">
          <h3 className="font-semibold text-[#0F172A]">All Appointments — June 16</h3>
          <div className="flex gap-2 ml-auto">
            {["All Doctors", "Dr. Mitchell", "Dr. Park", "Dr. Ross"].map((d) => (
              <button key={d} className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]">{d}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Time", "Patient", "Doctor", "Department", "Type", "Room", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 font-bold text-[#0F172A]">{a.time}</td>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{a.patient}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.doctor}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.dept}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.type}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.room}</td>
                  <td className="px-5 py-3.5"><Badge variant={a.status === "completed" ? "completed" : a.status === "urgent" ? "urgent" : a.status === "active" ? "active" : "pending"} dot>{a.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8]">Reschedule</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-[#0F172A]">New Appointment</h3>
                <p className="text-xs text-[#64748B]">Step {step} of 2</p>
              </div>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="flex gap-2 mb-5">
              {[1, 2].map((s) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-[#0EA5E9]" : "bg-[#E2E8F0]"}`} />
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Patient</label>
                  <input placeholder="Search existing patient or enter new..." className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Appointment Type</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                    <option>General Checkup</option>
                    <option>Follow-up</option>
                    <option>Consultation</option>
                    <option>Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Preferred Doctor</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                    <option>Dr. Sarah Mitchell — Cardiology</option>
                    <option>Dr. Alan Park — Neurology</option>
                    <option>Dr. Emily Ross — Cardiology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Preferred Date</label>
                  <input type="date" defaultValue="2025-06-17" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                  <button onClick={() => setStep(2)} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold">Next →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-[#64748B] font-medium">Select Available Time Slot — June 17</p>
                <div className="grid grid-cols-2 gap-2">
                  {["09:00", "09:30", "10:30", "11:00", "14:00", "14:30", "15:30", "16:00"].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${selectedSlot === slot ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]" : "border-[#E2E8F0] text-[#64748B] hover:border-[#0EA5E9]/50"}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-[#64748B] cursor-pointer">
                  <input type="checkbox" className="accent-[#0EA5E9]" />
                  Send confirmation notification to patient
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">← Back</button>
                  <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold">Confirm Booking</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
