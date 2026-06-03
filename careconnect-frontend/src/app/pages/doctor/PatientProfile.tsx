import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Download, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, billingApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { LabRequestResponse } from "@/api/lab.api";
import type { InvoiceResponse } from "@/api/billing.api";

const vitals = [
  { label: "Blood Pressure", value: "128/84", unit: "mmHg", trend: "up", normal: "120/80" },
  { label: "Heart Rate", value: "78", unit: "bpm", trend: "stable", normal: "60–100" },
  { label: "Temperature", value: "37.1", unit: "°C", trend: "stable", normal: "36.1–37.2" },
  { label: "O₂ Saturation", value: "97", unit: "%", trend: "stable", normal: "95–100" },
  { label: "Weight", value: "74", unit: "kg", trend: "stable", normal: "" },
  { label: "Height", value: "172", unit: "cm", trend: "stable", normal: "" },
];

const timeline = [
  { date: "June 14, 2025", type: "Consultation", title: "Hypertension — Follow-up", doctor: "Dr. Sarah Mitchell", icon: "🩺" },
  { date: "June 10, 2025", type: "Lab Result", title: "Renal Function Panel — Normal", doctor: "Dr. Sarah Mitchell", icon: "🔬" },
  { date: "May 28, 2025", type: "Prescription", title: "Amlodipine 5mg — Renewed", doctor: "Dr. Sarah Mitchell", icon: "💊" },
  { date: "May 15, 2025", type: "Consultation", title: "Blood Pressure Review", doctor: "Dr. Sarah Mitchell", icon: "🩺" },
  { date: "Apr 20, 2025", type: "Lab Result", title: "CBC + Lipid Panel", doctor: "Dr. Sarah Mitchell", icon: "🔬" },
];

const medications = [
  { name: "Amlodipine 5mg", freq: "1 tablet daily", since: "Jan 2024" },
  { name: "Aspirin 81mg", freq: "1 tablet daily", since: "Mar 2024" },
  { name: "Lisinopril 10mg", freq: "1 tablet twice daily", since: "Jun 2024" },
];

const tabs = ["Overview", "Medical History", "Appointments", "Prescriptions", "Lab Results", "Admissions", "Surgeries", "Invoices", "Documents"];

