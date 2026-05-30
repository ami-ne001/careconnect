import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const patients = [
  { room: "301", name: "Fatima Al-Zahrani", age: 29, diagnosis: "Cardiac Arrhythmia", doctor: "Dr. Sarah Mitchell", admitted: "June 12", status: "watch" },
  { room: "302", name: "Carlos Rivera", age: 58, diagnosis: "T2DM — Post-op", doctor: "Dr. Sarah Mitchell", admitted: "June 10", status: "stable" },
  { room: "303", name: "John Whitaker", age: 71, diagnosis: "CHF Exacerbation", doctor: "Dr. Emily Ross", admitted: "June 13", status: "critical" },
  { room: "304", name: "Layla Hassan", age: 34, diagnosis: "Hypertension", doctor: "Dr. Sarah Mitchell", admitted: "June 11", status: "stable" },
  { room: "305", name: "Omar Benali", age: 49, diagnosis: "Post-op Recovery", doctor: "Dr. Alan Park", admitted: "June 14", status: "watch" },
  { room: "306", name: "Yasmine Tazi", age: 31, diagnosis: "Iron Deficiency Anemia", doctor: "Dr. Sarah Mitchell", admitted: "June 13", status: "stable" },
  { room: "307", name: "Thomas Grey", age: 67, diagnosis: "CAD — Observation", doctor: "Dr. Emily Ross", admitted: "June 9", status: "watch" },
  { room: "308", name: "Maria Santos", age: 62, diagnosis: "T2DM Management", doctor: "Dr. Sarah Mitchell", admitted: "June 14", status: "stable" },
  { room: "309", name: "Ahmed Al-Farsi", age: 45, diagnosis: "Hypertension Crisis", doctor: "Dr. Sarah Mitchell", admitted: "June 15", status: "watch" },
  { room: "310", name: "Nour El-Din", age: 38, diagnosis: "Anxiety — Observation", doctor: "Dr. Alan Park", admitted: "June 14", status: "stable" },
];

export function NursePatients() {
  return (
    <div>
      <PageHeader title="My Patients" subtitle="Assigned patients for this shift" />
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Room", "Patient", "Age", "Primary Diagnosis", "Attending Doctor", "Admitted", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${p.status === "critical" ? "bg-red-50/50" : i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 font-bold text-[#1E3A5F]">{p.room}</td>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{p.name}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{p.age}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{p.diagnosis}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{p.doctor}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{p.admitted}</td>
                  <td className="px-5 py-3.5"><Badge variant={p.status as any} dot>{p.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8]">View</button>
                      <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium hover:bg-[#0EA5E9]/20">Record Vitals</button>
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
