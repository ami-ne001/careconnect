import { useState, useEffect } from "react";
import { Search, Clock, CheckCircle, ArrowRight, Upload, FlaskConical } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, LabRequestResponse } from "../../../api/lab.api";
import { toast } from "sonner";
import { receptionistApi } from "../../../api/receptionist.api";
import { useNavigate } from "react-router";

export function LabTestRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LabRequestResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "processing" | "completed">("pending");
  const [searchQuery, setSearchQuery] = useState("");

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
      toast.error("Failed to load lab workflow data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await labApi.updateLabRequestStatus(id, status);
      toast.success(`Request status updated to ${status}`);
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getPatientName = (patientId: number) => {
    return patients[patientId] || `Patient #${patientId}`;
  };

  const filteredRequests = requests.filter(req => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      `LAB-${req.id}`.toLowerCase().includes(q) ||
      getPatientName(req.patientId).toLowerCase().includes(q) ||
      req.testTypeName.toLowerCase().includes(q);
      
    if (!matchesSearch) return false;

    if (activeTab === "pending") return req.status === "REQUESTED" || req.status === "SAMPLE_RECEIVED";
    if (activeTab === "processing") return req.status === "PROCESSING";
    if (activeTab === "completed") return req.status === "COMPLETED";
    return false;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED": return <Badge variant="pending">Awaiting Sample</Badge>;
      case "SAMPLE_RECEIVED": return <Badge variant="inactive">Sample Received</Badge>;
      case "PROCESSING": return <Badge variant="active" dot>Processing</Badge>;
      case "COMPLETED": return <Badge variant="active">Completed</Badge>;
      default: return <Badge variant="inactive">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Test Workflow" subtitle="Manage incoming lab requests, processing, and results" />

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex-1 flex flex-col" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div
            className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] w-fit overflow-x-auto"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "pending" ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Pending & Incoming
              {requests.filter(r => r.status === "REQUESTED" || r.status === "SAMPLE_RECEIVED").length > 0 && (
                <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${activeTab === "pending" ? "bg-[#0EA5E9] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                  {requests.filter(r => r.status === "REQUESTED" || r.status === "SAMPLE_RECEIVED").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("processing")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "processing" ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              In Processing
              {requests.filter(r => r.status === "PROCESSING").length > 0 && (
                <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${activeTab === "processing" ? "bg-[#0EA5E9] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                  {requests.filter(r => r.status === "PROCESSING").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "completed" ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Completed
              {requests.filter(r => r.status === "COMPLETED").length > 0 && (
                <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${activeTab === "completed" ? "bg-[#0EA5E9] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                  {requests.filter(r => r.status === "COMPLETED").length}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input 
              placeholder="Search by patient, test name, or ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] bg-white" 
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center p-10"><span className="text-[#64748B]">Loading workflow...</span></div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  {["Test ID", "Patient", "Test Type", "Priority", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, i) => {
                  const isUrgent = req.priority === "URGENT" || req.priority === "CRITICAL";
                  return (
                    <tr key={req.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                      <td className="px-5 py-3.5 font-medium text-[#0EA5E9]">LAB-{req.id}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">{getPatientName(req.patientId)}</td>
                      <td className="px-5 py-3.5 text-[#0F172A] flex items-center gap-2">
                        <FlaskConical size={14} className="text-[#64748B]" />
                        {req.testTypeName}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={isUrgent ? "critical" : "inactive"}>{req.priority}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">
                        {new Date(req.requestedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2 items-center">
                          {req.status === "REQUESTED" && (
                            <button onClick={() => handleUpdateStatus(req.id, "SAMPLE_RECEIVED")} className="px-3 py-1.5 rounded-lg bg-[#F0FDF4] text-[#10B981] border border-[#10B981]/20 text-xs font-medium hover:bg-[#10B981]/10">
                              Mark Received
                            </button>
                          )}
                          {req.status === "SAMPLE_RECEIVED" && (
                            <button onClick={() => handleUpdateStatus(req.id, "PROCESSING")} className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#0EA5E9] border border-[#0EA5E9]/20 text-xs font-medium hover:bg-[#0EA5E9]/10 flex items-center gap-1.5">
                              Process <ArrowRight size={12} />
                            </button>
                          )}
                          {req.status === "PROCESSING" && (
                            <button onClick={() => navigate(`/lab/results-upload/${req.id}`)} className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#162d4a] flex items-center gap-1.5">
                              <Upload size={12} /> Enter Results
                            </button>
                          )}
                          {req.status === "COMPLETED" && (
                            <span className="text-[#10B981] flex items-center gap-1 text-xs font-medium">
                              <CheckCircle size={14} /> Done
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#64748B]">
                      {searchQuery ? "No matching requests found." : `No ${activeTab} requests found.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
