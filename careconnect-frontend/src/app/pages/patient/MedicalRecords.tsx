import { useState, useEffect } from "react";
import { Eye, X, Stethoscope, Pill, Activity, AlertCircle, HeartPulse } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { clinicalApi, adminApi, patientApi } from "@/api";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

interface RecordItem {
  id: number;
  type: string;
  icon: React.ReactNode;
  dateStr: string;
  dateObj: Date;
  doctor: string;
  title: string;
  summary: string;
  color: string;
}

export function PatientMedicalRecords() {
  const { userId } = useAuth();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [doctors, setDoctors] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        // 1. Fetch doctors mapping
        const { data: usersData } = await adminApi.getUsers("DOCTOR");
        const docMap: Record<number, string> = {};
        usersData.forEach(d => {
          docMap[d.id] = `Dr. ${d.firstName} ${d.lastName}`;
        });
        setDoctors(docMap);

        // 2. Fetch medical records
        const [
          { data: consultations },
          { data: prescriptions },
          { data: vitals },
          { data: patientProfile }
        ] = await Promise.all([
          clinicalApi.getConsultationsByPatient(userId),
          clinicalApi.getPrescriptionsByPatient(userId),
          clinicalApi.getVitalsByPatient(userId),
          patientApi.getProfileByUserId(userId)
        ]);

        const items: RecordItem[] = [];

        // 1. Map Consultations
        consultations.forEach((c) => {
          items.push({
            id: c.id,
            type: "Consultation Notes",
            icon: <Stethoscope size={14} />,
            dateStr: new Date(c.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dateObj: new Date(c.startedAt),
            doctor: c.doctorId ? (docMap[c.doctorId] || `Dr. #${c.doctorId}`) : "Unknown Provider",
            title: c.diagnosis || "General Consultation",
            summary: `Chief Complaint: ${c.symptoms || "—"}\n\nClinical Notes: ${c.clinicalNotes || "None recorded."}`,
            color: "text-blue-600 bg-blue-50 border-blue-200"
          });
        });

        // 2. Map Prescriptions
        prescriptions.forEach((p) => {
          const itemsSummary = p.items.map(item => `${item.medication} (${item.dosage} · ${item.frequency})`).join(", ");
          items.push({
            id: p.id,
            type: "Prescription",
            icon: <Pill size={14} />,
            dateStr: new Date(p.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dateObj: new Date(p.issuedAt),
            doctor: p.doctorId ? (docMap[p.doctorId] || `Dr. #${p.doctorId}`) : "Unknown Provider",
            title: `Medication Order #${p.id}`,
            summary: `Prescribed Medications: ${itemsSummary || "None listed."}\n\nStatus: ${p.status}`,
            color: "text-emerald-600 bg-emerald-50 border-emerald-200"
          });
        });

        // 3. Map Vitals
        vitals.forEach((v) => {
          items.push({
            id: v.id,
            type: "Vitals",
            icon: <Activity size={14} />,
            dateStr: new Date(v.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dateObj: new Date(v.recordedAt),
            doctor: v.recordedBy ? (docMap[v.recordedBy] || `Nurse #${v.recordedBy}`) : "Clinical Staff",
            title: `Vitals Reading #${v.id}`,
            summary: `BP: ${v.bpSystolic || "—"}/${v.bpDiastolic || "—"} mmHg\nHeart Rate: ${v.heartRate || "—"} bpm\nTemp: ${v.temperature || "—"} °C\nO2 Sat: ${v.oxygenSat || "—"} %\nWeight: ${v.weightKg || "—"} kg · Height: ${v.heightCm || "—"} cm\nNotes: ${v.notes || "None"}`,
            color: "text-purple-600 bg-purple-50 border-purple-200"
          });
        });

        // 4. Map Allergies
        patientProfile.allergies.forEach((a) => {
          items.push({
            id: a.id,
            type: "Allergy",
            icon: <AlertCircle size={14} />,
            dateStr: "Active Record",
            dateObj: new Date(), 
            doctor: "Patient Profile",
            title: `Allergy: ${a.allergen}`,
            summary: `Severity: ${a.severity}\nReaction: ${a.reaction || "None specified"}`,
            color: "text-red-600 bg-red-50 border-red-200"
          });
        });

        // 5. Map Chronic Conditions
        patientProfile.chronicConditions.forEach((c) => {
          items.push({
            id: c.id,
            type: "Chronic Condition",
            icon: <HeartPulse size={14} />,
            dateStr: c.diagnosisDate ? new Date(c.diagnosisDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Active Record",
            dateObj: c.diagnosisDate ? new Date(c.diagnosisDate) : new Date(),
            doctor: "Patient Profile",
            title: c.conditionName,
            summary: `Notes: ${c.notes || "No additional notes."}`,
            color: "text-rose-600 bg-rose-50 border-rose-200"
          });
        });

        // Sort chronologically (latest first)
        items.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
        setRecords(items);
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to load medical records."));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const filtered = records.filter((r) => typeFilter === "All" || r.type === typeFilter);

  return (
    <div>
      <PageHeader title="Medical Records" subtitle="Your complete medical history" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {["All", "Consultation Notes", "Vitals", "Prescription", "Allergy", "Chronic Condition"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              typeFilter === t
                ? "bg-[#1E3A5F] text-white shadow-sm"
                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Compiling your health records…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
          No medical records found in this category.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[#64748B] font-semibold">Date</th>
                  <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[#64748B] font-semibold">Record Type</th>
                  <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[#64748B] font-semibold">Medical Provider</th>
                  <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-[#64748B] font-semibold">Description</th>
                  <th className="text-center px-5 py-4 text-xs uppercase tracking-wider text-[#64748B] font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map((r, i) => (
                  <tr key={i} className="hover:bg-[#FAFBFC] transition-colors">
                    <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">{r.dateStr}</td>
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${r.color}`}>
                        {r.icon}
                        {r.type}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#0F172A] font-medium">{r.doctor}</td>
                    <td className="px-5 py-4 text-[#0F172A]">
                      <p className="font-semibold mb-0.5">{r.title}</p>
                      <p className="text-xs text-[#64748B] truncate max-w-xs">{r.summary.split('\n')[0]}</p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelected(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#0EA5E9] hover:bg-[#F0F9FF] hover:border-[#BAE6FD] transition-colors cursor-pointer"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5 border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected.color.split(' ').slice(1).join(' ')}`}>
                  {selected.icon}
                </div>
                <div>
                  <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold">{selected.type}</p>
                  <h3 className="font-bold text-[#0F172A] text-lg">{selected.title}</h3>
                </div>
              </div>
              <button className="cursor-pointer hover:bg-gray-100 p-1.5 rounded-full transition-colors" onClick={() => setSelected(null)}>
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
              <div>
                <p className="text-xs text-[#64748B] mb-1">Record Date</p>
                <p className="font-semibold text-[#0F172A]">{selected.dateStr}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Medical Provider</p>
                <p className="font-semibold text-[#0F172A]">{selected.doctor}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-[#0F172A] mb-2">Clinical Narrative & Details</p>
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl text-[#475569] text-sm leading-relaxed whitespace-pre-line shadow-sm">
                {selected.summary}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelected(null)} 
                className="px-5 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}