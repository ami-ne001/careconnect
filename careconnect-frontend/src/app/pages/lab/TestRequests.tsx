import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, LabRequestResponse } from "../../../api/lab.api";
import { toast } from "sonner";
import { receptionistApi } from "../../../api/receptionist.api";

const statusConfig: Record<string, { label: string; variant: "active" | "pending" | "completed" | "inactive" | "critical" }> = {
  REQUESTED: { label: "Awaiting Sample", variant: "pending" },
  SAMPLE_RECEIVED: { label: "Sample Received", variant: "inactive" },
  PROCESSING: { label: "In Progress", variant: "active" },
  COMPLETED: { label: "Completed", variant: "completed" },
  CANCELLED: { label: "Cancelled", variant: "critical" },
};

export function LabTestRequests() {
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
      toast.error("Failed to load lab requests");
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

  // Filter for requests that are just arriving (REQUESTED or SAMPLE_RECEIVED)
  const incomingRequests = requests.filter(r => r.status === "REQUESTED" || r.status === "SAMPLE_RECEIVED");

  return (
    <div>
      <PageHeader title="Test Requests" subtitle="Incoming laboratory test requests from clinical departments" />

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input placeholder="Search requests..." className="w-full h-9 pl-8 pr-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]" />
          </div>
          <select className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none bg-white">
            <option>All Priorities</option>
            <option>Urgent</option>
            <option>Normal</option>
          </select>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  {["Test ID", "Patient", "Test Type", "Priority", "Date Requested", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incomingRequests.map((req, i) => {
                  const cfg = statusConfig[req.status] || statusConfig.REQUESTED;
                  return (
                    <tr key={req.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                      <td className="px-4 py-3.5 font-medium text-[#0EA5E9]">LAB-{req.id}</td>
                      <td className="px-4 py-3.5 font-medium text-[#0F172A]">{getPatientName(req.patientId)}</td>
                      <td className="px-4 py-3.5 text-[#0F172A]">{req.testTypeName}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={req.priority === "URGENT" || req.priority === "CRITICAL" ? "critical" : "inactive"}>
                          {req.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">
                        {new Date(req.requestedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3.5"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2">
                          {req.status === "REQUESTED" && (
                            <button onClick={() => handleUpdateStatus(req.id, "SAMPLE_RECEIVED")} className="px-2.5 py-1 rounded-lg bg-[#F0FDF4] text-[#10B981] text-xs font-medium hover:bg-[#10B981]/20">
                              Mark Received
                            </button>
                          )}
                          {req.status === "SAMPLE_RECEIVED" && (
                            <button onClick={() => handleUpdateStatus(req.id, "PROCESSING")} className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#0EA5E9] text-xs font-medium hover:bg-[#0EA5E9]/20">
                              Start Processing
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {incomingRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#64748B]">No incoming requests found.</td>
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
