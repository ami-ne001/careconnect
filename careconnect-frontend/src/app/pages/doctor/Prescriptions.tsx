import { useState } from "react";
import { Plus, X, Printer } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const prescriptions = [
  { id: "RX-9021", patient: "Ahmed Al-Farsi", med: "Amlodipine 5mg", dose: "1 tablet", freq: "Once daily", dur: "30 days", start: "June 10", status: "active" },
  { id: "RX-9018", patient: "Ahmed Al-Farsi", med: "Aspirin 81mg", dose: "1 tablet", freq: "Once daily", dur: "Ongoing", start: "June 10", status: "active" },
  { id: "RX-9015", patient: "Carlos Rivera", med: "Metformin 500mg", dose: "1 tablet", freq: "Twice daily", dur: "90 days", start: "June 8", status: "active" },
  { id: "RX-9010", patient: "Maria Santos", med: "Insulin Glargine 10U", dose: "10 units", freq: "Once daily at bedtime", dur: "Ongoing", start: "June 5", status: "active" },
  { id: "RX-9005", patient: "Layla Hassan", med: "Lisinopril 10mg", dose: "1 tablet", freq: "Once daily", dur: "60 days", start: "June 1", status: "active" },
  { id: "RX-8998", patient: "John Whitaker", med: "Atorvastatin 40mg", dose: "1 tablet", freq: "Once at night", dur: "90 days", start: "May 28", status: "active" },
  { id: "RX-8990", patient: "Oliver Bennett", med: "Ibuprofen 400mg", dose: "1 tablet", freq: "Three times daily", dur: "7 days", start: "May 20", status: "completed" },
  { id: "RX-8980", patient: "Fatima Al-Zahrani", med: "Bisoprolol 2.5mg", dose: "1 tablet", freq: "Once daily", dur: "30 days", start: "May 15", status: "completed" },
  { id: "RX-8970", patient: "Nour El-Din", med: "Sertraline 50mg", dose: "1 tablet", freq: "Once daily", dur: "30 days", start: "May 10", status: "completed" },
  { id: "RX-8960", patient: "Carlos Rivera", med: "Glipizide 5mg", dose: "1 tablet", freq: "Once before breakfast", dur: "30 days", start: "May 1", status: "completed" },
];

export function DoctorPrescriptions() {
  const [activeTab, setActiveTab] = useState("Active Prescriptions");
  const [selected, setSelected] = useState(prescriptions[0]);
  const [showModal, setShowModal] = useState(false);

  const filtered = prescriptions.filter((p) =>
    activeTab === "Active Prescriptions" ? p.status === "active" : p.status === "completed"
  );

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        subtitle="Manage patient prescriptions"
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={15} />New Prescription
          </button>
        }
      />

      <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-5 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {["Active Prescriptions", "Prescription History"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Patient", "Medication", "Dosage", "Frequency", "Duration", "Start", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rx, i) => (
                  <tr key={rx.id} onClick={() => setSelected(rx)} className={`border-b border-[#F1F5F9] cursor-pointer transition-colors ${selected.id === rx.id ? "bg-blue-50" : i % 2 === 0 ? "hover:bg-[#F8FAFC]" : "bg-[#FAFBFC] hover:bg-[#F8FAFC]"}`}>
                    <td className="px-4 py-3.5 font-medium text-[#0F172A]">{rx.patient}</td>
                    <td className="px-4 py-3.5 text-[#0F172A]">{rx.med}</td>
                    <td className="px-4 py-3.5 text-[#64748B]">{rx.dose}</td>
                    <td className="px-4 py-3.5 text-[#64748B]">{rx.freq}</td>
                    <td className="px-4 py-3.5 text-[#64748B]">{rx.dur}</td>
                    <td className="px-4 py-3.5 text-[#64748B]">{rx.start}</td>
                    <td className="px-4 py-3.5"><Badge variant={rx.status === "active" ? "active" : "completed"} dot>{rx.status}</Badge></td>
                    <td className="px-4 py-3.5 text-right"><button className="text-xs text-[#0EA5E9] font-medium">Select</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#0F172A]">Prescription Detail</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#64748B] hover:bg-[#F8FAFC]">
              <Printer size={13} />Print
            </button>
          </div>
          <div className="space-y-3.5">
            {[
              { label: "Prescription ID", val: selected.id },
              { label: "Patient", val: selected.patient },
              { label: "Medication", val: selected.med },
              { label: "Dosage", val: selected.dose },
              { label: "Frequency", val: selected.freq },
              { label: "Duration", val: selected.dur },
              { label: "Start Date", val: selected.start },
              { label: "Prescribed By", val: "Dr. Sarah Mitchell" },
              { label: "Status", val: selected.status },
            ].map((f) => (
              <div key={f.label} className="flex items-start justify-between gap-4">
                <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-medium shrink-0">{f.label}</span>
                <span className="text-sm text-[#0F172A] font-medium text-right">{f.val}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <p className="text-xs text-[#64748B]"><strong>Notes:</strong> Take with food. Monitor blood pressure. Return for follow-up in 30 days.</p>
          </div>
        </div>
      </div>

      {/* New Prescription modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">New Prescription</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Patient", placeholder: "Search patient name..." },
                { label: "Medication Name", placeholder: "e.g. Amlodipine 5mg" },
                { label: "Dosage", placeholder: "e.g. 1 tablet" },
                { label: "Frequency", placeholder: "e.g. Once daily" },
                { label: "Duration", placeholder: "e.g. 30 days" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Notes</label>
                <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:opacity-90">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
