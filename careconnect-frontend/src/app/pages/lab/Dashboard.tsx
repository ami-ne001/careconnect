import { FlaskConical, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const queue = [
  { patient: "Ahmed Al-Farsi", test: "Complete Blood Count", doctor: "Dr. Sarah Mitchell", priority: "normal", time: "08:45 AM" },
  { patient: "Maria Santos", test: "Lipid Panel", doctor: "Dr. Sarah Mitchell", priority: "urgent", time: "09:10 AM" },
  { patient: "John Whitaker", test: "Thyroid Panel", doctor: "Dr. Alan Park", priority: "normal", time: "09:30 AM" },
  { patient: "Linda Chen", test: "Basic Metabolic Panel", doctor: "Dr. Emily Ross", priority: "normal", time: "09:50 AM" },
  { patient: "Carlos Rivera", test: "Liver Function Tests", doctor: "Dr. Mark Chen", priority: "urgent", time: "10:05 AM" },
  { patient: "Priya Sharma", test: "Urinalysis", doctor: "Dr. Sarah Mitchell", priority: "normal", time: "10:20 AM" },
];

const criticalResults = [
  { patient: "Maria Santos", test: "Lipid Panel", finding: "LDL: 189 mg/dL (High)", doctor: "Dr. Sarah Mitchell" },
  { patient: "Carlos Rivera", test: "Liver Function Tests", finding: "ALT: 280 U/L (Critical High)", doctor: "Dr. Mark Chen" },
];

const workloadData = [
  { hour: "08:00", tests: 2 },
  { hour: "09:00", tests: 5 },
  { hour: "10:00", tests: 4 },
  { hour: "11:00", tests: 6 },
  { hour: "12:00", tests: 3 },
  { hour: "13:00", tests: 4 },
  { hour: "14:00", tests: 7 },
  { hour: "15:00", tests: 5 },
  { hour: "16:00", tests: 2 },
];

export function LabDashboard() {
  return (
    <div>
      <PageHeader title="Lab Dashboard" subtitle="Wednesday, April 22, 2026" />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Pending Tests" value="11" icon={<Clock size={20} />} trendValue="3 urgent" trend="down" iconBg="bg-[#FEF3C7]" />
        <StatCard title="In Progress" value="4" icon={<FlaskConical size={20} />} trendValue="being processed" trend="stable" iconBg="bg-[#EFF6FF]" />
        <StatCard title="Completed Today" value="19" icon={<CheckCircle size={20} />} trendValue="+4 from yesterday" trend="up" iconBg="bg-[#D1FAE5]" />
        <StatCard title="Critical Results" value="2" icon={<AlertTriangle size={20} />} trendValue="notify doctors" trend="down" iconBg="bg-[#FEE2E2]" />
      </div>

      {/* Critical Results Alert */}
      <div className="mb-6 space-y-3">
        {criticalResults.map((cr, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[#FEF2F2] border-2 border-[#FCA5A5]">
            <AlertTriangle size={20} className="text-[#EF4444] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[#991B1B]">{cr.patient} — {cr.test}</p>
              <p className="text-sm text-[#64748B]">{cr.finding} · Ordering Doctor: {cr.doctor}</p>
            </div>
            <button className="px-4 py-1.5 rounded-lg bg-[#EF4444] text-white text-xs font-semibold hover:bg-[#DC2626]">
              Notify Doctor
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Test Queue */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Pending Test Queue</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {queue.map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center text-base">🧪</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0F172A]">{item.patient}</p>
                      <Badge variant={item.priority === "urgent" ? "critical" : "inactive"}>
                        {item.priority === "urgent" ? "Urgent" : "Normal"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748B]">{item.test} · {item.doctor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#64748B]">{item.time}</span>
                  <button className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#162d4a]">
                    Start Processing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Chart */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-4">Tests Completed Per Hour</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={workloadData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="tests" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}