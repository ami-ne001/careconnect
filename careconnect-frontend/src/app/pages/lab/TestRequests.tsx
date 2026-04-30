import { Search } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const requests = [
  { id: "LAB-4421", patient: "John Whitaker", doctor: "Dr. Alan Park", test: "Thyroid Panel", sample: "Blood", priority: "normal", datetime: "June 14, 08:20", status: "awaiting_sample" },
  { id: "LAB-4422", patient: "Ahmed Al-Farsi", doctor: "Dr. Sarah Mitchell", test: "Complete Blood Count", sample: "Blood", priority: "normal", datetime: "June 14, 08:45", status: "sample_received" },
  { id: "LAB-4423", patient: "Maria Santos", doctor: "Dr. Sarah Mitchell", test: "Lipid Panel", sample: "Blood", priority: "urgent", datetime: "June 14, 09:10", status: "in_progress" },
  { id: "LAB-4424", patient: "Linda Chen", doctor: "Dr. Emily Ross", test: "Basic Metabolic Panel", sample: "Blood", priority: "normal", datetime: "June 14, 09:30", status: "awaiting_sample" },
  { id: "LAB-4425", patient: "Carlos Rivera", doctor: "Dr. Mark Chen", test: "Liver Function Tests", sample: "Blood", priority: "urgent", datetime: "June 14, 09:50", status: "sample_received" },
  { id: "LAB-4426", patient: "Priya Sharma", doctor: "Dr. Sarah Mitchell", test: "Urinalysis", sample: "Urine", priority: "normal", datetime: "June 14, 10:05", status: "awaiting_sample" },
  { id: "LAB-4427", patient: "Robert James", doctor: "Dr. Alan Park", test: "HbA1c", sample: "Blood", priority: "normal", datetime: "June 14, 10:15", status: "awaiting_sample" },
  { id: "LAB-4428", patient: "Fatima Al-Sayed", doctor: "Dr. Emily Ross", test: "Coagulation Panel", sample: "Blood", priority: "urgent", datetime: "June 14, 10:30", status: "sample_received" },
  { id: "LAB-4429", patient: "Kevin Yip", doctor: "Dr. Mark Chen", test: "Urine Culture", sample: "Urine", priority: "normal", datetime: "June 14, 10:45", status: "awaiting_sample" },
  { id: "LAB-4430", patient: "Diana Collins", doctor: "Dr. Sarah Mitchell", test: "Vitamin D Level", sample: "Blood", priority: "normal", datetime: "June 14, 11:00", status: "in_progress" },
  { id: "LAB-4431", patient: "Noah Sato", doctor: "Dr. Alan Park", test: "Iron Studies", sample: "Blood", priority: "normal", datetime: "June 14, 11:15", status: "awaiting_sample" },
  { id: "LAB-4432", patient: "Amara Diallo", doctor: "Dr. Emily Ross", test: "Renal Function Panel", sample: "Blood", priority: "urgent", datetime: "June 14, 11:30", status: "sample_received" },
];

const statusConfig: Record<string, { label: string; variant: "active" | "pending" | "completed" | "inactive" | "critical" }> = {
  awaiting_sample: { label: "Awaiting Sample", variant: "pending" },
  sample_received: { label: "Sample Received", variant: "inactive" },
  in_progress: { label: "In Progress", variant: "active" },
  completed: { label: "Completed", variant: "completed" },
};

export function LabTestRequests() {
  return (
    <div>
      <PageHeader title="Test Requests" subtitle="Incoming laboratory test requests" />

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
          <select className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none bg-white">
            <option>All Status</option>
            <option>Awaiting Sample</option>
            <option>Sample Received</option>
            <option>In Progress</option>
          </select>
          <select className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] focus:outline-none bg-white">
            <option>All Test Types</option>
            <option>Blood</option>
            <option>Urine</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {["Test ID", "Patient", "Ordering Doctor", "Test Type", "Sample Type", "Priority", "Date/Time Requested", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => (
                <tr key={req.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                  <td className="px-4 py-3.5 font-medium text-[#0EA5E9]">{req.id}</td>
                  <td className="px-4 py-3.5 font-medium text-[#0F172A]">{req.patient}</td>
                  <td className="px-4 py-3.5 text-[#64748B]">{req.doctor}</td>
                  <td className="px-4 py-3.5 text-[#0F172A]">{req.test}</td>
                  <td className="px-4 py-3.5 text-[#64748B]">{req.sample}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={req.priority === "urgent" ? "critical" : "inactive"}>
                      {req.priority === "urgent" ? "Urgent" : "Normal"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{req.datetime}</td>
                  <td className="px-4 py-3.5"><Badge variant={statusConfig[req.status].variant}>{statusConfig[req.status].label}</Badge></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <button className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#0EA5E9] text-xs font-medium hover:bg-[#0EA5E9]/20">
                        Assign
                      </button>
                      {req.status === "awaiting_sample" && (
                        <button className="px-2.5 py-1 rounded-lg bg-[#F0FDF4] text-[#10B981] text-xs font-medium hover:bg-[#10B981]/20">
                          Mark Received
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-[#E2E8F0] text-sm text-[#64748B]">
          Showing 1–12 of 12 requests
        </div>
      </div>
    </div>
  );
}
