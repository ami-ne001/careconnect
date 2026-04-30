import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const pending = [
  { patient: "Maria Santos", test: "Complete Blood Count", priority: "normal", date: "June 14", status: "Processing" },
  { patient: "Carlos Rivera", test: "HbA1c", priority: "normal", date: "June 14", status: "Awaiting Sample" },
  { patient: "Fatima Al-Zahrani", test: "ECG + Troponin", priority: "urgent", date: "June 14", status: "Processing" },
  { patient: "Layla Hassan", test: "Thyroid Panel", priority: "normal", date: "June 12", status: "Awaiting Sample" },
  { patient: "Ahmed Al-Farsi", test: "Renal Function Panel", priority: "normal", date: "June 10", status: "Processing" },
  { patient: "Oliver Bennett", test: "X-Ray Lumbar Spine", priority: "normal", date: "June 9", status: "Scheduled" },
];

const results = [
  { patient: "John Whitaker", test: "Lipid Panel", summary: "LDL: 142 mg/dL", date: "June 13", flag: "abnormal" },
  { patient: "Maria Santos", test: "Fasting Blood Glucose", summary: "FBG: 7.2 mmol/L", date: "June 12", flag: "abnormal" },
  { patient: "Ahmed Al-Farsi", test: "Complete Blood Count", summary: "All values within range", date: "June 11", flag: "normal" },
  { patient: "Thomas Grey", test: "ECG", summary: "Sinus bradycardia noted", date: "June 10", flag: "abnormal" },
  { patient: "Layla Hassan", test: "Urinalysis", summary: "Protein trace +1", date: "June 9", flag: "normal" },
];

export function DoctorLabRequests() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <PageHeader
        title="Lab Requests"
        subtitle="Manage laboratory test requests and results"
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={15} />New Lab Request
          </button>
        }
      />

      {/* Pending */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Pending Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Patient", "Test Requested", "Priority", "Requested Date", "Lab Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((r, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{r.patient}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{r.test}</td>
                  <td className="px-5 py-3.5"><Badge variant={r.priority === "urgent" ? "urgent" : "info"}>{r.priority}</Badge></td>
                  <td className="px-5 py-3.5 text-[#64748B]">{r.date}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{r.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8]">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Received */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Results Received</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Patient", "Test", "Result Summary", "Date", "Flag", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"} ${r.flag === "abnormal" ? "bg-red-50/50" : ""}`}>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{r.patient}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{r.test}</td>
                  <td className="px-5 py-3.5 text-[#0F172A]">{r.summary}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{r.date}</td>
                  <td className="px-5 py-3.5"><Badge variant={r.flag === "normal" ? "normal" : "abnormal"}>{r.flag}</Badge></td>
                  <td className="px-5 py-3.5">
                    <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium hover:bg-[#0EA5E9]/20">View Full Result</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lab Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">New Lab Request</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Patient</label>
                <input placeholder="Search patient..." className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Test Type</label>
                <select className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                  <option>Complete Blood Count</option>
                  <option>Lipid Panel</option>
                  <option>HbA1c</option>
                  <option>Thyroid Panel</option>
                  <option>Renal Function</option>
                  <option>Liver Function</option>
                  <option>Urinalysis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Priority</label>
                <select className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                  <option>Normal</option>
                  <option>Urgent</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Clinical Indication</label>
                <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
