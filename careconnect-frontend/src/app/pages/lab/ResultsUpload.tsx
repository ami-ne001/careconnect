import { useState, useEffect } from "react";
import { Upload, ArrowLeft, FlaskConical, AlertCircle, CheckCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { labApi, LabRequestResponse, ReferenceRangeResponse } from "../../../api/lab.api";
import { patientApi } from "../../../api/patient.api";
import { useAuth } from "../../../store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../utils/apiError";
import { useParams, useNavigate } from "react-router";

export function LabResultsUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [request, setRequest] = useState<LabRequestResponse | null>(null);
  const [patientName, setPatientName] = useState("");
  const [referenceRanges, setReferenceRanges] = useState<ReferenceRangeResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [resultValues, setResultValues] = useState<Record<string, string>>({});
  const [unstructuredData, setUnstructuredData] = useState("");
  const [interpretation, setInterpretation] = useState("");

  useEffect(() => {
    if (id) {
      loadData(Number(id));
    }
  }, [id]);

  const loadData = async (reqId: number) => {
    try {
      setLoading(true);

      // 1. Fetch Request
      const reqRes = await labApi.getAllLabRequests(); // (or get by id if we implement it)
      const req = reqRes.data.find(r => r.id === reqId);

      if (!req) {
        toast.error("Lab request not found.");
        navigate("/lab/test-requests");
        return;
      }

      setRequest(req);

      // 2. Fetch Patient Name
      try {
        const pRes = await patientApi.getProfileById(req.patientId);
        setPatientName(`${pRes.data.firstName} ${pRes.data.lastName}`.trim());
      } catch (e) {
        setPatientName(`Patient #${req.patientId}`);
      }

      // 3. Fetch Reference Ranges
      const rangeRes = await labApi.getReferenceRanges(req.testTypeId);
      setReferenceRanges(rangeRes.data);

      // Initialize results object
      const initialVals: Record<string, string> = {};
      rangeRes.data.forEach(r => {
        initialVals[r.component] = "";
      });
      setResultValues(initialVals);

    } catch (error) {
      console.error("Failed to load upload data", error);
      toast.error("Failed to load test details");
    } finally {
      setLoading(false);
    }
  };

  const handleComponentChange = (component: string, value: string) => {
    setResultValues(prev => ({ ...prev, [component]: value }));
  };

  const handleSubmit = async () => {
    if (!request || !userId) return;

    // Check if any structured data is missing
    const missingStructured = referenceRanges.some(r => !resultValues[r.component]?.trim());
    if (referenceRanges.length > 0 && missingStructured) {
      toast.error("Please fill in all reference range fields.");
      return;
    }

    if (referenceRanges.length === 0 && !unstructuredData.trim()) {
      toast.error("Please provide result data.");
      return;
    }

    try {
      setSubmitting(true);

      // Construct final result data
      let finalData = "";
      if (referenceRanges.length > 0) {
        finalData = JSON.stringify(resultValues, null, 2);
      } else {
        finalData = unstructuredData;
      }

      await labApi.uploadResult({
        labRequestId: request.id,
        technicianId: userId,
        resultData: finalData,
        interpretation
      });

      toast.success("Results uploaded successfully and doctor notified.");
      navigate("/lab/test-requests");

    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to upload result"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <span className="text-[#64748B] mb-4">Loading test parameters...</span>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="w-full pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/lab/test-requests")}
          className="w-10 h-10 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Enter Lab Results</h1>
          <p className="text-sm text-[#64748B]">Input measured values against defined reference ranges</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column - Forms */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <h3 className="font-semibold text-[#0F172A] flex items-center gap-2">
                <FlaskConical size={18} className="text-[#0EA5E9]" /> Result Data
              </h3>
            </div>

            <div className="p-6">
              {referenceRanges.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {/* Header Row */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-[#F1F5F9] rounded-lg text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    <div className="col-span-4">Component</div>
                    <div className="col-span-3">Reference Range</div>
                    <div className="col-span-2">Gender</div>
                    <div className="col-span-3">Result Value</div>
                  </div>
                  {/* Data Rows */}
                  {referenceRanges.map((range) => (
                    <div key={range.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors">
                      <div className="col-span-4 font-semibold text-[#0F172A] text-sm">
                        {range.component}
                      </div>
                      <div className="col-span-3 text-xs text-[#64748B] font-mono">
                        {range.minValue} - {range.maxValue} {range.unit}
                      </div>
                      <div className="col-span-2 text-xs text-[#64748B]">
                        {range.gender ? (
                          <span className="px-2 py-0.5 rounded bg-[#E2E8F0]">{range.gender}</span>
                        ) : (
                          <span className="text-[#94A3B8]">Any</span>
                        )}
                      </div>
                      <div className="col-span-3 relative">
                        <input
                          type="number"
                          step="any"
                          value={resultValues[range.component] || ""}
                          onChange={(e) => handleComponentChange(range.component, e.target.value)}
                          placeholder="Value"
                          className="w-full h-9 px-3 pr-10 rounded-md border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white font-medium"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#94A3B8]">{range.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-[#64748B]">No structured reference ranges defined for this test type. Please enter unstructured result data.</p>
                  <textarea
                    rows={8}
                    value={unstructuredData}
                    onChange={(e) => setUnstructuredData(e.target.value)}
                    placeholder="Enter result findings, values, or observations here..."
                    className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Interpretation block moved to right column */}
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="bg-[#1E3A5F] rounded-xl text-white p-6 shadow-lg">
            <h3 className="font-bold mb-4 opacity-90 border-b border-white/10 pb-3">Request Summary</h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Test Type</p>
                <p className="font-semibold text-lg">{request.testTypeName}</p>
              </div>

              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Request ID</p>
                <p className="font-mono">LAB-{request.id}</p>
              </div>

              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Patient</p>
                <p className="font-medium">{patientName}</p>
              </div>

              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Priority</p>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${request.priority === "URGENT" || request.priority === "CRITICAL" ? "bg-red-500 text-white" : "bg-white/20 text-white"
                  }`}>
                  {request.priority}
                </span>
              </div>

              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Requested At</p>
                <p>{new Date(request.requestedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm flex flex-col">
            <div className="p-6">
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Clinical Interpretation & Notes</label>
              <textarea
                value={interpretation}
                onChange={(e) => setInterpretation(e.target.value)}
                rows={4}
                placeholder="Add technician notes, anomalies, or interpretation for the doctor..."
                className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none"
              />
            </div>

            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0]">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-11 rounded-lg bg-[#0EA5E9] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#0284C7] disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <><CheckCircle size={16} /> Complete & Upload Results</>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
