import { useState } from "react";
import { Download, CreditCard, X, DollarSign, Clock, CheckCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";

const invoices = [
  { id: "INV-2847", date: "June 14, 2025", description: "Consultation + Lab Tests", amount: 340, status: "paid" },
  { id: "INV-2831", date: "May 28, 2025", description: "Cardiology Follow-up", amount: 180, status: "paid" },
  { id: "INV-2819", date: "May 10, 2025", description: "Blood Panel + ECG", amount: 220, status: "paid" },
  { id: "INV-2804", date: "Apr 22, 2025", description: "Specialist Consultation", amount: 250, status: "paid" },
  { id: "INV-2798", date: "Apr 5, 2025", description: "General Check-up", amount: 120, status: "paid" },
  { id: "INV-2901", date: "July 1, 2025", description: "Follow-up Consultation", amount: 120, status: "pending" },
];

export function PatientBilling() {
  const [payModal, setPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<"card" | "insurance">("card");
  const [paySuccess, setPaySuccess] = useState(false);

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);

  const handlePay = () => {
    setPaySuccess(true);
    setTimeout(() => {
      setPayModal(false);
      setPaySuccess(false);
    }, 1800);
  };

  return (
    <div>
      <PageHeader title="Billing & Payments" subtitle="Manage your invoices and payment history" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
        <StatCard
          title="Total Paid (YTD)"
          value={`$${totalPaid.toLocaleString()}`}
          icon={<CheckCircle size={20} />}
          trendValue="2025 to date"
          trend="up"
          iconBg="bg-[#D1FAE5]"
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${outstanding}`}
          icon={<DollarSign size={20} />}
          trendValue="1 unpaid invoice"
          trend="down"
          iconBg="bg-[#FEF3C7]"
        />
        <StatCard
          title="Next Payment Due"
          value="July 1, 2025"
          icon={<Clock size={20} />}
          trendValue="INV-2901 · $120"
          trend="stable"
          iconBg="bg-[#EFF6FF]"
        />
      </div>

      {/* Outstanding Alert */}
      {outstanding > 0 && (
        <div className="mb-5 flex items-center justify-between p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-[#F59E0B]" />
            <p className="text-sm text-[#92400E]">
              You have <strong>${outstanding}</strong> in outstanding payments. Next due date: <strong>July 1, 2025</strong>.
            </p>
          </div>
          <button
            onClick={() => setPayModal(true)}
            className="px-4 py-2 rounded-lg bg-[#F59E0B] text-white text-sm font-medium hover:bg-[#D97706]"
          >
            Pay Now
          </button>
        </div>
      )}

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="font-semibold text-[#0F172A]">Invoice History</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC]">
            <Download size={14} />
            Export All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {["Invoice #", "Date", "Description", "Amount", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.id} className={`border-b border-[#F1F5F9] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                  <td className="px-5 py-3.5 font-medium text-[#0EA5E9]">{inv.id}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{inv.date}</td>
                  <td className="px-5 py-3.5 text-[#0F172A]">{inv.description}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#0F172A]">${inv.amount}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={inv.status === "paid" ? "active" : "pending"} dot>
                      {inv.status === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    {inv.status === "paid" ? (
                      <button className="flex items-center gap-1 text-[#64748B] text-xs font-medium hover:text-[#0EA5E9]">
                        <Download size={12} />
                        Download
                      </button>
                    ) : (
                      <button
                        onClick={() => setPayModal(true)}
                        className="flex items-center gap-1 text-[#0EA5E9] text-xs font-medium hover:underline"
                      >
                        <CreditCard size={12} />
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#0F172A]">Make a Payment</h3>
              <button onClick={() => setPayModal(false)} className="text-[#64748B] hover:text-[#0F172A]">
                <X size={20} />
              </button>
            </div>
            {paySuccess ? (
              <div className="p-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                  <CheckCircle size={32} className="text-[#10B981]" />
                </div>
                <p className="font-semibold text-[#0F172A]">Payment Successful!</p>
                <p className="text-sm text-[#64748B]">Your invoice has been marked as paid.</p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Invoice info */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#64748B]">Invoice</span>
                    <span className="font-medium text-[#0F172A]">INV-2901</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#64748B]">Description</span>
                    <span className="font-medium text-[#0F172A]">Follow-up Consultation</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Amount Due</span>
                    <span className="font-bold text-[#1E3A5F]">$120.00</span>
                  </div>
                </div>
                {/* Payment method */}
                <div>
                  <p className="text-sm font-medium text-[#0F172A] mb-2">Payment Method</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPayMethod("card")}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-medium ${
                        payMethod === "card"
                          ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]"
                          : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <CreditCard size={16} />
                      Credit/Debit Card
                    </button>
                    <button
                      onClick={() => setPayMethod("insurance")}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-medium ${
                        payMethod === "insurance"
                          ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]"
                          : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      🛡️ Insurance
                    </button>
                  </div>
                </div>
                {payMethod === "card" && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number"
                      defaultValue="**** **** **** 4821"
                      className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="08/27"
                        className="flex-1 h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        defaultValue="•••"
                        className="flex-1 h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                      />
                    </div>
                  </div>
                )}
                {payMethod === "insurance" && (
                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-sm text-[#065F46]">
                    Insurance: <strong>BlueCross BlueShield</strong> · Policy #BCB-9821-XX · Claims will be submitted automatically.
                  </div>
                )}
                <button
                  onClick={handlePay}
                  className="w-full h-11 rounded-lg bg-[#1E3A5F] text-white font-semibold text-sm hover:bg-[#162d4a]"
                >
                  Confirm Payment · $120.00
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}