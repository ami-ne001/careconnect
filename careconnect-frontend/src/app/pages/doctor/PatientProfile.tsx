import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Download, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, billingApi, clinicalApi, patientApi } from "../../../api";
import type { LabRequestResponse } from "../../../api/lab.api";
import type { InvoiceResponse } from "../../../api/billing.api";
import type { PatientProfileResponse } from "../../../types/patient.types";
import type { VitalsResponse, ConsultationResponse, PrescriptionResponse, SurgeryResponse } from "../../../api/clinical.api";
import type { AdmissionResponse } from "../../../api/receptionist.api";

const tabs = ["Overview", "Admissions", "Surgeries", "Lab Results", "Invoices"];

export function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const [patient, setPatient] = useState<PatientProfileResponse | null>(null);
  const [vitals, setVitals] = useState<VitalsResponse[]>([]);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [surgeries, setSurgeries] = useState<SurgeryResponse[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionResponse[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequestResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const pid = Number(id);
    Promise.all([
      patientApi.getProfileById(pid).catch(() => ({ data: null })),
      clinicalApi.getVitalsByPatient(pid).catch(() => ({ data: [] })),
      clinicalApi.getConsultationsByPatient(pid).catch(() => ({ data: [] })),
      clinicalApi.getPrescriptionsByPatient(pid).catch(() => ({ data: [] })),
      clinicalApi.getSurgeriesByPatient(pid).catch(() => ({ data: [] })),
      patientApi.getAdmissionsByPatientId(pid).catch(() => ({ data: [] })),
      labApi.getLabRequestsByPatient(pid).catch(() => ({ data: [] })),
      billingApi.getInvoicesByPatient(pid).catch(() => ({ data: [] }))
    ]).then(([pRes, vRes, cRes, rxRes, surgRes, admRes, labRes, invRes]) => {
      setPatient(pRes.data);
      setVitals(vRes.data || []);
      setConsultations(cRes.data || []);
      setPrescriptions(rxRes.data || []);
      setSurgeries(surgRes.data || []);
      setAdmissions(admRes.data || []);
      setLabRequests(labRes.data || []);
      setInvoices(invRes.data || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
        <span className="text-sm text-[#64748B]">Loading patient profile...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#64748B]">Patient not found.</p>
        <button onClick={() => navigate("/doctor/patients")} className="mt-4 text-[#0EA5E9] hover:underline">Return to Patients List</button>
      </div>
    );
  }

  const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const activeMeds = prescriptions
    .filter((rx) => rx.status === "ACTIVE")
    .flatMap((rx) => rx.items.map(it => ({ ...it, since: new Date(rx.issuedAt).toLocaleDateString() })));

  // Build timeline
  const timelineEvents: { timestamp: number; date: string; type: string; title: string; subtitle: string; icon: string }[] = [];
  
  consultations.forEach(c => {
    timelineEvents.push({
      timestamp: new Date(c.startedAt).getTime(),
      date: new Date(c.startedAt).toLocaleDateString(),
      type: "Consultation",
      title: c.diagnosis || "General Consultation",
      subtitle: c.symptoms ? `Symptoms: ${c.symptoms}` : "",
      icon: "🩺"
    });
  });

  prescriptions.forEach(rx => {
    timelineEvents.push({
      timestamp: new Date(rx.issuedAt).getTime(),
      date: new Date(rx.issuedAt).toLocaleDateString(),
      type: "Prescription",
      title: `${rx.items.length} Medication(s) Prescribed`,
      subtitle: rx.items.map(it => it.medication).join(", "),
      icon: "💊"
    });
  });

  surgeries.forEach(s => {
    timelineEvents.push({
      timestamp: new Date(s.scheduledAt).getTime(),
      date: new Date(s.scheduledAt).toLocaleDateString(),
      type: "Surgery",
      title: s.surgeryType,
      subtitle: `Status: ${s.status}`,
      icon: "✂️"
    });
  });

  labRequests.forEach(l => {
    timelineEvents.push({
      timestamp: new Date(l.requestedAt).getTime(),
      date: new Date(l.requestedAt).toLocaleDateString(),
      type: "Lab Request",
      title: l.testTypeName,
      subtitle: `Status: ${l.status}`,
      icon: "🔬"
    });
  });

  timelineEvents.sort((a, b) => b.timestamp - a.timestamp);

  const currentAdmission = admissions.find(a => a.status === "ADMITTED" || a.status === "OBSERVATION");

  return (
    <div>
      <button onClick={() => navigate("/doctor/patients")} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] mb-5 transition-colors">
        <ArrowLeft size={15} /> Back to Patients
      </button>

      {/* Patient banner */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] mb-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex flex-wrap items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {patient.firstName?.[0] || ""}{patient.lastName?.[0] || ""}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="font-bold text-[#0F172A]" style={{ fontSize: 20 }}>{patient.firstName} {patient.lastName}</h2>
              {patient.bloodType && <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-bold">{patient.bloodType}</span>}
              <Badge variant="active" dot>Active</Badge>
            </div>
            <p className="text-sm text-[#64748B] mb-3">
              DOB: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "—"} · 
              Gender: {patient.gender || "—"} · Patient ID: {patient.id}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs font-medium text-[#64748B]">Allergies:</span>
              {patient.allergies?.length ? patient.allergies.map(a => (
                <span key={a.id} className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">{a.allergen}</span>
              )) : <span className="text-xs text-[#94A3B8]">None recorded</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-[#64748B]">Conditions:</span>
              {patient.conditions?.length ? patient.conditions.map(c => (
                <span key={c.id} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{c.conditionName}</span>
              )) : <span className="text-xs text-[#94A3B8]">None recorded</span>}
            </div>
          </div>
          <div className="text-right text-sm text-[#64748B]">
            <p className="text-xs">📞 {patient.phoneNumber || "No phone"}</p>
            <p className="mt-1 text-xs">✉️ {patient.email || "No email"}</p>
            <p className="mt-1 text-xs">{patient.address || "No address"}</p>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#0F172A]">Latest Vitals</h3>
                {latestVitals && <span className="text-xs text-[#64748B]">Recorded {new Date(latestVitals.recordedAt).toLocaleString()}</span>}
              </div>
              
              {!latestVitals ? (
                <p className="text-sm text-[#64748B]">No vitals recorded yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B] mb-1">Blood Pressure</p>
                    <p className="text-xl font-bold text-[#0F172A]">{latestVitals.bpSystolic}/{latestVitals.bpDiastolic}<span className="text-sm font-normal text-[#64748B] ml-1">mmHg</span></p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B] mb-1">Heart Rate</p>
                    <p className="text-xl font-bold text-[#0F172A]">{latestVitals.heartRate || "—"}<span className="text-sm font-normal text-[#64748B] ml-1">bpm</span></p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B] mb-1">Temperature</p>
                    <p className="text-xl font-bold text-[#0F172A]">{latestVitals.temperature || "—"}<span className="text-sm font-normal text-[#64748B] ml-1">°C</span></p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B] mb-1">O₂ Saturation</p>
                    <p className="text-xl font-bold text-[#0F172A]">{latestVitals.oxygenSat || "—"}<span className="text-sm font-normal text-[#64748B] ml-1">%</span></p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B] mb-1">Weight</p>
                    <p className="text-xl font-bold text-[#0F172A]">{latestVitals.weightKg || "—"}<span className="text-sm font-normal text-[#64748B] ml-1">kg</span></p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B] mb-1">Height</p>
                    <p className="text-xl font-bold text-[#0F172A]">{latestVitals.heightCm || "—"}<span className="text-sm font-normal text-[#64748B] ml-1">cm</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Medications */}
            <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 className="font-semibold text-[#0F172A] mb-4">Active Medications</h3>
              {activeMeds.length === 0 ? (
                <p className="text-sm text-[#64748B]">No active medications.</p>
              ) : (
                <div className="space-y-3">
                  {activeMeds.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-base">💊</div>
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">{m.medication} ({m.dosage})</p>
                          <p className="text-xs text-[#64748B]">{m.frequency}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#94A3B8]">Since {m.since}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Medical timeline */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] max-h-[600px] overflow-y-auto" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-4">Medical Timeline</h3>
            {timelineEvents.length === 0 ? (
              <p className="text-sm text-[#64748B]">No historical events.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />
                <div className="space-y-5">
                  {timelineEvents.map((t, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="w-9 h-9 rounded-full bg-white border-2 border-[#E2E8F0] flex items-center justify-center text-base shrink-0 relative z-10">
                        {t.icon}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-xs text-[#94A3B8] mb-0.5">{t.date}</p>
                        <p className="text-sm font-medium text-[#0F172A]">{t.title}</p>
                        {t.subtitle && <p className="text-xs text-[#64748B]">{t.subtitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Admissions" && (
        <div className="space-y-5">
          {/* Currently admitted banner */}
          {currentAdmission && (
            <div className="bg-[#F0F9FF] border-l-4 border-[#0EA5E9] rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0EA5E9] text-white text-xs font-bold">Currently Admitted</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-xs text-[#94A3B8]">Ward</p><p className="font-semibold text-[#0F172A]">{currentAdmission.wardName || "—"}</p></div>
                    <div><p className="text-xs text-[#94A3B8]">Room</p><p className="font-semibold text-[#0F172A]">{currentAdmission.roomNumber || "—"}</p></div>
                    <div><p className="text-xs text-[#94A3B8]">Admitted</p><p className="font-semibold text-[#0F172A]">{new Date(currentAdmission.admissionDate).toLocaleDateString()}</p></div>
                    <div><p className="text-xs text-[#94A3B8]">Status</p><p className="font-semibold text-[#0F172A]">{currentAdmission.status}</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admission history */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Admission History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Admission Date", "Discharge Date", "Ward", "Room", "Reason", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admissions.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-[#64748B]">No admissions found.</td></tr>
                  ) : admissions.map((a, i) => (
                    <tr key={a.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 text-[#0F172A] font-medium whitespace-nowrap">{new Date(a.admissionDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{a.dischargeDate ? new Date(a.dischargeDate).toLocaleDateString() : "—"}</td>
                      <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{a.wardName || "—"}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{a.roomNumber || "—"}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{a.reasonForAdmission || "—"}</td>
                      <td className="px-5 py-3.5"><Badge variant={a.status === "DISCHARGED" ? "completed" : "active"}>{a.status}</Badge></td>
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
          <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Surgery History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Surgery Type", "Date", "Status", "Duration", "Outcome"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {surgeries.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-[#64748B]">No surgeries found.</td></tr>
                  ) : surgeries.map((s, i) => (
                    <tr key={s.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">{s.surgeryType}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{new Date(s.scheduledAt).toLocaleString()}</td>
                      <td className="px-5 py-3.5"><Badge variant={s.status === "COMPLETED" ? "completed" : "pending"}>{s.status}</Badge></td>
                      <td className="px-5 py-3.5 text-[#64748B]">{s.estimatedDuration} min</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{s.outcome || "—"}</td>
                    </tr>
                  ))}
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
                  {["Test Type", "Status", "Order Date", "Urgency"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labRequests.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-[#64748B]">No lab requests found.</td></tr>
                ) : (
                  labRequests.map((req, i) => (
                    <tr key={req.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">{req.testTypeName}</td>
                      <td className="px-5 py-3.5"><Badge variant={req.status === "COMPLETED" ? "active" : "pending"}>{req.status}</Badge></td>
                      <td className="px-5 py-3.5 text-[#64748B]">{new Date(req.requestedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5"><Badge variant={req.priority === "URGENT" || req.priority === "CRITICAL" ? "critical" : "completed"}>{req.priority}</Badge></td>
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
                {invoices.length === 0 ? (
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
    </div>
  );
}