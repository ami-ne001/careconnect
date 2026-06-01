import { useEffect, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { clinicalApi, patientApi } from "@/api";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { PrescriptionResponse } from "@/api/clinical.api";

export function PatientPrescriptions() {
  const { userId } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    patientApi.getProfileByUserId(userId)
      .then(({ data: patProfile }) => {
        return clinicalApi.getPrescriptionsByPatient(patProfile.id);
      })
      .then(({ data }) => {
        setPrescriptions(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(getApiErrorMessage(err, "Failed to load prescriptions."));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Separate active vs historical prescriptions
  const active = prescriptions.filter((p) => p.status === "ACTIVE");
  const history = prescriptions.filter((p) => p.status !== "ACTIVE");

  return (
    <div>
      <PageHeader title="My Prescriptions" subtitle="Your current and past prescriptions" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading prescriptions…</span>
        </div>
      ) : (
        <>
          {/* Active */}
          <div className="mb-7">
            <h3 className="font-semibold text-[#0F172A] mb-4">Active Prescriptions</h3>
            {active.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-[#64748B]">
                No active prescriptions on file.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {active.map((p) => {
                  const dt = new Date(p.prescribedDate);
                  const formattedDate = dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl border-2 border-[#0EA5E9] p-5"
                      style={{ boxShadow: "0 4px 12px rgba(14,165,233,0.1)" }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-2xl">💊</div>
                          <div>
                            <h4 className="font-bold text-[#0F172A] text-sm">Order #{p.id}</h4>
                            <p className="text-xs text-[#64748B]">Prescribed by Dr. {p.doctorName || "Physician"}</p>
                          </div>
                        </div>
                        <Badge variant="active" dot>Active</Badge>
                      </div>

                      <div className="border-t border-[#F1F5F9] pt-3 space-y-3">
                        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Medications</p>
                        {p.items.map((item) => (
                          <div key={item.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg text-xs">
                            <p className="font-bold text-[#0F172A] mb-0.5">{item.medicationName}</p>
                            <div className="flex justify-between text-[#64748B] mt-1">
                              <span>Dosage: {item.dosage}</span>
                              <span>Frequency: {item.frequency}</span>
                              <span>Duration: {item.durationDays} Days</span>
                            </div>
                            {item.instructions && (
                              <p className="text-[10px] text-[#0EA5E9] mt-1.5 italic">
                                instructions: {item.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex justify-between text-xs text-[#64748B]">
                        <span>Prescribed: {formattedDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* History */}
          <div>
            <h3 className="font-semibold text-[#0F172A] mb-4">Prescription History</h3>
            {history.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-[#64748B]">
                No past prescriptions on record.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                        {["Order ID", "Prescribed By", "Date", "Medications", "Status"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => {
                        const dt = new Date(h.prescribedDate);
                        const formattedDate = dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                        const medsSummary = h.items.map(item => `${item.medicationName} (${item.dosage})`).join(", ");

                        return (
                          <tr key={h.id} className={`border-b border-[#F1F5F9] hover:bg-[#FAFBFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                            <td className="px-5 py-3.5 font-semibold text-[#0EA5E9]">#{h.id}</td>
                            <td className="px-5 py-3.5 text-[#64748B]">Dr. {h.doctorName || "Physician"}</td>
                            <td className="px-5 py-3.5 text-[#64748B]">{formattedDate}</td>
                            <td className="px-5 py-3.5 text-[#0F172A] max-w-xs truncate" title={medsSummary}>
                              {medsSummary || "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge variant="inactive" dot>
                                {h.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
