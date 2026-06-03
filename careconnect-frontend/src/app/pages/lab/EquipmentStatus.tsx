import { useEffect, useState } from "react";
import { Plus, Wrench, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, EquipmentResponse, MaintenanceResponse } from "../../../api/lab.api";

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
  const [equipment, setEquipment] = useState<EquipmentResponse[]>([]);
  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <PageHeader
        title="Equipment Status"
        subtitle="Monitor lab equipment and maintenance schedules"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a]">
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
                  {eq.status !== "OPERATIONAL" && (
                    <button className="mt-4 w-full h-8 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5">
                      <AlertTriangle size={12} />View Issue
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Maintenance Log */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-semibold text-[#0F172A]">Maintenance Log</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EF4444]/10 text-[#EF4444] text-xs font-medium hover:bg-[#EF4444]/20">
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
    </div>
  );
}
