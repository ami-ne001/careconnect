import { useState, useEffect } from "react";
import { Plus, X, Search, Beaker, CheckCircle, AlertCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, LabRequestResponse, LabResultResponse } from "@/api/lab.api";
import { receptionistApi } from "@/api/receptionist.api";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

export function DoctorLabRequests() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<LabRequestResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  // Result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<LabResultResponse | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LabRequestResponse | null>(null);
  const [loadingResult, setLoadingResult] = useState(false);

  const loadData = () => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      labApi.getLabRequestsByDoctor(userId),
      receptionistApi.getPatientsList(0, 1000)
    ])
      .then(([{ data: labData }, { data: patientsData }]) => {
        setRequests(labData || []);
        
        const map: Record<number, string> = {};
        (patientsData?.content || []).forEach((p) => {
          if (p.userId) {
            map[p.userId] = `${p.firstName || ""} ${p.lastName || ""}`.trim() || `Patient #${p.userId}`;
          }
        });
        setPatients(map);
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err, "Failed to load lab requests."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const getPatientName = (patientId: number) =>
    patients[patientId] ?? `Patient #${patientId}`;

  const handleCancelRequest = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this lab request?")) return;
    try {
      await labApi.updateLabRequestStatus(id, "CANCELLED");
      toast.success("Lab request cancelled.");
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to cancel lab request."));
    }
  };

  const handleViewResult = async (req: LabRequestResponse) => {
    setSelectedRequest(req);
    setShowResultModal(true);
    setLoadingResult(true);
    try {
      const { data } = await labApi.getResultByLabRequestId(req.id);
      setSelectedResult(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to fetch lab result."));
      setSelectedResult(null);
    } finally {
      setLoadingResult(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED");
  const completedRequests = requests.filter((r) => r.status === "COMPLETED");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REQUESTED": return "bg-blue-100 text-blue-700";
      case "SAMPLE_RECEIVED": return "bg-amber-100 text-amber-700";
      case "PROCESSING": return "bg-purple-100 text-purple-700";
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div>
      <PageHeader
        title="Lab Requests"
        subtitle="Manage laboratory test requests and results"
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#E2E8F0]">
          <span className="animate-spin rounded-full h-8 w-8 border-3 border-[#0EA5E9] border-t-transparent mb-3" />
          <p className="text-sm text-[#64748B]">Loading lab data...</p>
        </div>
      ) : (
        <>
          {/* Pending */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] mb-6 shadow-sm">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A] flex items-center gap-2">
                <Beaker size={18} className="text-blue-500" /> Pending Requests
                <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{pendingRequests.length}</span>
              </h3>
            </div>
            {pendingRequests.length === 0 ? (
               <div className="p-8 text-center text-sm text-[#64748B]">No pending lab requests.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      {["Patient", "Test Requested", "Priority", "Requested Date", "Lab Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((r, i) => (
                      <tr key={r.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                        <td className="px-5 py-3.5 font-medium text-[#0F172A]">{getPatientName(r.patientId)}</td>
                        <td className="px-5 py-3.5 text-[#64748B] font-medium">{r.testTypeName || `Test #${r.testTypeId}`}</td>
                        <td className="px-5 py-3.5"><Badge variant={r.priority === "CRITICAL" || r.priority === "URGENT" ? "urgent" : "info"}>{r.priority}</Badge></td>
                        <td className="px-5 py-3.5 text-[#64748B]">{new Date(r.requestedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getStatusColor(r.status)}`}>{r.status.replace("_", " ")}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => handleCancelRequest(r.id)} className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Results Received */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A] flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> Results Received
                <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">{completedRequests.length}</span>
              </h3>
            </div>
            {completedRequests.length === 0 ? (
               <div className="p-8 text-center text-sm text-[#64748B]">No completed lab requests yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      {["Patient", "Test", "Priority", "Requested Date", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {completedRequests.map((r, i) => (
                      <tr key={r.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                        <td className="px-5 py-3.5 font-medium text-[#0F172A]">{getPatientName(r.patientId)}</td>
                        <td className="px-5 py-3.5 text-[#64748B] font-medium">{r.testTypeName || `Test #${r.testTypeId}`}</td>
                        <td className="px-5 py-3.5"><Badge variant={r.priority === "CRITICAL" || r.priority === "URGENT" ? "urgent" : "info"}>{r.priority}</Badge></td>
                        <td className="px-5 py-3.5 text-[#64748B]">{new Date(r.requestedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</td>
                        <td className="px-5 py-3.5">
                           <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getStatusColor(r.status)}`}>{r.status.replace("_", " ")}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => handleViewResult(r)} className="px-3 py-1.5 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-bold hover:bg-[#0EA5E9]/20 cursor-pointer">View Result</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Result Modal */}
      {showResultModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-[#0F172A]">Lab Result: {selectedRequest.testTypeName}</h3>
              <button onClick={() => setShowResultModal(false)} className="cursor-pointer p-1 hover:bg-gray-100 rounded-full"><X size={18} className="text-[#64748B]" /></button>
            </div>
            
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div><span className="text-gray-500 font-medium">Patient:</span> <span className="font-semibold">{getPatientName(selectedRequest.patientId)}</span></div>
              <div><span className="text-gray-500 font-medium">Requested:</span> <span className="font-semibold">{new Date(selectedRequest.requestedAt).toLocaleString()}</span></div>
              <div><span className="text-gray-500 font-medium">Priority:</span> <span className="font-semibold">{selectedRequest.priority}</span></div>
            </div>

            {loadingResult ? (
               <div className="flex justify-center p-8"><span className="animate-spin rounded-full h-8 w-8 border-3 border-[#0EA5E9] border-t-transparent" /></div>
            ) : selectedResult ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Result Data</p>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap border border-gray-200">
                    {selectedResult.resultData || "No data provided"}
                  </div>
                </div>
                {selectedResult.interpretation && (
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">Interpretation</p>
                    <div className="bg-blue-50 text-blue-900 p-4 rounded-xl text-sm border border-blue-100">
                      {selectedResult.interpretation}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Tested at: {new Date(selectedResult.testedAt).toLocaleString()}</p>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={16} /> Result not found or failed to load.
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowResultModal(false)} className="px-5 py-2 rounded-xl bg-[#1E3A5F] text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
