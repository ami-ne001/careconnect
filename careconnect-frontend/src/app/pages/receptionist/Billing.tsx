import { useState } from "react";
import { X, Download } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { DollarSign, Clock, AlertCircle } from "lucide-react";

const invoices = [
  { id: "INV-2901", patient: "John Whitaker", services: "CABG Surgery + CCU Room (4 nights) + Lab Tests", doctor: "Dr. Mitchell", date: "June 17", amount: 12400.00, status: "pending" },
  { id: "INV-2899", patient: "Thomas Green", services: "Knee Replacement Surgery + Room (10 nights) + Physiotherapy", doctor: "Dr. Ross", date: "June 12", amount: 9750.00, status: "partial" },
  { id: "INV-2847", patient: "Ahmed Al-Farsi", services: "Consultation + Lab Tests", doctor: "Dr. Mitchell", date: "June 14", amount: 340.00, status: "pending" },
  { id: "INV-2846", patient: "Maria Santos", services: "Follow-up Consultation", doctor: "Dr. Mitchell", date: "June 13", amount: 120.00, status: "paid" },
  { id: "INV-2845", patient: "John Whitaker", services: "Emergency Visit + ECG", doctor: "Dr. Ross", date: "June 13", amount: 580.00, status: "pending" },
  { id: "INV-2844", patient: "Carlos Rivera", services: "Consultation + HbA1c", doctor: "Dr. Mitchell", date: "June 12", amount: 210.00, status: "paid" },
  { id: "INV-2843", patient: "Layla Hassan", services: "Checkup + BP Monitoring", doctor: "Dr. Mitchell", date: "June 11", amount: 95.00, status: "paid" },
  { id: "INV-2842", patient: "Thomas Grey", services: "Cardiology Consultation", doctor: "Dr. Ross", date: "June 10", amount: 450.00, status: "overdue" },
  { id: "INV-2841", patient: "Fatima Al-Zahrani", services: "Cardiac Assessment", doctor: "Dr. Ross", date: "June 9", amount: 320.00, status: "paid" },
  { id: "INV-2840", patient: "Omar Benali", services: "Post-op Consultation", doctor: "Dr. Park", date: "June 8", amount: 180.00, status: "pending" },
  { id: "INV-2839", patient: "Yasmine Tazi", services: "Initial Consultation", doctor: "Dr. Mitchell", date: "June 7", amount: 95.00, status: "paid" },
  { id: "INV-2838", patient: "Oliver Bennett", services: "Orthopedics + X-Ray", doctor: "Dr. Lane", date: "June 6", amount: 440.00, status: "overdue" },
];

export function ReceptionistBilling() {
  const [activeTab, setActiveTab] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);
  const [payMethod, setPayMethod] = useState("Card");

  const filtered = invoices.filter((inv) => {
    if (activeTab === "Pending") return inv.status === "pending" || inv.status === "overdue";
    if (activeTab === "Paid") return inv.status === "paid";
    return true;
  });

  const statusBadge = (s: string): "pending" | "active" | "critical" | "completed" | "warning" => {
    if (s === "paid") return "completed";
    if (s === "overdue") return "critical";
    if (s === "partial") return "warning";
    return "pending";
  };

  return (
    <div>
      <PageHeader title="Billing" subtitle="Manage patient invoices and payments" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <StatCard title="Collected Today" value="$4,820" subtitle="Total payments" trend="up" trendValue="+$380 vs yesterday" icon={<DollarSign size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
        <StatCard title="Pending Invoices" value="$3,420" subtitle="Awaiting payment" icon={<Clock size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
        <StatCard title="Overdue" value="$890" subtitle="Past due date" trend="down" trendValue="Needs attention" icon={<AlertCircle size={20} className="text-[#EF4444]" />} iconBg="bg-red-50" />
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-5 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {["All", "Pending", "Paid"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"}`}>{t}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Invoice #", "Patient", "Services", "Doctor", "Date", "Amount", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <tr key={inv.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${inv.status === "overdue" ? "bg-red-50/40" : i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 font-mono text-[#0EA5E9] font-semibold text-xs">{inv.id}</td>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{inv.patient}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{inv.services}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{inv.doctor}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{inv.date}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#0F172A]">${inv.amount.toFixed(2)}</td>
                  <td className="px-5 py-3.5"><Badge variant={statusBadge(inv.status)} dot>{inv.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {inv.status !== "paid" && (
                        <button onClick={() => { setSelectedInvoice(inv); setShowModal(true); }} className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:opacity-90">Pay</button>
                      )}
                      <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] flex items-center gap-1">
                        <Download size={12} />View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">Process Payment</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-4 mb-5 space-y-2">
              {[
                { label: "Invoice", val: selectedInvoice.id },
                { label: "Patient", val: selectedInvoice.patient },
                { label: "Services", val: selectedInvoice.services },
                { label: "Amount Due", val: `$${selectedInvoice.amount.toFixed(2)}` },
              ].map((f) => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span className="text-[#64748B]">{f.label}</span>
                  <span className={`font-medium ${f.label === "Amount Due" ? "text-[#0F172A] text-base font-bold" : "text-[#0F172A]"}`}>{f.val}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "Card", "Insurance"].map((m) => (
                    <button key={m} onClick={() => setPayMethod(m)} className={`p-3 rounded-xl border text-sm font-medium transition-all ${payMethod === m ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]" : "border-[#E2E8F0] text-[#64748B]"}`}>
                      {m === "Cash" ? "💵" : m === "Card" ? "💳" : "🏥"} {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Amount Received</label>
                <input defaultValue={`$${selectedInvoice.amount.toFixed(2)}`} className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] font-semibold" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-[#10B981] text-white text-sm font-semibold hover:opacity-90">✓ Confirm Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}