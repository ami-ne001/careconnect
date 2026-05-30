import { Users, UserCheck, Server, DollarSign, Plus, Building2, FileText, BarChart2, Database, HardDrive, Wifi, Clock } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router";

const barData = [
  { month: "Jan", Doctors: 4, Nurses: 8, Patients: 42 },
  { month: "Feb", Doctors: 3, Nurses: 6, Patients: 58 },
  { month: "Mar", Doctors: 5, Nurses: 9, Patients: 64 },
  { month: "Apr", Doctors: 2, Nurses: 7, Patients: 71 },
  { month: "May", Doctors: 6, Nurses: 11, Patients: 83 },
  { month: "Jun", Doctors: 4, Nurses: 8, Patients: 95 },
];

const lineData = Array.from({ length: 30 }, (_, i) => ({
  day: `Jun ${i + 1}`,
  logins: Math.floor(Math.random() * 60) + 80,
}));

const recentActivity = [
  { user: "Dr. Sarah Mitchell", role: "Doctor", action: "Scheduled Surgery", module: "Surgeries", time: "Today 08:00 AM" },
  { user: "Nurse Rachel Kim", role: "Nurse", action: "Completed Pre-Op Prep", module: "Surgeries", time: "Today 07:45 AM" },
  { user: "Dr. Sarah Mitchell", role: "Doctor", action: "Logged in", module: "Consultations", time: "Today 09:14 AM" },
  { user: "Admin David Nguyen", role: "Admin", action: "Updated user", module: "User Management", time: "Today 08:52 AM" },
  { user: "Nurse Linda Torres", role: "Nurse", action: "Recorded vitals", module: "Patient Monitoring", time: "Today 08:31 AM" },
  { user: "Emma Roberts", role: "Receptionist", action: "Registered patient", module: "Patient Registration", time: "Today 08:20 AM" },
  { user: "Dr. Alan Park", role: "Doctor", action: "Uploaded results", module: "Lab Requests", time: "Today 07:58 AM" },
  { user: "Priya Nair", role: "Lab Technician", action: "Processed test", module: "Test Processing", time: "Today 07:30 AM" },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of hospital operations and system health"
        actions={
          <span className="text-sm text-[#64748B]">Monday, June 16, 2025</span>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-7">
        <StatCard title="Total Staff" value="124" subtitle="+3 this month" trend="up" trendValue="+3 new users" icon={<Users size={20} className="text-[#1E3A5F]" />} iconBg="bg-blue-50" />
        <StatCard title="Active Patients" value="1,847" subtitle="Currently admitted" trend="up" trendValue="+12% vs last month" icon={<UserCheck size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
        <StatCard title="System Uptime" value="99.8%" subtitle="Last 30 days" trend="stable" trendValue="Stable" icon={<Server size={20} className="text-[#0EA5E9]" />} iconBg="bg-sky-50" />
        <StatCard title="Monthly Revenue" value="$284,500" subtitle="June 2025" trend="up" trendValue="+8.2% vs May" icon={<DollarSign size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
        <StatCard title="Surgeries This Month" value="11" subtitle="+3 vs last month" trend="up" trendValue="+3 new" icon={<span className="text-[#8B5CF6]">🔪</span>} iconBg="bg-purple-50" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-7">
        {[
          { label: "+ Add User", icon: <Plus size={15} />, path: "/admin/users-management", color: "bg-[#1E3A5F] text-white" },
          { label: "+ Create Department", icon: <Building2 size={15} />, path: "/admin/departments", color: "bg-white text-[#1E3A5F] border border-[#E2E8F0]" },
          { label: "View Audit Logs", icon: <FileText size={15} />, path: "/admin/audit-logs", color: "bg-white text-[#1E3A5F] border border-[#E2E8F0]" },
          { label: "Generate Report", icon: <BarChart2 size={15} />, path: "/admin/reports", color: "bg-white text-[#1E3A5F] border border-[#E2E8F0]" },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.path)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 ${a.color}`}>
            {a.icon}{a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <div className="xl:col-span-2 bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-4">New Registrations by Role</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Doctors" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Nurses" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Patients" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-4">System Health</h3>
          <div className="space-y-3">
            {[
              { label: "Database", status: "Healthy", icon: <Database size={16} />, color: "text-[#10B981]", bg: "bg-emerald-50" },
              { label: "API Server", status: "Healthy", icon: <Wifi size={16} />, color: "text-[#10B981]", bg: "bg-emerald-50" },
              { label: "Storage", status: "73% used", icon: <HardDrive size={16} />, color: "text-[#F59E0B]", bg: "bg-amber-50" },
              { label: "Last Backup", status: "2h ago", icon: <Clock size={16} />, color: "text-[#0EA5E9]", bg: "bg-sky-50" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-[#0F172A]">{item.label}</span>
                </div>
                <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
          {/* Storage bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[#64748B] mb-1">
              <span>Storage Used</span>
              <span>73%</span>
            </div>
            <div className="h-2 bg-[#F1F5F9] rounded-full">
              <div className="h-2 rounded-full bg-[#F59E0B]" style={{ width: "73%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 className="font-semibold text-[#0F172A] mb-4">System Activity — Daily Logins (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} interval={4} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <Tooltip />
            <Line type="monotone" dataKey="logins" stroke="#0EA5E9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["User", "Role", "Action", "Module", "Timestamp"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#F8FAFC]"}`}>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{row.user}</td>
                  <td className="px-5 py-3.5"><Badge variant="info">{row.role}</Badge></td>
                  <td className="px-5 py-3.5 text-[#64748B]">{row.action}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{row.module}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}