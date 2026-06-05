import { useEffect, useState } from "react";
import { Plus, Wrench, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, EquipmentResponse, MaintenanceResponse } from "../../../api/lab.api";
import { useAuth } from "../../../store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../utils/apiError";

const statusConfig: Record<string, {
  label: string;
  variant: "active" | "pending" | "critical" | "inactive";
  icon: React.ReactNode;
  bg: string;
}> = {
  OPERATIONAL: { label: "Operational", variant: "active", icon: <CheckCircle size={16} className="text-[#10B981]" />, bg: "bg-[#F0FDF4]" },
  MAINTENANCE: { label: "Under Maintenance", variant: "pending", icon: <Wrench size={16} className="text-[#F59E0B]" />, bg: "bg-[#FFFBEB]" },
  OFFLINE: { label: "Offline", variant: "critical", icon: <XCircle size={16} className="text-[#EF4444]" />, bg: "bg-[#FEF2F2]" },
};

const resolutionVariant = (r: string) => {
  if (r === "RESOLVED") return "active";
  if (r === "IN_PROGRESS") return "pending";
  return "inactive"; // OPEN
};

export function LabEquipmentStatus() {
  const { userId } = useAuth();
  const [equipment, setEquipment] = useState<EquipmentResponse[]>([]);
  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  
  // Forms
  const [eqForm, setEqForm] = useState({ name: "", type: "", serialNumber: "", lastCalibrated: "", nextCalibration: "", notes: "" });
  const [issueForm, setIssueForm] = useState({ equipmentId: "", issue: "" });
  const [resolveForm, setResolveForm] = useState({ maintenanceId: 0, resolution: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const res = await labApi.getAllEquipment();
      setEquipment(res.data);
      
      // Load maintenance for all equipment to populate log
      const logs: MaintenanceResponse[] = [];
      for (const eq of res.data) {
        const mRes = await labApi.getMaintenanceHistory(eq.id);
        logs.push(...mRes.data);
      }
      // Sort by reported date descending
      logs.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
      setMaintenanceLog(logs);
    } catch (error) {
      console.error("Failed to load equipment data", error);
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentName = (id: number) => {
    const eq = equipment.find(e => e.id === id);
    return eq ? eq.name : `ID: ${id}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await labApi.createEquipment({
        name: eqForm.name,
        type: eqForm.type,
        serialNumber: eqForm.serialNumber,
        lastCalibrated: eqForm.lastCalibrated || undefined,
        nextCalibration: eqForm.nextCalibration || undefined,
        notes: eqForm.notes
      });
      toast.success("Equipment added successfully");
      setShowAddModal(false);
      setEqForm({ name: "", type: "", serialNumber: "", lastCalibrated: "", nextCalibration: "", notes: "" });
      loadEquipment();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add equipment"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    try {
      await labApi.reportMaintenance(Number(issueForm.equipmentId), {
        equipmentId: Number(issueForm.equipmentId),
        reportedBy: userId,
        issue: issueForm.issue
      });
      // Optionally update equipment status to MAINTENANCE
      await labApi.updateEquipmentStatus(Number(issueForm.equipmentId), "MAINTENANCE");
      toast.success("Issue reported successfully");
      setShowIssueModal(false);
      setIssueForm({ equipmentId: "", issue: "" });
      loadEquipment();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to report issue"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveForm.maintenanceId || !resolveForm.resolution) return;
    setSubmitting(true);
    try {
      await labApi.resolveMaintenance(resolveForm.maintenanceId, {
        status: "RESOLVED",
        resolution: resolveForm.resolution,
      });
      toast.success("Maintenance resolved successfully");
      setShowResolveModal(false);
      setResolveForm({ maintenanceId: 0, resolution: "" });
      loadEquipment();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to resolve maintenance"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Equipment Status"
        subtitle="Monitor lab equipment and maintenance schedules"
        actions={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a]">
            <Plus size={15} />Add Equipment
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center p-10"><span className="text-[#64748B]">Loading equipment data...</span></div>
      ) : (
        <>
          {/* Equipment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
            {equipment.map((eq) => {
              const cfg = statusConfig[eq.status] || statusConfig.OFFLINE;
              return (
                <div
                  key={eq.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-5"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      {cfg.icon}
                    </div>
                    <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                  </div>
                  <h4 className="font-semibold text-[#0F172A] mb-1">{eq.name}</h4>
                  <p className="text-sm text-[#64748B] mb-4">{eq.type}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Last Calibrated</span>
                      <span className="font-medium text-[#0F172A]">{formatDate(eq.lastCalibrated)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Next Due</span>
                      <span className={`font-medium ${eq.status === "OFFLINE" ? "text-[#EF4444]" : "text-[#0F172A]"}`}>
                        {formatDate(eq.nextCalibration)}
                      </span>
                    </div>
                  </div>
                  {eq.status !== "OPERATIONAL" && (() => {
                    const latestIssue = maintenanceLog.find(l => l.equipmentId === eq.id && l.status !== "RESOLVED");
                    return (
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => {
                            if (latestIssue) {
                              toast.info(`Current Issue: ${latestIssue.issue}`);
                            }
                          }}
                          className="flex-1 h-8 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5 cursor-pointer">
                          <AlertTriangle size={12} />View
                        </button>
                        {latestIssue && (
                          <button 
                            onClick={() => {
                              setResolveForm({ maintenanceId: latestIssue.id, resolution: "" });
                              setShowResolveModal(true);
                            }}
                            className="flex-1 h-8 rounded-lg bg-[#10B981] text-white text-xs font-medium hover:bg-[#059669] flex items-center justify-center gap-1.5 cursor-pointer">
                            <CheckCircle size={12} />Resolve
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          {/* Maintenance Log */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-semibold text-[#0F172A]">Maintenance Log</h3>
              <button onClick={() => setShowIssueModal(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EF4444]/10 text-[#EF4444] text-xs font-medium hover:bg-[#EF4444]/20 cursor-pointer">
                <Plus size={13} />Report Issue
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    {["Equipment", "Issue Reported", "Date", "Status", "Resolved At"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {maintenanceLog.map((row, i) => (
                    <tr key={row.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">{getEquipmentName(row.equipmentId)}</td>
                      <td className="px-5 py-3.5 text-[#64748B] max-w-[200px]">{row.issue}</td>
                      <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{formatDate(row.reportedAt)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={resolutionVariant(row.status) as any} dot>{row.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{formatDate(row.resolvedAt)}</td>
                    </tr>
                  ))}
                  {maintenanceLog.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-[#64748B]">No maintenance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">Add Equipment</h3>
              <button onClick={() => setShowAddModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Name <span className="text-red-500">*</span></label>
                <input required value={eqForm.name} onChange={e => setEqForm({...eqForm, name: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Type</label>
                <input value={eqForm.type} onChange={e => setEqForm({...eqForm, type: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Serial Number</label>
                <input value={eqForm.serialNumber} onChange={e => setEqForm({...eqForm, serialNumber: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Last Calibrated</label>
                    <input type="date" value={eqForm.lastCalibrated} onChange={e => setEqForm({...eqForm, lastCalibrated: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Next Calibration</label>
                    <input type="date" value={eqForm.nextCalibration} onChange={e => setEqForm({...eqForm, nextCalibration: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                 </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold disabled:opacity-50">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">Report Issue</h3>
              <button onClick={() => setShowIssueModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleReportIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Equipment <span className="text-red-500">*</span></label>
                <select required value={issueForm.equipmentId} onChange={e => setIssueForm({...issueForm, equipmentId: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                  <option value="">Select equipment...</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.type || 'N/A'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Issue Description <span className="text-red-500">*</span></label>
                <textarea required rows={4} value={issueForm.issue} onChange={e => setIssueForm({...issueForm, issue: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="Describe the problem..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowIssueModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 h-10 rounded-lg bg-[#EF4444] text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Issue Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">Resolve Maintenance</h3>
              <button onClick={() => setShowResolveModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleResolveIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Resolution Details <span className="text-red-500">*</span></label>
                <textarea required rows={4} value={resolveForm.resolution} onChange={e => setResolveForm({...resolveForm, resolution: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#10B981]" placeholder="Describe how the issue was fixed..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowResolveModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 h-10 rounded-lg bg-[#10B981] text-white text-sm font-semibold hover:bg-[#059669] disabled:opacity-50">Resolve</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
