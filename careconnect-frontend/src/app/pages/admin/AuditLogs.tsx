import { useState } from "react";
import { Search, Download, Filter } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

const logs = [
  { ts: "2025-06-14 10:32", user: "Admin David Nguyen", role: "Admin", action: "DELETE", module: "User Management", details: "Removed user acc. ID #4821", ip: "192.168.1.10" },
  { ts: "2025-06-14 10:18", user: "Dr. Sarah Mitchell", role: "Doctor", action: "CREATE", module: "Prescriptions", details: "New prescription for Ahmed Al-Farsi", ip: "10.0.0.42" },
  { ts: "2025-06-14 10:05", user: "Emma Roberts", role: "Receptionist", action: "CREATE", module: "Patient Registration", details: "New patient: Yasmine Tazi", ip: "10.0.0.15" },
  { ts: "2025-06-14 09:58", user: "Marcus Webb", role: "Pharmacist", action: "UPDATE", module: "Medication Inventory", details: "Restocked Metformin 500mg +200 units", ip: "10.0.0.33" },
  { ts: "2025-06-14 09:47", user: "Admin David Nguyen", role: "Admin", action: "UPDATE", module: "System Config", details: "Changed password policy: min 10 chars", ip: "192.168.1.10" },
  { ts: "2025-06-14 09:31", user: "Dr. Alan Park", role: "Doctor", action: "VIEW", module: "Medical Records", details: "Accessed record of John Whitaker", ip: "10.0.0.56" },
  { ts: "2025-06-14 09:22", user: "Priya Nair", role: "Lab Tech", action: "CREATE", module: "Results Upload", details: "Uploaded CBC results for Maria Santos", ip: "10.0.0.71" },
  { ts: "2025-06-14 09:14", user: "Dr. Sarah Mitchell", role: "Doctor", action: "LOGIN", module: "Auth", details: "Successful login", ip: "10.0.0.42" },
  { ts: "2025-06-14 09:10", user: "Nurse Linda Torres", role: "Nurse", action: "UPDATE", module: "Vitals Monitoring", details: "Updated vitals for Room 301", ip: "10.0.0.28" },
  { ts: "2025-06-14 08:55", user: "Emma Roberts", role: "Receptionist", action: "UPDATE", module: "Appointments", details: "Rescheduled Carlos Rivera appt.", ip: "10.0.0.15" },
  { ts: "2025-06-14 08:42", user: "Marcus Webb", role: "Pharmacist", action: "CREATE", module: "Prescriptions Queue", details: "Dispensed RX-8821 to Ahmed Al-Farsi", ip: "10.0.0.33" },
  { ts: "2025-06-14 08:30", user: "Admin David Nguyen", role: "Admin", action: "LOGIN", module: "Auth", details: "Successful login", ip: "192.168.1.10" },
  { ts: "2025-06-13 17:48", user: "Dr. Emily Ross", role: "Doctor", action: "DELETE", module: "Lab Requests", details: "Cancelled duplicate lab request #LAB-4401", ip: "10.0.0.62" },
  { ts: "2025-06-13 17:22", user: "Priya Nair", role: "Lab Tech", action: "UPDATE", module: "Equipment Status", details: "Reported issue on Centrifuge Unit B", ip: "10.0.0.71" },
  { ts: "2025-06-13 16:55", user: "Dr. Alan Park", role: "Doctor", action: "CREATE", module: "Lab Requests", details: "Requested Thyroid Panel for John Whitaker", ip: "10.0.0.56" },
];

const actionStyle: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-slate-100 text-slate-600",
  VIEW: "bg-gray-100 text-gray-500",
};

export function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const filtered = logs.filter((l) => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "All" || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Complete record of all system actions and user activity"
        actions={
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]">
            <Download size={15} />Export CSV
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] mb-5 flex flex-wrap gap-3 items-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={15} className="text-[#64748B] shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user or details..." className="bg-transparent text-sm w-full outline-none text-[#0F172A] placeholder:text-[#94A3B8]" />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] bg-white outline-none">
          <option>All</option>
          {["LOGIN", "CREATE", "UPDATE", "DELETE", "VIEW"].map((a) => <option key={a}>{a}</option>)}
        </select>
        <input type="date" className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] bg-white outline-none" defaultValue="2025-06-14" />
        <input type="date" className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] bg-white outline-none" defaultValue="2025-06-14" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Timestamp", "User", "Role", "Action", "Module", "Details", "IP Address"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 text-xs text-[#64748B] whitespace-nowrap font-mono">{log.ts}</td>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A] whitespace-nowrap">{log.user}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{log.role}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${actionStyle[log.action] || "bg-gray-100 text-gray-500"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{log.module}</td>
                  <td className="px-5 py-3.5 text-[#64748B] max-w-xs truncate">{log.details}</td>
                  <td className="px-5 py-3.5 text-xs text-[#64748B] font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <span className="text-sm text-[#64748B]">Showing {filtered.length} of {logs.length} entries</span>
        </div>
      </div>
    </div>
  );
}
