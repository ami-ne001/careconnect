import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, FileText, Users, DollarSign } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

const revenueData = [
  { month: "Jan", revenue: 218000 }, { month: "Feb", revenue: 234000 },
  { month: "Mar", revenue: 251000 }, { month: "Apr", revenue: 263000 },
  { month: "May", revenue: 271000 }, { month: "Jun", revenue: 284500 },
];

const admissionsData = [
  { name: "Emergency", value: 142, color: "#EF4444" },
  { name: "Cardiology", value: 89, color: "#0EA5E9" },
  { name: "Pediatrics", value: 103, color: "#10B981" },
  { name: "Neurology", value: 67, color: "#8B5CF6" },
  { name: "Orthopedics", value: 74, color: "#F59E0B" },
  { name: "Other", value: 48, color: "#94A3B8" },
];

const attendanceData = [
  { dept: "Emergency", rate: 96 }, { dept: "Cardiology", rate: 94 },
  { dept: "Pediatrics", rate: 91 }, { dept: "Neurology", rate: 88 },
  { dept: "Orthopedics", rate: 90 }, { dept: "Laboratory", rate: 97 },
];

const reportHistory = [
  { name: "Monthly Financial Report — June 2025", generated: "Jun 14, 2025", type: "Financial", size: "2.4 MB" },
  { name: "Staff Attendance Report — May 2025", generated: "Jun 1, 2025", type: "Staff", size: "1.1 MB" },
  { name: "Patient Admissions Report — Q1 2025", generated: "Apr 5, 2025", type: "Patient", size: "3.7 MB" },
  { name: "Audit Summary Report — May 2025", generated: "Jun 1, 2025", type: "Audit", size: "0.9 MB" },
  { name: "Revenue Analysis — Q1 2025", generated: "Apr 5, 2025", type: "Financial", size: "1.8 MB" },
];

export function AdminReports() {
  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Generate and view hospital performance reports" />

      {/* Report category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
        {[
          { title: "Patient Reports", desc: "Admissions, discharges, diagnoses, readmission rates", icon: <Users size={20} className="text-[#0EA5E9]" />, bg: "bg-blue-50" },
          { title: "Financial Reports", desc: "Revenue, billing, outstanding payments, department costs", icon: <DollarSign size={20} className="text-[#10B981]" />, bg: "bg-emerald-50" },
          { title: "Staff Reports", desc: "Attendance, performance, shift coverage, overtime", icon: <FileText size={20} className="text-[#8B5CF6]" />, bg: "bg-purple-50" },
        ].map((r) => (
          <div key={r.title} className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center mb-3`}>{r.icon}</div>
            <h3 className="font-semibold text-[#0F172A] mb-1">{r.title}</h3>
            <p className="text-xs text-[#64748B] mb-4 leading-relaxed">{r.desc}</p>
            <button className="w-full h-9 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 transition-all">Generate Report</button>
          </div>
        ))}
      </div>

      {/* Revenue area chart */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#0F172A]">Monthly Revenue Overview</h3>
            <p className="text-xs text-[#64748B]">January – June 2025</p>
          </div>
          <span className="text-2xl font-bold text-[#10B981]">$284K</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748B" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Admissions donut */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-1">Patient Admissions by Department</h3>
          <p className="text-xs text-[#64748B] mb-3">June 2025 — 523 total admissions</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={admissionsData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {admissionsData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {admissionsData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-[#64748B]">{d.name}</span>
                  <span className="ml-auto font-semibold text-[#0F172A]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff attendance bar */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-1">Staff Attendance Rate</h3>
          <p className="text-xs text-[#64748B] mb-3">By department — June 2025</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[80, 100]} tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: "#64748B" }} width={72} />
              <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
              <Bar dataKey="rate" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report history */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Previously Generated Reports</h3>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {reportHistory.map((r, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                  <FileText size={16} className="text-[#0EA5E9]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{r.name}</p>
                  <p className="text-xs text-[#64748B]">Generated {r.generated} · {r.size}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8]">
                <Download size={13} />Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
