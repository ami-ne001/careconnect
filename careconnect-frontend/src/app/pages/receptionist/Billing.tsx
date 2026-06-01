import { useState, useEffect } from "react";
import { X, DollarSign, Clock, AlertCircle, CreditCard, Search } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { billingApi, receptionistApi, adminApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { InvoiceResponse } from "@/api/billing.api";
import type { PatientProfileResponse, AdminUser } from "@/types";

export function ReceptionistBilling() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [patients, setPatients] = useState<PatientProfileResponse[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchPatientId, setSearchPatientId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Paid">("All");

  // Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [payMethod, setPayMethod] = useState<"CASH" | "CARD" | "INSURANCE">("CARD");
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const getPatientDisplayName = (p: PatientProfileResponse) => {
    const u = users.find((user) => user.id === p.userId);
    return u ? `${u.firstName} ${u.lastName}` : `Patient Profile #${p.id}`;
  };

  const loadData = () => {
    setLoading(true);
    // Fetch all patients and pending/partially paid/overdue/paid invoices in parallel
    Promise.all([
      receptionistApi.getPatientsList(0, 100),
      adminApi.getUsers("PATIENT"),
      billingApi.getInvoicesByStatus("PENDING"),
      billingApi.getInvoicesByStatus("PARTIALLY_PAID"),
      billingApi.getInvoicesByStatus("OVERDUE"),
      billingApi.getInvoicesByStatus("PAID")
    ])
      .then(([ptsPage, ptsUsers, pending, partial, overdue, paid]) => {
        setPatients(ptsPage.data.content || []);
        setUsers(ptsUsers.data || []);
        // Combine all invoices
        const allInvoices = [
          ...pending.data,
          ...partial.data,
          ...overdue.data,
          ...paid.data
        ];
        // Sort by ID descending
        allInvoices.sort((a, b) => b.id - a.id);
        setInvoices(allInvoices);
      })
      .catch((err) => {
        console.error(err);
        toast.error(getApiErrorMessage(err, "Failed to load billing records."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePatientSearch = async () => {
    if (!searchPatientId) {
      loadData();
      return;
    }
    setLoading(true);
    try {
      const { data } = await billingApi.getInvoicesByPatient(Number(searchPatientId));
      data.sort((a, b) => b.id - a.id);
      setInvoices(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "No invoices found for this patient."));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedInvoice) return;
    const amount = Number(amountReceived);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setSubmitting(true);
    try {
      await billingApi.recordPayment({
        invoiceId: selectedInvoice.id,
        amount,
        paymentMethod: payMethod,
        referenceNumber: payMethod === "CARD" ? `TXN-${Math.floor(100000 + Math.random() * 900000)}` : "FRONT-DESK-CASH",
      });

      toast.success("Payment processed successfully!");
      setShowModal(false);
      setSelectedInvoice(null);
      setAmountReceived("");
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to process payment."));
    } finally {
      setSubmitting(false);
    }
  };

  // Filter local state based on tab selection
  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === "Pending") return inv.status === "PENDING" || inv.status === "PARTIALLY_PAID" || inv.status === "OVERDUE";
    if (activeTab === "Paid") return inv.status === "PAID";
    return true;
  });

  const getStatusBadgeVariant = (s: string) => {
    if (s === "PAID") return "completed";
    if (s === "OVERDUE") return "critical";
    if (s === "PARTIALLY_PAID") return "warning";
    return "pending";
  };

  // Stats
  const pendingAmount = invoices
    .filter(i => ["PENDING", "PARTIALLY_PAID", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  const collectedAmount = invoices
    .filter(i => i.status === "PAID" || i.status === "PARTIALLY_PAID")
    .reduce((sum, i) => sum + i.paidAmount, 0);

  const overdueAmount = invoices
    .filter(i => i.status === "OVERDUE")
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  return (
    <div>
      <PageHeader title="Billing" subtitle="Manage patient invoices and payments" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading invoices board…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <StatCard title="Collected Today" value={`$${collectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} subtitle="Total paid amount" icon={<DollarSign size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
            <StatCard title="Pending Invoices" value={`$${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} subtitle="Awaiting payment" icon={<Clock size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
            <StatCard title="Overdue Amount" value={`$${overdueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} subtitle="Past due date" icon={<AlertCircle size={20} className="text-[#EF4444]" />} iconBg="bg-red-50" />
          </div>

          {/* Search Patient */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[240px]">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Search Patient Invoices</label>
              <select
                value={searchPatientId}
                onChange={(e) => setSearchPatientId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white"
              >
                <option value="">All Patients (Default view)</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{getPatientDisplayName(p)} (ID #{p.id})</option>
                ))}
              </select>
            </div>
            <button
              onClick={handlePatientSearch}
              className="px-5 h-10 mt-5 rounded-lg bg-[#1E3A5F] text-white text-xs font-bold hover:opacity-90 cursor-pointer flex items-center gap-1.5"
            >
              <Search size={14} />Search History
            </button>
          </div>

          <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-5 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {["All", "Pending", "Paid"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  activeTab === t ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Invoice ID", "Patient", "Description", "Due Date", "Total Amount", "Paid", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748B]">No invoices on record.</td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv, i) => {
                      const itemsSummary = inv.items.map(item => `${item.description} (x${item.quantity})`).join(", ");
                      const dueDateStr = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Immediate";

                      return (
                        <tr key={inv.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${inv.status === "OVERDUE" ? "bg-red-50/40" : i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                          <td className="px-5 py-3.5 font-semibold text-[#0EA5E9] text-xs">INV-{inv.id}</td>
                          <td className="px-5 py-3.5 font-bold text-[#0F172A]">{inv.patientName || `Patient ID: ${inv.patientId}`}</td>
                          <td className="px-5 py-3.5 text-[#64748B] max-w-xs truncate" title={itemsSummary}>{itemsSummary || "Consultation & check-up"}</td>
                          <td className="px-5 py-3.5 text-[#64748B]">{dueDateStr}</td>
                          <td className="px-5 py-3.5 font-bold text-[#0F172A]">${inv.totalAmount.toFixed(2)}</td>
                          <td className="px-5 py-3.5 font-semibold text-[#10B981]">${inv.paidAmount.toFixed(2)}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant={getStatusBadgeVariant(inv.status)} dot>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                              {inv.status !== "PAID" && (
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setAmountReceived((inv.totalAmount - inv.paidAmount).toFixed(2));
                                    setShowModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-bold hover:opacity-90 cursor-pointer"
                                >
                                  Collect Payment
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A] text-base">Process Payment</h3>
              <button className="cursor-pointer" onClick={() => setShowModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mb-5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Invoice:</span>
                <span className="font-semibold text-[#0F172A]">INV-{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Patient:</span>
                <span className="font-semibold text-[#0F172A]">{selectedInvoice.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Outstanding:</span>
                <span className="font-bold text-[#EF4444]">${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {["CASH", "CARD", "INSURANCE"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        payMethod === m ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]" : "border-[#E2E8F0] text-[#64748B]"
                      }`}
                    >
                      {m === "CASH" ? "💵 Cash" : m === "CARD" ? "💳 Card" : "🏥 Insurance"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Amount to Record</label>
                <input
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] font-bold"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B] cursor-pointer">Cancel</button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={submitting}
                  className="flex-1 h-10 rounded-lg bg-[#10B981] text-white text-xs font-bold hover:opacity-90 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting && <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />}
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}