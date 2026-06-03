import { useState, useEffect } from "react";
import { Upload, CheckCircle, Search, AlertCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { labApi, LabRequestResponse } from "../../../api/lab.api";
import { receptionistApi } from "../../../api/receptionist.api";
import { useAuth } from "../../../store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../utils/apiError";

export function LabResultsUpload() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<LabRequestResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const [selectedTestId, setSelectedTestId] = useState<number | "">("");
  const [resultData, setResultData] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recentlyUploaded, setRecentlyUploaded] = useState<LabRequestResponse[]>([]);

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

      // Pre-fill recently uploaded based on COMPLETED status today
      const today = new Date().toDateString();
      const completed = reqsRes.data.filter(r => r.status === "COMPLETED" && new Date(r.requestedAt).toDateString() === today);
      setRecentlyUploaded(completed.slice(0, 5));

    } catch (error) {
      console.error("Failed to load requests for upload", error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patientId: number) => {
    return patients[patientId] || `Patient #${patientId}`;
  };

  const handleSubmit = async () => {
    if (!selectedTestId || !userId) {
      toast.error("Select a test to upload results for.");
      return;
    }
    if (!resultData.trim()) {
      toast.error("Result values are required.");
      return;
    }

    try {
      setSubmitting(true);
      await labApi.uploadResult({
        labRequestId: Number(selectedTestId),
        technicianId: userId,
        resultData,
        interpretation
      });
      
      toast.success("Results uploaded successfully and doctor notified.");
      
      // Update UI state
      setResultData("");
      setInterpretation("");
      const completedReq = requests.find(r => r.id === Number(selectedTestId));
      if (completedReq) {
        setRecentlyUploaded([completedReq, ...recentlyUploaded]);
      }
      setSelectedTestId("");
      
      // Reload queue
      loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to upload result"));
    } finally {
      setSubmitting(false);
    }
  };

  const processingTests = requests.filter(r => r.status === "PROCESSING");
  const selectedTest = requests.find(r => r.id === Number(selectedTestId));

  return (
    <div>
      <PageHeader title="Results Upload" subtitle="Enter and upload laboratory test results" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-5 flex items-center gap-2">
              <Upload size={18} className="text-[#0EA5E9]"/> Enter Test Results
            </h3>

            {/* Test Selector */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Select In-Progress Test</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-11 pl-9 pr-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] bg-white appearance-none cursor-pointer"
                >
                  <option value="">— Select a test in PROCESSING status —</option>
                  {processingTests.map((t) => (
                    <option key={t.id} value={t.id}>LAB-{t.id} — {getPatientName(t.patientId)} — {t.testTypeName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Patient Info (auto-fill) */}
            {selectedTest && (
              <div className="mb-5 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-4 text-sm animate-fadeIn">
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider font-semibold mb-1">Patient</p>
                  <p className="font-medium text-[#0F172A]">{getPatientName(selectedTest.patientId)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider font-semibold mb-1">Test Type</p>
                  <p className="font-medium text-[#0F172A]">{selectedTest.testTypeName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] uppercase tracking-wider font-semibold mb-1">Priority</p>
                  <p className={`font-bold ${selectedTest.priority === "URGENT" || selectedTest.priority === "CRITICAL" ? "text-red-500" : "text-[#0EA5E9]"}`}>
                    {selectedTest.priority}
                  </p>
                </div>
              </div>
            )}

            {/* Result Data Text Area */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Result Values / Data</label>
              <textarea
                value={resultData}
                onChange={(e) => setResultData(e.target.value)}
                rows={6}
                placeholder="Enter result values, findings, or paste structured data here..."
                className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                disabled={!selectedTestId}
              />
            </div>

            {/* Interpretation */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Clinical Interpretation / Notes</label>
              <textarea
                value={interpretation}
                onChange={(e) => setInterpretation(e.target.value)}
                rows={3}
                placeholder="Add technician notes, anomalies, or interpretation..."
                className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] resize-none"
                disabled={!selectedTestId}
              />
            </div>

            {/* Actions */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedTestId || !resultData.trim()}
              className="w-full h-11 rounded-lg bg-[#0EA5E9] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#0284C7] disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <><Upload size={16} /> Submit Result & Notify Doctor</>
              )}
            </button>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] self-start" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="font-semibold text-[#0F172A] flex items-center gap-2">
              <CheckCircle size={16} className="text-[#10B981]" /> Recently Uploaded
            </h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {recentlyUploaded.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#64748B]">No results uploaded today.</div>
            ) : (
              recentlyUploaded.map((item, i) => (
                <div key={i} className="p-4 hover:bg-[#F8FAFC]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-[#0F172A]">{getPatientName(item.patientId)}</p>
                    <span className="text-xs text-[#64748B]">LAB-{item.id}</span>
                  </div>
                  <p className="text-xs font-medium text-[#0EA5E9]">{item.testTypeName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
