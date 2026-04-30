import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router";

const patients = [
  { id: 1, name: "Layla Hassan", age: 34, gender: "F", blood: "B+", diagnosis: "Hypertension", lastVisit: "June 10, 2025", status: "active" },
  { id: 2, name: "Carlos Rivera", age: 58, gender: "M", blood: "O-", diagnosis: "Type 2 Diabetes", lastVisit: "June 12, 2025", status: "active" },
  { id: 3, name: "Ahmed Al-Farsi", age: 45, gender: "M", blood: "A+", diagnosis: "Essential Hypertension", lastVisit: "June 14, 2025", status: "active" },
  { id: 4, name: "Maria Santos", age: 62, gender: "F", blood: "AB+", diagnosis: "Type 2 Diabetes — Follow-up", lastVisit: "June 13, 2025", status: "active" },
  { id: 5, name: "John Whitaker", age: 71, gender: "M", blood: "O+", diagnosis: "Hyperlipidemia", lastVisit: "June 13, 2025", status: "critical" },
  { id: 6, name: "Fatima Al-Zahrani", age: 29, gender: "F", blood: "A-", diagnosis: "Cardiac Arrhythmia", lastVisit: "June 11, 2025", status: "active" },
  { id: 7, name: "Oliver Bennett", age: 52, gender: "M", blood: "B-", diagnosis: "Chronic Back Pain", lastVisit: "June 9, 2025", status: "active" },
  { id: 8, name: "Nour El-Din", age: 38, gender: "F", blood: "O+", diagnosis: "Anxiety Disorder", lastVisit: "May 30, 2025", status: "active" },
  { id: 9, name: "Sofia Park", age: 44, gender: "F", blood: "A+", diagnosis: "Hypothyroidism", lastVisit: "June 7, 2025", status: "active" },
  { id: 10, name: "Thomas Grey", age: 67, gender: "M", blood: "B+", diagnosis: "Coronary Artery Disease", lastVisit: "June 5, 2025", status: "watch" },
  { id: 11, name: "Yasmine Tazi", age: 31, gender: "F", blood: "O-", diagnosis: "Iron Deficiency Anemia", lastVisit: "June 3, 2025", status: "active" },
  { id: 12, name: "Omar Benali", age: 49, gender: "M", blood: "AB-", diagnosis: "Hypertension + T2DM", lastVisit: "June 1, 2025", status: "watch" },
];

export function DoctorPatients() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Patients" subtitle="Your assigned patient list" />

      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] mb-5 flex gap-3 items-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-3 py-2 flex-1">
          <Search size={15} className="text-[#64748B]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients by name or diagnosis..." className="bg-transparent text-sm w-full outline-none text-[#0F172A] placeholder:text-[#94A3B8]" />
        </div>
        <select className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] bg-white outline-none">
          <option>All Conditions</option>
          <option>Hypertension</option>
          <option>Diabetes</option>
          <option>Cardiac</option>
        </select>
        <select className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] bg-white outline-none">
          <option>All Status</option>
          <option>active</option>
          <option>critical</option>
          <option>watch</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Patient", "Age", "Gender", "Blood", "Primary Diagnosis", "Last Visit", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#0EA5E9] text-xs font-semibold">
                        {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-[#0F172A]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">{p.age}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{p.gender}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-semibold">{p.blood}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">{p.diagnosis}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{p.lastVisit}</td>
                  <td className="px-5 py-3.5"><Badge variant={p.status as any} dot>{p.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => navigate(`/doctor/patients/${p.id}`)} className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:opacity-90">View Profile</button>
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
