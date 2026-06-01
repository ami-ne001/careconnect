import { useState, useEffect } from "react";
import { Eye, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { clinicalApi, patientApi } from "@/api";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

interface RecordItem {
  id: number;
  type: string;
  icon: string;
  dateStr: string;
  dateObj: Date;
  doctor: string;
  title: string;
  summary: string;
  color: string;
}

export function PatientMedicalRecords() {
  const { userId } = useAuth();
  const [timeline, setTimeline] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    if (!userId) return;

    patientApi.getProfileByUserId(userId)
      .then(async ({ data: patProfile }) => {
        const patientId = patProfile.id;

        // Fetch consultations, prescriptions, and documents in parallel
        const [
          { data: consultations },
          { data: prescriptions },
          { data: documents }
        ] = await Promise.all([
          clinicalApi.getConsultationsByPatient(patientId),
          clinicalApi.getPrescriptionsByPatient(patientId),
          clinicalApi.getDocumentsByPatient(patientId)
        ]);

        const items: RecordItem[] = [];

        // 1. Map Consultations
        consultations.forEach((c) => {
          items.push({
            id: c.id,
            type: "Consultation Notes",
            icon: "🩺",
            dateStr: new Date(c.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dateObj: new Date(c.startedAt),
            doctor: `Dr. #${c.doctorId}`,
            title: c.diagnosis || "General Consultation",
            summary: `Chief Complaint: ${c.symptoms || "—"}\n\nClinical Notes: ${c.clinicalNotes || "None recorded."}`,
            color: "bg-blue-100 text-blue-600"
          });
        });

        // 2. Map Prescriptions
        prescriptions.forEach((p) => {
          const itemsSummary = p.items.map(item => `${item.medication} (${item.dosage} · ${item.frequency})`).join(", ");
          items.push({
            id: p.id,
            type: "Prescription",
            icon: "💊",
            dateStr: new Date(p.prescribedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dateObj: new Date(p.prescribedDate),
            doctor: `Dr. #${p.doctorId}`,
            title: `Medication Order #${p.id}`,
            summary: `Prescribed Medications: ${itemsSummary || "None listed."}\n\nStatus: ${p.status}`,
            color: "bg-green-100 text-green-600"
          });
        });

        // 3. Map Medical Documents (Lab reports, Imaging, summaries)
        documents.forEach((d) => {
          const isLab = d.documentType === "LAB_REPORT";
          items.push({
            id: d.id,
            type: isLab ? "Lab Report" : "Imaging",
            icon: isLab ? "🔬" : "🫁",
            dateStr: new Date(d.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dateObj: new Date(d.uploadedAt),
            doctor: "Uploaded to Patient Profile",
            title: d.title,
            summary: d.notes || "No notes attached to this document file.",
            color: isLab ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"
          });
        });

        // Sort chronologically (latest first)
        items.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
        setTimeline(items);
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err, "Failed to load medical records."));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = timeline.filter((r) => typeFilter === "All" || r.type === typeFilter);

  return (
    <div>
      <PageHeader title="Medical Records" subtitle="Your complete medical history" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {["All", "Consultation Notes", "Lab Report", "Prescription", "Imaging"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              typeFilter === t
                ? "bg-[#1E3A5F] text-white"
                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Compiling your health timeline…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
          No medical records found in this category.
        </div>
      ) : (
        /* Timeline */
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />
          <div className="space-y-5 pl-14">
            {filtered.map((r, i) => (
              <div key={i} className="relative">
                <div
                  className={`absolute -left-9 top-3 w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-base border-2 border-white`}
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                >
                  {r.icon}
                </div>
                <div
                  className="bg-white rounded-xl p-5 border border-[#E2E8F0] hover:shadow-md transition-all"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{r.type}</span>
                        <span className="text-[10px] text-[#64748B]">· {r.dateStr}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-[#0F172A] mb-1">{r.title}</h4>
                      <p className="text-xs text-[#64748B] leading-relaxed whitespace-pre-line truncate max-w-xl">
                        {r.summary}
                      </p>
                      <p className="text-[10px] font-medium text-[#94A3B8] mt-2">{r.doctor}</p>
                    </div>
                    <button
                      onClick={() => setSelected(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] hover:bg-[#F0F4F8] shrink-0 cursor-pointer transition-colors"
                    >
                      <Eye size={12} />View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  <h3 className="font-bold text-[#0F172A] text-base">{selected.title}</h3>
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
                <p className="text-[#64748B] font-medium mb-1.5">Clinical Narrative & Details:</p>
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