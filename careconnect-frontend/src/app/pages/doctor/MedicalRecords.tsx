import { useEffect, useState, useMemo } from "react";
import { Search, Stethoscope, FlaskConical, Pill, FileText, FileMinus, Eye, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, ConsultationResponse, PrescriptionResponse, MedicalDocumentResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";
import type { PatientProfileResponse } from "../../../types/patient.types";

interface RecordItem {
  id: number;
  type: string;
  icon: string;
  dateStr: string;
  dateObj: Date;
  doctor: string;
  patient: string;
  summary: string;
  color: string;
}

const typeFilter = ["All Types", "Consultation Notes", "Lab Report", "Prescription", "Imaging", "Discharge Summary"];

export function DoctorMedicalRecords() {
  const { userId, firstName, lastName } = useAuth();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [patients, setPatients] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!userId) return;

    clinicalApi.getConsultationsByDoctor(userId).then(async r => {
      const uniquePatientIds = Array.from(new Set(r.data.map(c => c.patientId)));

      // Fetch patient names
      const nameMap: Record<number, string> = {};
      await Promise.all(uniquePatientIds.map(id =>
        patientApi.getProfileById(id).then(p => {
          nameMap[id] = `${p.data.firstName || ""} ${p.data.lastName || ""}`.trim() || `Patient #${id}`;
        }).catch(() => { nameMap[id] = `Patient #${id}`; })
      ));
      setPatients(nameMap);

      // Fetch prescriptions and documents for each patient
      const [prescResults, docResults] = await Promise.all([
        Promise.all(uniquePatientIds.map(id => clinicalApi.getPrescriptionsByPatient(id).then(p => p.data).catch(() => []))),
        Promise.all(uniquePatientIds.map(id => clinicalApi.getDocumentsByPatient(id).then(d => d.data).catch(() => []))),
      ]);

      const items: RecordItem[] = [];
      const doctorLabel = `Dr. ${firstName || ""} ${lastName || ""}`.trim();

      // Map Consultations
      r.data.forEach((c) => {
        items.push({
          id: c.id,
          type: "Consultation Notes",
          icon: "🩺",
          dateStr: new Date(c.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          dateObj: new Date(c.startedAt),
          doctor: doctorLabel,
          patient: nameMap[c.patientId] || `Patient #${c.patientId}`,
          summary: `Diagnosis: ${c.diagnosis || "—"}\nChief Complaint: ${c.symptoms || "—"}\nNotes: ${c.clinicalNotes || "None"}`,
          color: "bg-blue-100 text-blue-600",
        });
      });

      // Map Prescriptions (only by this doctor)
      const allRx = prescResults.flat().filter(p => p.doctorId === userId);
      allRx.forEach((p) => {
        const itemsSummary = p.items.map(item => `${item.medication} (${item.dosage} · ${item.frequency})`).join(", ");
        items.push({
          id: p.id,
          type: "Prescription",
          icon: "💊",
          dateStr: new Date(p.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          dateObj: new Date(p.issuedAt),
          doctor: doctorLabel,
          patient: nameMap[p.patientId] || `Patient #${p.patientId}`,
          summary: `Medications: ${itemsSummary || "None"}\nStatus: ${p.status}`,
          color: "bg-green-100 text-green-600",
        });
      });

      // Map Documents
      const allDocs = docResults.flat();
      allDocs.forEach((d) => {
        const isLab = d.documentType === "LAB_REPORT";
        items.push({
          id: d.id,
          type: isLab ? "Lab Report" : "Imaging",
          icon: isLab ? "🔬" : "🫁",
          dateStr: new Date(d.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          dateObj: new Date(d.uploadedAt),
          doctor: doctorLabel,
          patient: nameMap[d.patientId] || `Patient #${d.patientId}`,
          summary: d.notes || "No notes attached.",
          color: isLab ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600",
        });
      });

      items.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
      setRecords(items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  const filtered = records.filter((r) => {
    const matchSearch = r.patient.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase());
    const matchType = type === "All Types" || r.type === type;
    return matchSearch && matchType;
  });

  return (
    <div>
      <PageHeader title="Medical Records" subtitle="View and manage patient medical documentation" />

      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] mb-5 flex flex-wrap gap-3 items-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={15} className="text-[#64748B]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records by patient or summary..." className="bg-transparent text-sm w-full outline-none" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white outline-none">
          {typeFilter.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading records…</span>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={`${r.type}-${r.id}`} className="bg-white rounded-xl p-4 border border-[#E2E8F0] flex items-start gap-4 hover:shadow-md transition-all" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div className={`w-10 h-10 rounded-xl ${r.color} flex items-center justify-center shrink-0 text-base`}>
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">{r.type}</span>
                  <span className="text-xs text-[#64748B]">{r.dateStr}</span>
                </div>
                <p className="font-semibold text-[#0F172A] mb-0.5">{r.patient}</p>
                <p className="text-sm text-[#64748B] leading-relaxed truncate max-w-xl">{r.summary.split("\n")[0]}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{r.doctor}</p>
              </div>
              <button onClick={() => setSelected(r)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8] shrink-0">
                <Eye size={13} />View
              </button>
            </div>
          ))}
          {filtered.length === 0 && <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">No medical records found.</div>}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selected.color} flex items-center justify-center text-lg`}>
                  {selected.icon}
                </div>
                <div>
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">{selected.type}</p>
                  <h3 className="font-bold text-[#0F172A] text-base">{selected.patient}</h3>
                </div>
              </div>
              <button className="cursor-pointer" onClick={() => setSelected(null)}>
                <X size={18} className="text-[#64748B]" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                <span className="text-[#64748B] font-medium">Record Date:</span>
                <span className="font-semibold text-[#0F172A]">{selected.dateStr}</span>
              </div>
              <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                <span className="text-[#64748B] font-medium">Medical Provider:</span>
                <span className="font-semibold text-[#0F172A]">{selected.doctor}</span>
              </div>
              <div className="pb-2">
                <p className="text-[#64748B] font-medium mb-1.5">Details:</p>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl text-[#0F172A] leading-relaxed whitespace-pre-line">
                  {selected.summary}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
