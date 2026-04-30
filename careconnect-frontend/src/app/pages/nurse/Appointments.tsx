import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const appointments = [
  { time: "08:00", patient: "Fatima Al-Zahrani", room: "301", procedure: "ECG Monitoring", doctor: "Dr. Sarah Mitchell", nursingAction: "Prep + Assist", status: "completed" },
  { time: "09:30", patient: "John Whitaker", room: "303", procedure: "IV Furosemide Administration", doctor: "Dr. Emily Ross", nursingAction: "Administer IV", status: "completed" },
  { time: "10:00", patient: "Carlos Rivera", room: "302", procedure: "Wound Dressing Change", doctor: "Dr. Sarah Mitchell", nursingAction: "Perform Dressing", status: "active" },
  { time: "11:00", patient: "Omar Benali", room: "305", procedure: "Post-op Assessment", doctor: "Dr. Alan Park", nursingAction: "Vitals + Assessment", status: "pending" },
  { time: "12:30", patient: "Thomas Grey", room: "307", procedure: "Cardiac Monitoring", doctor: "Dr. Emily Ross", nursingAction: "Monitor + Document", status: "pending" },
  { time: "14:00", patient: "Maria Santos", room: "308", procedure: "Insulin Administration", doctor: "Dr. Sarah Mitchell", nursingAction: "Administer IM", status: "pending" },
  { time: "15:30", patient: "Layla Hassan", room: "304", procedure: "Blood Draw for CBC", doctor: "Dr. Sarah Mitchell", nursingAction: "Phlebotomy", status: "pending" },
  { time: "16:00", patient: "Yasmine Tazi", room: "306", procedure: "Discharge Assessment", doctor: "Dr. Sarah Mitchell", nursingAction: "Discharge Teaching", status: "pending" },
];

export function NurseAppointments() {
  return (
    <div>
      <PageHeader title="Nursing Appointments" subtitle="Today's patient procedures and nursing involvement" />
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Time", "Patient", "Room", "Procedure / Reason", "Doctor", "Nursing Action Required", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${a.status === "active" ? "bg-blue-50/50" : i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 font-bold text-[#0F172A]">{a.time}</td>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{a.patient}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.room}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.procedure}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{a.doctor}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{a.nursingAction}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={a.status === "completed" ? "completed" : a.status === "active" ? "active" : "pending"} dot>
                      {a.status}
                    </Badge>
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
