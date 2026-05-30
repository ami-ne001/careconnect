import { Plus, Wrench, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const equipment = [
  { name: "Hematology Analyzer", type: "Blood Analysis", calibrated: "June 10, 2025", nextDue: "July 10, 2025", status: "operational" },
  { name: "Centrifuge Unit B", type: "Sample Preparation", calibrated: "May 28, 2025", nextDue: "June 20, 2025", status: "maintenance" },
  { name: "Urine Analyzer", type: "Urinalysis", calibrated: "June 5, 2025", nextDue: "July 5, 2025", status: "operational" },
  { name: "Biochemistry Analyzer", type: "Chemistry Panel", calibrated: "June 8, 2025", nextDue: "July 8, 2025", status: "operational" },
  { name: "Coagulation Analyzer", type: "Coagulation Tests", calibrated: "May 15, 2025", nextDue: "June 15, 2025", status: "offline" },
  { name: "Microscope Set A", type: "Microscopy", calibrated: "June 12, 2025", nextDue: "July 12, 2025", status: "operational" },
];

const maintenanceLog = [
  { equipment: "Centrifuge Unit B", issue: "Vibration and noise during operation", technician: "Eng. David Park", date: "June 14, 2025", resolution: "In Progress" },
  { equipment: "Coagulation Analyzer", issue: "Sensor calibration failure — unit offline", technician: "Eng. Sarah Lee", date: "June 13, 2025", resolution: "Pending Parts" },
  { equipment: "Hematology Analyzer", issue: "Routine maintenance and calibration", technician: "Eng. David Park", date: "June 10, 2025", resolution: "Resolved" },
  { equipment: "Urine Analyzer", issue: "Reagent flow sensor replaced", technician: "Eng. Sarah Lee", date: "June 5, 2025", resolution: "Resolved" },
  { equipment: "Biochemistry Analyzer", issue: "Software update required", technician: "Eng. David Park", date: "May 30, 2025", resolution: "Resolved" },
];

const statusConfig: Record<string, {
  label: string;
  variant: "active" | "pending" | "critical";
  icon: React.ReactNode;
  bg: string;
}> = {
  operational: { label: "Operational", variant: "active", icon: <CheckCircle size={16} className="text-[#10B981]" />, bg: "bg-[#F0FDF4]" },
  maintenance: { label: "Under Maintenance", variant: "pending", icon: <Wrench size={16} className="text-[#F59E0B]" />, bg: "bg-[#FFFBEB]" },
  offline: { label: "Offline", variant: "critical", icon: <XCircle size={16} className="text-[#EF4444]" />, bg: "bg-[#FEF2F2]" },
};

const resolutionVariant = (r: string) => {
  if (r === "Resolved") return "active";
  if (r === "In Progress") return "pending";
  return "inactive";
};

export function LabEquipmentStatus() {
  return (
    <div>
      <PageHeader
        title="Equipment Status"
        subtitle="Monitor lab equipment and maintenance schedules"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a]">
            <Plus size={15} />Report Issue
          </button>
        }
      />

      {/* Equipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        {equipment.map((eq) => {
          const cfg = statusConfig[eq.status];
          return (
            <div
              key={eq.name}
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
                  <span className="font-medium text-[#0F172A]">{eq.calibrated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Next Due</span>
                  <span className={`font-medium ${eq.status === "offline" ? "text-[#EF4444]" : "text-[#0F172A]"}`}>{eq.nextDue}</span>
                </div>
              </div>
              {eq.status !== "operational" && (
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
                {["Equipment", "Issue Reported", "Technician", "Date", "Resolution"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maintenanceLog.map((row, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{row.equipment}</td>
                  <td className="px-5 py-3.5 text-[#64748B] max-w-[200px]">{row.issue}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{row.technician}</td>
                  <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{row.date}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={resolutionVariant(row.resolution) as any} dot>{row.resolution}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
