import { useState, useEffect } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, LabRequestResponse } from "../../../api/lab.api";
import { receptionistApi } from "../../../api/receptionist.api";
import { toast } from "sonner";

const stages = ["Sample Received", "Processing", "Completed"];

export function LabTestProcessing() {
  const [requests, setRequests] = useState<LabRequestResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqsRes, patientsRes] = await Promise.all([
        labApi.getAllLabRequests(),
        receptionistApi.getPatientsList(0, 1000)
      ]);
      
      setRequests(reqsRes.data);
      
      const pMap: Record<number, string> = {};
      (patientsRes.data.content || []).forEach(p => {
        if (p.userId) {
          pMap[p.userId] = `${p.firstName} ${p.lastName}`.trim();
        }
      });
      setPatients(pMap);
    } catch (error) {
      console.error("Failed to load requests", error);
      toast.error("Failed to load active processing tests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await labApi.updateLabRequestStatus(id, status);
      toast.success(`Request marked as ${status}`);
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getPatientName = (patientId: number) => {
    return patients[patientId] || `Patient #${patientId}`;
  };

  // Only show tests actively in the pipeline
  const activeTests = requests.filter(r => r.status === "SAMPLE_RECEIVED" || r.status === "PROCESSING");

  const getStageIndex = (status: string) => {
    if (status === "SAMPLE_RECEIVED") return 0;
    if (status === "PROCESSING") return 1;
    if (status === "COMPLETED") return 2;
    return -1;
  };

  return (
    <div>
      <PageHeader title="Test Processing" subtitle="Active tests currently being processed in the lab" />

      {loading ? (
        <div className="flex justify-center p-10"><span className="text-[#64748B]">Loading active processing tests...</span></div>
      ) : activeTests.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center">
          <p className="text-[#64748B]">No tests currently processing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {activeTests.map((test) => {
            const stage = getStageIndex(test.status);
            return (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#0F172A]">{test.testTypeName}</h4>
                    </div>
                    <p className="text-sm text-[#64748B]">LAB-{test.id} · {getPatientName(test.patientId)}</p>
                  </div>
                  <Badge variant="active" dot>In Progress</Badge>
                </div>

                <div className="p-5 space-y-4">
                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Requested At</p>
                      <p className="font-medium text-[#0F172A] flex items-center gap-1.5"><Clock size={13} className="text-[#0EA5E9]" />
                        {new Date(test.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B] mb-0.5">Priority</p>
                      <Badge variant={test.priority === "URGENT" || test.priority === "CRITICAL" ? "critical" : "inactive"}>{test.priority}</Badge>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div>
                    <p className="text-xs text-[#64748B] mb-2.5">Processing Stage</p>
                    <div className="flex items-center">
                      {stages.map((stageName, idx) => (
                        <div key={stageName} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                idx < stage
                                  ? "bg-[#10B981] border-[#10B981] text-white"
                                  : idx === stage
                                  ? "bg-[#0EA5E9] border-[#0EA5E9] text-white"
                                  : "bg-white border-[#E2E8F0] text-[#94A3B8]"
                              }`}
                            >
                              {idx < stage ? <CheckCircle size={14} /> : idx + 1}
                            </div>
                            <p className="text-[10px] text-center mt-1.5 leading-tight" style={{ color: idx <= stage ? "#0F172A" : "#94A3B8" }}>
                              {stageName}
                            </p>
                          </div>
                          {idx < stages.length - 1 && (
                            <div
                              className="h-0.5 flex-1 mb-4"
                              style={{ background: idx < stage ? "#10B981" : "#E2E8F0" }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    {test.status === "SAMPLE_RECEIVED" && (
                      <button onClick={() => handleUpdateStatus(test.id, "PROCESSING")} className="flex-1 h-9 rounded-lg bg-[#0EA5E9] text-white text-sm font-medium hover:bg-[#0284C7]">
                        Start Processing
                      </button>
                    )}
                    {test.status === "PROCESSING" && (
                      <a href="/lab/results-upload" className="flex-1 h-9 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] flex items-center justify-center gap-1.5">
                        <CheckCircle size={14} />Enter Results
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
