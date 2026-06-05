import { useEffect, useState, useMemo } from "react";
import { Plus, X, Printer } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, PrescriptionResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";
import type { PatientProfileResponse } from "../../../types/patient.types";

export function DoctorPrescriptions() {
  const { userId, firstName, lastName } = useAuth();
  const [activeTab, setActiveTab] = useState("Active Prescriptions");
  const [showModal, setShowModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, PatientProfileResponse>>({});
  const [selected, setSelected] = useState<PrescriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    // Fetch all consultations by doctor, then get prescriptions for each patient
    clinicalApi.getConsultationsByDoctor(userId).then(r => {
      const uniquePatientIds = Array.from(new Set(r.data.map(c => c.patientId)));
      Promise.all(uniquePatientIds.map(id => 
        clinicalApi.getPrescriptionsByPatient(id).then(p => p.data).catch(() => [])
      )).then(results => {
        // Only keep prescriptions written by this doctor
        const allRx = results.flat().filter(rx => rx.doctorId === userId);
        setPrescriptions(allRx);
        if (allRx.length > 0) setSelected(allRx[0]);

        // Fetch patient profiles
        const pIds = Array.from(new Set(allRx.map(rx => rx.patientId)));
        pIds.forEach(id => {
          patientApi.getProfileById(id).then(p => setPatients(prev => ({ ...prev, [id]: p.data }))).catch(() => {});
        });
        setLoading(false);
      });
    }).catch(() => setLoading(false));
  }, [userId]);

  const getPatientName = (id: number) => {
    const p = patients[id];
    return p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() || `Patient #${id}` : `Patient #${id}`;
  };

  const filtered = useMemo(() => 
    prescriptions.filter((p) =>
      activeTab === "Active Prescriptions" ? p.status === "ACTIVE" : p.status !== "ACTIVE"
    ),
  [prescriptions, activeTab]);

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading prescriptions…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Patient", "Medication", "Dosage", "Frequency", "Issued", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rx, i) => (
                    <tr key={rx.id} onClick={() => setSelected(rx)} className={`border-b border-[#F1F5F9] cursor-pointer transition-colors ${selected?.id === rx.id ? "bg-blue-50" : i % 2 === 0 ? "hover:bg-[#F8FAFC]" : "bg-[#FAFBFC] hover:bg-[#F8FAFC]"}`}>
                      <td className="px-4 py-3.5 font-medium text-[#0F172A]">{getPatientName(rx.patientId)}</td>
                      <td className="px-4 py-3.5 text-[#0F172A]">{rx.items[0]?.medication || "—"}</td>
                      <td className="px-4 py-3.5 text-[#64748B]">{rx.items[0]?.dosage || "—"}</td>
                      <td className="px-4 py-3.5 text-[#64748B]">{rx.items[0]?.frequency || "—"}</td>
                      <td className="px-4 py-3.5 text-[#64748B]">{new Date(rx.issuedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5"><Badge variant={rx.status === "ACTIVE" ? "active" : "completed"} dot>{rx.status}</Badge></td>
                      <td className="px-4 py-3.5 text-right"><button className="text-xs text-[#0EA5E9] font-medium">Select</button></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-sm text-[#64748B] text-center">No prescriptions found.</td></tr>}
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
            {selected ? (
              <div className="space-y-3.5">
                {[
                  { label: "Prescription ID", val: `#${selected.id}` },
                  { label: "Patient", val: getPatientName(selected.patientId) },
                  { label: "Medications", val: selected.items.map(it => `${it.medication} (${it.dosage})`).join(", ") || "—" },
                  { label: "Frequency", val: selected.items[0]?.frequency || "—" },
                  { label: "Issued", val: new Date(selected.issuedAt).toLocaleDateString() },
                  { label: "Prescribed By", val: `Dr. ${firstName || ""} ${lastName || ""}`.trim() },
                  { label: "Status", val: selected.status },
                ].map((f) => (
                  <div key={f.label} className="flex items-start justify-between gap-4">
                    <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-medium shrink-0">{f.label}</span>
                    <span className="text-sm text-[#0F172A] font-medium text-right">{f.val}</span>
                  </div>
                ))}
                {selected.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-xs text-[#64748B]"><strong>Notes:</strong> {selected.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">Select a prescription to see details.</p>
            )}
          </div>
        </div>
      )}

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
