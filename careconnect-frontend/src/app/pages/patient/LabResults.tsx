import { useState, useEffect } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, patientApi } from "@/api";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LabRequestResponse, LabResultResponse } from "@/api/lab.api";

interface ExtendedLabRequest extends LabRequestResponse {
  result?: LabResultResponse | null;
}

export function PatientLabResults() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<ExtendedLabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    patientApi.getProfileByUserId(userId)
      .then(async ({ data: patProfile }) => {
        const { data: reqs } = await labApi.getLabRequestsByPatient(patProfile.id);
        
        // Fetch results for completed requests
        const reqsWithResults = await Promise.all(
          reqs.map(async (req) => {
            if (req.status === "COMPLETED") {
              try {
                const { data: res } = await labApi.getResultByLabRequestId(req.id);
                return { ...req, result: res };
              } catch (err) {
                console.error(`Failed to fetch result for lab request #${req.id}`, err);
                return { ...req, result: null };
              }
            }
            return { ...req, result: null };
          })
        );

        setRequests(reqsWithResults);
        if (reqsWithResults.length > 0) {
          setExpanded(reqsWithResults[0].id);
        }
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err, "Failed to load lab results."));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Parse resultData JSON safely
  const parseResultData = (resultDataRaw: string) => {
    try {
      const data = JSON.parse(resultDataRaw);
      return Object.entries(data).map(([name, val]) => {
        // If val is an object, try to extract details
        if (typeof val === "object" && val !== null) {
          const v = (val as any).value || "";
          const u = (val as any).unit || "";
          const r = (val as any).referenceRange || "";
          const normal = (val as any).normal !== false;
          return { name, value: v, unit: u, range: r, normal };
        }
        // Otherwise just return as string value
        return { name, value: String(val), unit: "—", range: "—", normal: true };
      });
    } catch {
      // Return a single fallback entry if not JSON
      return [{ name: "Result Summary", value: resultDataRaw, unit: "—", range: "—", normal: true }];
    }
  };

  return (
    <div>
      <PageHeader title="Lab Results" subtitle="View your laboratory test results and reports" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading your lab reports…</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
          No lab test requests or results found.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isExpanded = expanded === req.id;
            const dt = new Date(req.requestedAt);
            const formattedDate = dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const resultDetails = req.result ? parseResultData(req.result.resultData) : [];
            const hasAbnormal = resultDetails.some((d) => !d.normal);

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                {/* Header */}
                <button
                  className="w-full flex items-center justify-between p-5 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : req.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-xl">🧪</div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[#0F172A]">{req.testTypeName}</h4>
                        {hasAbnormal && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] text-[10px] font-medium">
                            Values Out of Range
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Req #{req.id} · Ordered by Dr. {req.doctorName || "Physician"} · {formattedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={req.status === "COMPLETED" ? "active" : "pending"} dot>
                      {req.status}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-[#64748B]" />
                    ) : (
                      <ChevronDown size={18} className="text-[#64748B]" />
                    )}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-[#E2E8F0]">
                    {req.status !== "COMPLETED" ? (
                      <div className="p-8 text-center text-sm text-[#64748B]">
                        This lab test is currently in <strong>{req.status}</strong> status. Results will appear here once processed.
                      </div>
                    ) : !req.result ? (
                      <div className="p-8 text-center text-sm text-[#94A3B8] italic">
                        Results are pending upload by the lab technician.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                                {["Test Parameter", "Your Value", "Unit", "Reference Range", "Status"].map((h) => (
                                  <th
                                    key={h}
                                    className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {resultDetails.map((d, i) => (
                                <tr
                                  key={i}
                                  className={`border-b border-[#F1F5F9] ${
                                    !d.normal ? "bg-[#FFF5F5]" : i % 2 === 1 ? "bg-[#FAFBFC]" : ""
                                  }`}
                                >
                                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{d.name}</td>
                                  <td className={`px-5 py-3.5 font-bold ${d.normal ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                                    {d.value}
                                  </td>
                                  <td className="px-5 py-3.5 text-[#64748B]">{d.unit}</td>
                                  <td className="px-5 py-3.5 text-[#64748B]">{d.range}</td>
                                  <td className="px-5 py-3.5">
                                    {d.normal ? (
                                      <span className="flex items-center gap-1 text-[#10B981] text-xs font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block" />
                                        Normal
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-[#EF4444] text-xs font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block" />
                                        Out of Range
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {req.result.interpretation && (
                          <div className="p-4 bg-[#EFF6FF] border-t border-[#DBEAFE] text-xs text-[#1E40AF]">
                            <strong>Clinical Interpretation:</strong> {req.result.interpretation}
                          </div>
                        )}
                        <div className="px-5 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                          <p className="text-[10px] text-[#64748B] text-center">
                            Results processed on {new Date(req.result.uploadedAt).toLocaleDateString()} · Certified by CareConnect Laboratory Service
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