export function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const [labRequests, setLabRequests] = useState<LabRequestResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingExtra(true);
    Promise.all([
      labApi.getLabRequestsByPatient(Number(id)).catch(() => ({ data: [] })),
      billingApi.getInvoicesByPatient(Number(id)).catch(() => ({ data: [] }))
    ]).then(([labRes, invRes]) => {
      setLabRequests(labRes.data);
      setInvoices(invRes.data);
    }).finally(() => setLoadingExtra(false));
  }, [id]);

  return (
    <div>
      <button onClick={() => navigate("/doctor/patients")} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] mb-5 transition-colors">
        <ArrowLeft size={15} /> Back to Patients
      </button>

      {/* Patient banner */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] mb-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex flex-wrap items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white text-xl font-bold shrink-0">
            AH
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="font-bold text-[#0F172A]" style={{ fontSize: 20 }}>Ahmed Al-Farsi</h2>
              <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-bold">A+</span>
              <Badge variant="active" dot>Active</Badge>
            </div>
            <p className="text-sm text-[#64748B] mb-3">DOB: March 12, 1980 · Male · Patient ID: PAT-1042</p>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs font-medium text-[#64748B]">Allergies:</span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Penicillin</span>
              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">Latex</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-[#64748B]">Conditions:</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Essential Hypertension</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Stage 1 CKD</span>
            </div>
          </div>
          <div className="text-right text-sm text-[#64748B]">
            <p className="font-medium text-[#0F172A]">Dr. Sarah Mitchell</p>
            <p className="text-xs">Attending Physician</p>
            <p className="mt-1 text-xs">📞 +971 55 234 5678</p>
            <p className="text-xs">✉️ ahmed.alfarsi@email.com</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-5 overflow-x-auto" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === t ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Vitals */}
            <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 className="font-semibold text-[#0F172A] mb-4">Current Vitals <span className="text-xs text-[#64748B] font-normal">— Recorded June 14, 2025</span></h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vitals.map((v) => {
                  const TI = v.trend === "up" ? TrendingUp : v.trend === "down" ? TrendingDown : Minus;
                  const tc = v.trend === "up" ? "text-[#F59E0B]" : v.trend === "down" ? "text-[#EF4444]" : "text-[#10B981]";
                  return (
                    <div key={v.label} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-[#64748B]">{v.label}</p>
                        <TI size={13} className={tc} />
                      </div>
                      <p className="text-xl font-bold text-[#0F172A]">{v.value}<span className="text-sm font-normal text-[#64748B] ml-1">{v.unit}</span></p>
                      {v.normal && <p className="text-xs text-[#94A3B8] mt-0.5">Normal: {v.normal}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Medications */}
            <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 className="font-semibold text-[#0F172A] mb-4">Current Medications</h3>
              <div className="space-y-3">
                {medications.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-base">💊</div>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">{m.name}</p>
                        <p className="text-xs text-[#64748B]">{m.freq}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#94A3B8]">Since {m.since}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medical timeline */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-4">Medical Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />
              <div className="space-y-5">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-9 h-9 rounded-full bg-white border-2 border-[#E2E8F0] flex items-center justify-center text-base shrink-0 relative z-10">
                      {t.icon}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-xs text-[#94A3B8] mb-0.5">{t.date}</p>
                      <p className="text-sm font-medium text-[#0F172A]">{t.title}</p>
                      <p className="text-xs text-[#64748B]">{t.type} · {t.doctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Admissions" && (
        <div className="space-y-5">
          {/* Currently admitted banner */}
          <div className="bg-[#F0F9FF] border-l-4 border-[#0EA5E9] rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0EA5E9] text-white text-xs font-bold">Currently Admitted</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-xs text-[#94A3B8]">Room</p><p className="font-semibold text-[#0F172A]">Room 301</p></div>
                  <div><p className="text-xs text-[#94A3B8]">Ward</p><p className="font-semibold text-[#0F172A]">Cardiology Ward</p></div>
                  <div><p className="text-xs text-[#94A3B8]">Admitted</p><p className="font-semibold text-[#0F172A]">June 13, 2025</p></div>
                  <div><p className="text-xs text-[#94A3B8]">Expected Discharge</p><p className="font-semibold text-[#0F172A]">June 18, 2025</p></div>
                  <div><p className="text-xs text-[#94A3B8]">Attending Doctor</p><p className="font-semibold text-[#0F172A]">Dr. Mitchell</p></div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-2 rounded-lg border border-[#0EA5E9] text-[#0EA5E9] text-sm font-medium hover:bg-[#EFF6FF]">View Room</button>
                <button className="px-3 py-2 rounded-lg bg-[#F59E0B] text-white text-sm font-medium hover:opacity-90">Process Discharge</button>
              </div>
            </div>
          </div>

          {/* Admission history */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Admission History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Admission Date", "Discharge Date", "Duration", "Ward", "Room", "Reason", "Discharge Status", "Summary"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { admit: "Mar 3, 2024", discharge: "Mar 7, 2024", duration: "4 days", ward: "Cardiology Ward", room: "Room 301", reason: "Hypertension Emergency", status: "Recovered" },
                    { admit: "Nov 14, 2023", discharge: "Nov 16, 2023", duration: "2 days", ward: "General Ward", room: "Room 207", reason: "Severe Flu with Dehydration", status: "Recovered" },
                  ].map((r, i) => (
                    <tr key={i} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 text-[#0F172A] font-medium whitespace-nowrap">{r.admit}</td>
                      <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{r.discharge}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{r.duration}</td>
                      <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{r.ward}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{r.room}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{r.reason}</td>
                      <td className="px-5 py-3.5"><Badge variant="active">{r.status}</Badge></td>
                      <td className="px-5 py-3.5"><button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0EA5E9] hover:bg-[#F8FAFC]">View PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Surgeries" && (
        <div className="space-y-5">
          {/* Upcoming surgery banner */}
          <div className="bg-[#F0F9FF] border-l-4 border-[#0EA5E9] rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0EA5E9] text-white text-xs font-bold">Scheduled Surgery</span>
                  <Badge variant="pending">Pre-Op Prep</Badge>
                </div>
                <p className="font-bold text-[#0F172A] mb-2">Coronary Artery Bypass Graft (CABG)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-xs text-[#94A3B8]">Date & Time</p><p className="font-semibold text-[#0F172A]">June 17, 2025 08:00 AM</p></div>
                  <div><p className="text-xs text-[#94A3B8]">Operating Room</p><p className="font-semibold text-[#0F172A]">OR-2</p></div>
                  <div><p className="text-xs text-[#94A3B8]">Surgeon</p><p className="font-semibold text-[#0F172A]">Dr. Mitchell</p></div>
                </div>
              </div>
              <button className="px-3 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 shrink-0">View Details</button>
            </div>
          </div>

          {/* Surgery history */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Surgery History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Surgery Type", "Date", "Surgeon", "OR", "Duration", "Outcome", "Notes"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#F1F5F9]">
                    <td className="px-5 py-3.5 font-medium text-[#0F172A]">Right Knee Arthroscopy</td>
                    <td className="px-5 py-3.5 text-[#64748B]">March 2023</td>
                    <td className="px-5 py-3.5 text-[#64748B]">Dr. Emily Ross</td>
                    <td className="px-5 py-3.5 text-[#64748B]">OR-1</td>
                    <td className="px-5 py-3.5 text-[#64748B]">1h 20min</td>
                    <td className="px-5 py-3.5"><Badge variant="active">Successful</Badge></td>
                    <td className="px-5 py-3.5"><button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0EA5E9] hover:bg-[#F8FAFC]">View Notes</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Lab Results" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Lab Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Test Type", "Status", "Order Date", "Urgency", "Notes"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingExtra ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-[#64748B]">Loading...</td></tr>
                ) : labRequests.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-[#64748B]">No lab requests found.</td></tr>
                ) : (
                  labRequests.map((req, i) => (
                    <tr key={req.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">{req.testTypeName}</td>
                      <td className="px-5 py-3.5"><Badge variant={req.status === "COMPLETED" ? "active" : "pending"}>{req.status}</Badge></td>
                      <td className="px-5 py-3.5 text-[#64748B]">{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5"><Badge variant={req.priority === "URGENT" || req.priority === "CRITICAL" ? "critical" : "completed"}>{req.priority}</Badge></td>
                      <td className="px-5 py-3.5 text-[#64748B] max-w-[200px] truncate">—</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "Invoices" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Billing History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Invoice #", "Date", "Status", "Total", "Paid", "Outstanding"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingExtra ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-[#64748B]">Loading...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-[#64748B]">No invoices found.</td></tr>
                ) : (
                  invoices.map((inv, i) => (
                    <tr key={inv.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 font-medium text-[#0EA5E9]">INV-{inv.id}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5"><Badge variant={inv.status === "PAID" ? "active" : "pending"}>{inv.status}</Badge></td>
                      <td className="px-5 py-3.5 font-bold text-[#0F172A]">${inv.totalAmount.toFixed(2)}</td>
                      <td className="px-5 py-3.5 font-medium text-[#10B981]">${inv.paidAmount.toFixed(2)}</td>
                      <td className="px-5 py-3.5 font-bold text-[#EF4444]">${(inv.totalAmount - inv.paidAmount).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab !== "Overview" && activeTab !== "Admissions" && activeTab !== "Surgeries" && activeTab !== "Lab Results" && activeTab !== "Invoices" && (
        <div className="bg-white rounded-xl p-8 border border-[#E2E8F0] text-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <p className="text-[#64748B] text-sm">Select a tab to view {activeTab} details for this patient.</p>
        </div>
      )}
    </div>
  );
}