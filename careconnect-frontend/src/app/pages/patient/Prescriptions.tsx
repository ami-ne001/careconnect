import { Download, RefreshCw } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const active = [
  { med: "Amlodipine 5mg", dose: "1 tablet once daily", doctor: "Dr. Sarah Mitchell", start: "Jan 10, 2024", end: "July 10, 2025", refills: 2 },
  { med: "Aspirin 81mg", dose: "1 tablet once daily", doctor: "Dr. Sarah Mitchell", start: "Mar 5, 2024", end: "July 5, 2025", refills: 1 },
];

const history = [
  { med: "Lisinopril 10mg", prescribed: "Dr. Sarah Mitchell", date: "June 1, 2025", duration: "30 days", status: "active" },
  { med: "Amlodipine 5mg", prescribed: "Dr. Sarah Mitchell", date: "May 1, 2025", duration: "30 days", status: "completed" },
  { med: "Aspirin 81mg", prescribed: "Dr. Sarah Mitchell", date: "May 1, 2025", duration: "30 days", status: "completed" },
  { med: "Metoprolol 25mg", prescribed: "Dr. Sarah Mitchell", date: "Apr 1, 2025", duration: "14 days", status: "completed" },
  { med: "Furosemide 20mg", prescribed: "Dr. Emily Ross", date: "Mar 12, 2025", duration: "7 days", status: "completed" },
  { med: "Amoxicillin 500mg", prescribed: "Dr. Sarah Mitchell", date: "Feb 5, 2025", duration: "5 days", status: "completed" },
  { med: "Atorvastatin 20mg", prescribed: "Dr. Sarah Mitchell", date: "Jan 8, 2025", duration: "30 days", status: "completed" },
  { med: "Pantoprazole 40mg", prescribed: "Dr. Sarah Mitchell", date: "Dec 10, 2024", duration: "14 days", status: "completed" },
];

export function PatientPrescriptions() {
  return (
    <div>
      <PageHeader title="My Prescriptions" subtitle="Your current and past prescriptions" />

      {/* Active */}
      <div className="mb-7">
        <h3 className="font-semibold text-[#0F172A] mb-4">Active Prescriptions</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {active.map((p, i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-[#0EA5E9] p-5" style={{ boxShadow: "0 4px 12px rgba(14,165,233,0.1)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-2xl">💊</div>
                  <div>
                    <h4 className="font-bold text-[#0F172A]">{p.med}</h4>
                    <p className="text-sm text-[#64748B]">{p.dose}</p>
                  </div>
                </div>
                <Badge variant="active" dot>Active</Badge>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Prescribed by</span>
                  <span className="font-medium text-[#0F172A]">{p.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Start Date</span>
                  <span className="font-medium text-[#0F172A]">{p.start}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">End Date</span>
                  <span className="font-medium text-[#0F172A]">{p.end}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Refills Remaining</span>
                  <span className={`font-bold ${p.refills > 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>{p.refills}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 h-9 rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-[#0EA5E9]/20">
                  <RefreshCw size={13} />Request Refill
                </button>
                <button className="flex-1 h-9 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] flex items-center justify-center gap-1.5 hover:bg-[#F8FAFC]">
                  <Download size={13} />Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="font-semibold text-[#0F172A] mb-4">Prescription History</h3>
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Medication", "Prescribed By", "Date", "Duration", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                    <td className="px-5 py-3.5 font-medium text-[#0F172A]">{h.med}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{h.prescribed}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{h.date}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{h.duration}</td>
                    <td className="px-5 py-3.5"><Badge variant={h.status === "active" ? "active" : "completed"} dot>{h.status}</Badge></td>
                    <td className="px-5 py-3.5"><button className="text-[#0EA5E9] text-xs font-medium hover:underline flex items-center gap-1"><Download size={12} />PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
