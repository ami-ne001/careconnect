import { useState, useEffect } from "react";
import { Download, CreditCard, X, DollarSign, Clock, CheckCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { billingApi, patientApi } from "@/api";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { InvoiceResponse } from "@/api/billing.api";

export function PatientBilling() {
  const { userId } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [patientProfileId, setPatientProfileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment states
  const [payModal, setPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [payMethod, setPayMethod] = useState<"CARD" | "INSURANCE">("CARD");
  const [submitting, setSubmitting] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const loadInvoices = (profileId: number) => {
    setLoading(true);
    billingApi.getInvoicesByPatient(profileId)
      .then(({ data }) => {
        setInvoices(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(getApiErrorMessage(err, "Failed to load billing history."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!userId) return;

    // Load patient profile to find ID
    patientApi.getProfileByUserId(userId)
      .then(({ data }) => {
        setPatientProfileId(data.id);
        loadInvoices(data.id);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  const totalPaid = invoices
    .reduce((s, i) => s + i.paidAmount, 0);

  const outstanding = invoices
    .filter((i) => i.status === "PENDING" || i.status === "PARTIALLY_PAID" || i.status === "OVERDUE")
    .reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);

  const handlePay = async () => {
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      await billingApi.recordPayment({
        invoiceId: selectedInvoice.id,
        amount: selectedInvoice.totalAmount - selectedInvoice.paidAmount,
        paymentMethod: payMethod,
        referenceNumber: payMethod === "CARD" ? `TXN-${Math.floor(100000 + Math.random() * 900000)}` : "INS-CLAIM-DIRECT",
      });

      setPaySuccess(true);
      setTimeout(() => {
        setPayModal(false);
        setPaySuccess(false);
        setSelectedInvoice(null);
        if (patientProfileId) loadInvoices(patientProfileId);
      }, 1800);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to record payment."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Billing & Payments" subtitle="Manage your invoices and payment history" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading billing details…</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
            <StatCard
              title="Total Paid (YTD)"
              value={`$${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<CheckCircle size={20} className="text-[#10B981]" />}
              trendValue="Paid invoices"
              trend="up"
              iconBg="bg-emerald-50"
            />
            <StatCard
              title="Outstanding Balance"
              value={`$${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<DollarSign size={20} className="text-[#F59E0B]" />}
              trendValue="Unpaid balance"
              trend={outstanding > 0 ? "down" : "stable"}
              iconBg="bg-amber-50"
            />
            <StatCard
              title="Next Invoice Status"
              value={invoices.length > 0 ? invoices[0].status : "None"}
              icon={<Clock size={20} className="text-[#0EA5E9]" />}
              trendValue={invoices.length > 0 ? `Inv #${invoices[0].id} · $${invoices[0].totalAmount}` : "No invoices"}
              trend="stable"
              iconBg="bg-sky-50"
            />
          </div>

          {/* Outstanding Alert */}
          {outstanding > 0 && (
            <div className="mb-5 flex items-center justify-between p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#F59E0B]" />
                <p className="text-sm text-[#92400E]">
                  You have <strong>${outstanding.toLocaleString()}</strong> in outstanding payments. Please settle your dues.
                </p>
              </div>
              <button
                onClick={() => {
                  const firstPending = invoices.find(i => i.status === "PENDING" || i.status === "PARTIALLY_PAID");
                  if (firstPending) {
                    setSelectedInvoice(firstPending);
                    setPayModal(true);
                  } else {
                    toast.info("No single invoice found to pay.");
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#F59E0B] text-white text-sm font-medium hover:bg-[#D97706] cursor-pointer transition-colors"
              >
                Pay Outstanding
              </button>
            </div>
          )}

          {/* Invoice Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-semibold text-[#0F172A]">Invoice History</h3>
            </div>
            {invoices.length === 0 ? (
              <div className="p-12 text-center text-[#64748B]">No invoices generated yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      {["Invoice #", "Date", "Source Type", "Items Summary", "Total Amount", "Status", "Action"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => {
                      const dt = new Date(inv.issuedAt);
                      const formattedDate = dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                      const itemsSummary = inv.items.map(item => `${item.description} (x${item.quantity})`).join(", ");
                      const getSourceType = (invoice: InvoiceResponse) => {
                        if (invoice.admissionId) return "Admission";
                        if (invoice.surgeryId) return "Surgery";
                        if (invoice.consultationId) return "Consultation";
                        return "General";
                      };

                      return (
                        <tr key={inv.id} className={`border-b border-[#F1F5F9] hover:bg-[#FAFBFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                          <td className="px-5 py-3.5 font-semibold text-[#0EA5E9]">INV-{inv.id}</td>
                          <td className="px-5 py-3.5 text-[#64748B]">{formattedDate}</td>
                          <td className="px-5 py-3.5 text-[#64748B]">{getSourceType(inv)}</td>
                          <td className="px-5 py-3.5 text-[#0F172A] max-w-xs truncate" title={itemsSummary}>{itemsSummary || "—"}</td>
                          <td className="px-5 py-3.5 font-bold text-[#0F172A]">${inv.totalAmount.toFixed(2)}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant={inv.status === "PAID" ? "active" : "pending"} dot>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            {inv.status === "PAID" ? (
                              <span className="text-[#10B981] text-xs font-semibold">✓ Completed</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setPayModal(true);
                                }}
                                className="flex items-center gap-1 text-[#0EA5E9] text-xs font-semibold hover:underline cursor-pointer"
                              >
                                <CreditCard size={12} />
                                Pay Now
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Payment Modal */}
      {payModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#0F172A]">Make a Payment</h3>
              <button onClick={() => setPayModal(false)} className="text-[#64748B] hover:text-[#0F172A] cursor-pointer">
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
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#64748B]">Invoice:</span>
                    <span className="font-medium text-[#0F172A]">INV-{selectedInvoice.id}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#64748B]">Source Type:</span>
                    <span className="font-medium text-[#0F172A]">
                      {selectedInvoice.admissionId ? "Admission" : selectedInvoice.surgeryId ? "Surgery" : selectedInvoice.consultationId ? "Consultation" : "General"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Amount Due:</span>
                    <span className="font-bold text-[#1E3A5F]">${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toFixed(2)}</span>
                  </div>
                </div>
                {/* Payment method */}
                <div>
                  <p className="text-sm font-medium text-[#0F172A] mb-2">Payment Method</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPayMethod("CARD")}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                        payMethod === "CARD"
                          ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]"
                          : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <CreditCard size={16} />
                      Credit/Debit Card
                    </button>
                    <button
                      onClick={() => setPayMethod("INSURANCE")}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                        payMethod === "INSURANCE"
                          ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]"
                          : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      🛡️ Insurance Claims
                    </button>
                  </div>
                </div>
                {payMethod === "CARD" && (
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
                {payMethod === "INSURANCE" && (
                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#065F46]">
                    Claims will be submitted automatically to your active insurance provider under the member details of your patient file.
                  </div>
                )}
                <button
                  onClick={handlePay}
                  disabled={submitting}
                  className="w-full h-11 rounded-lg bg-[#1E3A5F] text-white font-semibold text-sm hover:bg-[#162d4a] cursor-pointer disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                  Confirm Payment · ${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toFixed(2)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}