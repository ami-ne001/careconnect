import { useState } from "react";
import { Search, UserCheck } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const checkIns = [
  { time: "08:58 AM", patient: "Omar Benali", type: "General Checkup", status: "checked-in" },
  { time: "09:06 AM", patient: "Ahmed Al-Farsi", type: "Cardiology Follow-up", status: "checked-in" },
  { time: "09:14 AM", patient: "Layla Hassan", type: "Checkup", status: "checked-in" },
  { time: "09:28 AM", patient: "Carlos Rivera", type: "Consultation", status: "checked-in" },
  { time: "09:41 AM", patient: "Yasmine Tazi", type: "Follow-up", status: "waiting" },
];

const samplePatient = {
  name: "Ahmed Al-Farsi",
  id: "PAT-1042",
  photo: "AA",
  dob: "March 12, 1980",
  blood: "A+",
  appointmentTime: "10:30 AM",
  doctor: "Dr. Sarah Mitchell",
  type: "Cardiology Follow-up",
  room: "Room 204",
};

export function CheckIn() {
  const [search, setSearch] = useState("");
  const [found, setFound] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleSearch = () => {
    if (search.trim()) setFound(true);
  };

  return (
    <div>
      <PageHeader title="Patient Check-In" subtitle="Search and check in patients for their appointments" />

      {/* Search */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 className="font-semibold text-[#0F172A] mb-4">Find Patient</h3>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-4 py-2.5 flex-1">
            <Search size={18} className="text-[#64748B] shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setFound(false); setCheckedIn(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search patient by name or ID (try: Ahmed)"
              className="bg-transparent flex-1 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:opacity-90">Search</button>
        </div>
      </div>

      {/* Patient card result */}
      {found && !checkedIn && (
        <div className="bg-white rounded-xl border-2 border-[#0EA5E9] p-6 mb-6" style={{ boxShadow: "0 4px 16px rgba(14,165,233,0.15)" }}>
          <div className="flex flex-wrap items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white text-xl font-bold shrink-0">
              {samplePatient.photo}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0F172A]" style={{ fontSize: 20 }}>{samplePatient.name}</h3>
              <p className="text-sm text-[#64748B]">{samplePatient.id} · DOB: {samplePatient.dob}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-bold">{samplePatient.blood}</span>
                <Badge variant="pending" dot>Scheduled</Badge>
              </div>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-4 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">Appointment:</span>
                <span className="font-semibold text-[#0F172A]">{samplePatient.appointmentTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">Doctor:</span>
                <span className="font-medium text-[#0F172A]">{samplePatient.doctor}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">Type:</span>
                <span className="font-medium text-[#0F172A]">{samplePatient.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#64748B]">Room:</span>
                <span className="font-semibold text-[#0EA5E9]">{samplePatient.room}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCheckedIn(true)}
            className="w-full h-14 mt-5 rounded-xl bg-[#10B981] text-white font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-3"
          >
            <UserCheck size={22} />
            Check In {samplePatient.name}
          </button>
        </div>
      )}

      {checkedIn && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-3">
            <UserCheck size={28} className="text-white" />
          </div>
          <h3 className="font-bold text-[#0F172A] text-lg">Successfully Checked In!</h3>
          <p className="text-[#64748B] text-sm mt-1">{samplePatient.name} has been checked in for {samplePatient.type}</p>
          <p className="text-[#10B981] font-semibold text-sm mt-1">Room: {samplePatient.room} · Dr. Sarah Mitchell</p>
        </div>
      )}

      {/* Today's check-ins */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Today's Check-ins</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Time", "Patient", "Appointment Type", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checkIns.map((c, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{c.time}</td>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{c.patient}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{c.type}</td>
                  <td className="px-5 py-3.5"><Badge variant={c.status === "checked-in" ? "active" : "pending"} dot>{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
