import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, ConsultationResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";
import type { PatientProfileResponse } from "../../../types/patient.types";

export function DoctorPatients() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [patientList, setPatientList] = useState<PatientProfileResponse[]>([]);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    clinicalApi.getConsultationsByDoctor(userId).then(r => {
      setConsultations(r.data);
      const uniqueIds = Array.from(new Set(r.data.map(c => c.patientId)));
      Promise.all(uniqueIds.map(id => patientApi.getProfileById(id).then(p => p.data).catch(() => null)))
        .then(results => {
          setPatientList(results.filter(Boolean) as PatientProfileResponse[]);
          setLoading(false);
        });
    }).catch(() => setLoading(false));
  }, [userId]);

  const getLatestConsultation = (patientId: number) => {
    const pConsults = consultations.filter(c => c.patientId === patientId);
    if (pConsults.length === 0) return null;
    return pConsults.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
  };

  const filtered = patientList.filter((p) => {
    const name = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
    const latestC = getLatestConsultation(p.id);
    const diag = latestC?.diagnosis?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || diag.includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader title="Patients" subtitle="Your assigned patient list" />

      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] mb-5 flex gap-3 items-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-3 py-2 flex-1">
          <Search size={15} className="text-[#64748B]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients by name or diagnosis..." className="bg-transparent text-sm w-full outline-none text-[#0F172A] placeholder:text-[#94A3B8]" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading patients…</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Patient", "Blood Type", "Primary Diagnosis", "Last Visit", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const latestC = getLatestConsultation(p.id);
                  const name = `${p.firstName || ""} ${p.lastName || ""}`.trim();
                  const initials = p.firstName && p.lastName ? `${p.firstName[0]}${p.lastName[0]}` : "P";
                  return (
                    <tr key={p.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#0EA5E9] text-xs font-semibold">
                            {initials}
                          </div>
                          <span className="font-medium text-[#0F172A]">{name || `Patient #${p.id}`}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.bloodType ? <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-semibold">{p.bloodType}</span> : <span className="text-[#94A3B8]">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-[#64748B]">{latestC?.diagnosis || "—"}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{latestC ? new Date(latestC.startedAt).toLocaleDateString() : "—"}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => navigate(`/doctor/patients/${p.id}`)} className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:opacity-90">View Profile</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-sm text-[#64748B] text-center">No patients found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
