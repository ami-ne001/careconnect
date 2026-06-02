import { useEffect, useState } from "react";
import { Users, UserCheck, Server, DollarSign, Plus, Building2, FileText, BarChart2, Database, HardDrive, Wifi, Clock } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router";
import { api, adminApi, billingApi, clinicalApi, type AuditActivityResponse } from "@/api";
import type { AdminUser } from "@/types";

type AdmissionLite = { patientId: number; status: string };

type RoleRegistrationsPoint = { month: string; Doctors: number; Nurses: number; Patients: number };

const formatRoleLabel = (raw: string) =>
  raw
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatRecentTimestamp = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today ${time}`;
  return `${date.toLocaleDateString()} ${time}`;
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState<AuditActivityResponse[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const [totalStaff, setTotalStaff] = useState<number>(0);
  const [activePatients, setActivePatients] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [surgeriesThisMonth, setSurgeriesThisMonth] = useState<number>(0);

  const [barData, setBarData] = useState<RoleRegistrationsPoint[]>([]);
  const [lineData, setLineData] = useState<Array<{ day: string; logins: number }>>([]);

  useEffect(() => {
    const loadRecentActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);
      try {
        const { data } = await clinicalApi.getRecentActivity();
        setRecentActivity(data);
      } catch (error) {
        // Keep this section non-blocking for admins: if backend route is not available
        // yet (e.g., service not restarted), avoid global toast spam on each page load.
        console.warn("Recent activity endpoint unavailable", error);
        setRecentActivity([]);
        setActivityError("Recent activity is temporarily unavailable.");
      } finally {
        setActivityLoading(false);
      }
    };

    loadRecentActivity();
  }, []);

  useEffect(() => {
    const loadMetrics = async () => {
      setMetricsLoading(true);
      setMetricsError(null);
      try {
        const [users, admissionsRes, paidInvoices, partiallyPaidInvoices, dailyAudit, surgeriesCount] = await Promise.all([
          adminApi.getUsers(),
          api.get<AdmissionLite[]>("/api/admissions/active"),
          billingApi.getInvoicesByStatus("PAID"),
          billingApi.getInvoicesByStatus("PARTIALLY_PAID"),
          clinicalApi.getDailyAuditActivity(),
          clinicalApi.getScheduledSurgeriesThisMonth(),
        ]);

        const admissions = admissionsRes.data ?? [];

        // Total staff = all active non-patient roles
        const staff = (users.data as AdminUser[]).filter((u) => u.isActive && u.role !== "PATIENT");
        setTotalStaff(staff.length);

        // Active patients = distinct patientId for active admissions
        const activePatientIds = new Set(admissions.map((a) => a.patientId));
        setActivePatients(activePatientIds.size);

        // Monthly revenue (current month) = sum of paidAmount for PAID + PARTIALLY_PAID invoices
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1, 0, 0, 0, 0);

        const allInvoices = [...(paidInvoices.data ?? []), ...(partiallyPaidInvoices.data ?? [])];
        const revenue = allInvoices.reduce((sum, inv) => {
          const issued = inv.issuedAt ? new Date(inv.issuedAt) : null;
          if (!issued || Number.isNaN(issued.getTime())) return sum;
          if (issued >= monthStart && issued < nextMonthStart) return sum + (inv.paidAmount ?? 0);
          return sum;
        }, 0);
        setMonthlyRevenue(revenue);

        setSurgeriesThisMonth(Number(surgeriesCount.data ?? 0));

        // New registrations by role (last 6 months) from auth-service users.createdAt
        const monthPoints: Date[] = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(today);
          d.setMonth(today.getMonth() - 5 + i, 1);
          d.setHours(0, 0, 0, 0);
          return d;
        });

        const roleCountsForMonth = (monthStartDate: Date) => {
          const monthEndDate = new Date(monthStartDate);
          monthEndDate.setMonth(monthEndDate.getMonth() + 1);

          const counts = { DOCTOR: 0, NURSE: 0, PATIENT: 0 } as Record<"DOCTOR" | "NURSE" | "PATIENT", number>;
          for (const u of users.data as AdminUser[]) {
            const createdAt = u.createdAt ? new Date(u.createdAt) : null;
            if (!createdAt || Number.isNaN(createdAt.getTime())) continue;
            if (createdAt >= monthStartDate && createdAt < monthEndDate) {
              if (u.role === "DOCTOR") counts.DOCTOR++;
              if (u.role === "NURSE") counts.NURSE++;
              if (u.role === "PATIENT") counts.PATIENT++;
            }
          }
          return counts;
        };

        const computedBarData: RoleRegistrationsPoint[] = monthPoints.map((m) => {
          const counts = roleCountsForMonth(m);
          return {
            month: m.toLocaleString(undefined, { month: "short" }),
            Doctors: counts.DOCTOR,
            Nurses: counts.NURSE,
            Patients: counts.PATIENT,
          };
        });
        setBarData(computedBarData);

        // Line chart: last 30 days audit event counts
        const computedLineData = (dailyAudit.data ?? []).map((row) => {
          // row.day is sent as "YYYY-MM-DD" from backend; parse locally to avoid timezone shifts.
          let label = row.day;
          if (row.day) {
            const parts = row.day.split("-");
            if (parts.length === 3) {
              const y = Number(parts[0]);
              const m = Number(parts[1]);
              const dNum = Number(parts[2]);
              const dLocal = new Date(y, m - 1, dNum);
              if (!Number.isNaN(dLocal.getTime())) {
                label = dLocal.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
              }
            }
          }
          return { day: label, logins: row.logins };
        });
        setLineData(computedLineData);
      } catch (err) {
        console.warn("Failed to load dashboard metrics", err);
        setMetricsError("Dashboard metrics are temporarily unavailable.");
      } finally {
        setMetricsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of hospital operations and system health"
        actions={
          <span className="text-sm text-[#64748B]">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-7">
        <StatCard
          title="Total Staff"
          value={metricsLoading ? "—" : totalStaff.toLocaleString()}
          subtitle="Active staff (non-patients)"
          icon={<Users size={20} className="text-[#1E3A5F]" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Active Patients"
          value={metricsLoading ? "—" : activePatients.toLocaleString()}
          subtitle="Currently admitted"
          icon={<UserCheck size={20} className="text-[#10B981]" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="System Uptime"
          value={metricsLoading ? "—" : "N/A"}
          subtitle="Not available via metrics API"
          icon={<Server size={20} className="text-[#0EA5E9]" />}
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Monthly Revenue"
          value={metricsLoading ? "—" : `$${monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subtitle="Current month (paid + partially paid)"
          icon={<DollarSign size={20} className="text-[#F59E0B]" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Surgeries This Month"
          value={metricsLoading ? "—" : surgeriesThisMonth.toLocaleString()}
          subtitle="Scheduled surgeries"
          icon={<span className="text-[#8B5CF6]">🔪</span>}
          iconBg="bg-purple-50"
        />
      </div>

      {metricsError && (
        <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl px-4 py-3 mb-7 text-sm">
          {metricsError}
        </div>
      )}

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
          {metricsLoading ? (
            <div className="h-[220px] flex items-center justify-center text-[#64748B]">Loading chart…</div>
          ) : (
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
          )}
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-4">System Health</h3>
          <div className="space-y-3">
            {[
              { label: "Database", status: "Healthy", icon: <Database size={16} />, color: "text-[#10B981]", bg: "bg-emerald-50" },
              { label: "API Server", status: "Healthy", icon: <Wifi size={16} />, color: "text-[#10B981]", bg: "bg-emerald-50" },
              { label: "Storage", status: "N/A", icon: <HardDrive size={16} />, color: "text-[#64748B]", bg: "bg-slate-50" },
              { label: "Last Backup", status: "N/A", icon: <Clock size={16} />, color: "text-[#64748B]", bg: "bg-slate-50" },
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
              <span>N/A</span>
            </div>
            <div className="h-2 bg-[#F1F5F9] rounded-full">
              <div className="h-2 rounded-full bg-[#F59E0B]" style={{ width: "0%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 className="font-semibold text-[#0F172A] mb-4">System Activity — Audit Events (Last 30 Days)</h3>
        {metricsLoading ? (
          <div className="h-[160px] flex items-center justify-center text-[#64748B]">Loading chart…</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip />
              <Line type="monotone" dataKey="logins" stroke="#0EA5E9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
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
              {activityLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#64748B]">Loading recent activity...</td>
                </tr>
              ) : activityError ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-amber-700">{activityError}</td>
                </tr>
              ) : recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-[#64748B]">No recent activity found.</td>
                </tr>
              ) : (
                recentActivity.map((row, i) => (
                  <tr key={row.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#F8FAFC]"}`}>
                    <td className="px-5 py-3.5 font-medium text-[#0F172A]">{row.userName}</td>
                    <td className="px-5 py-3.5"><Badge variant="info">{formatRoleLabel(row.role)}</Badge></td>
                    <td className="px-5 py-3.5 text-[#64748B]">{row.description || row.action}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{row.module}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{formatRecentTimestamp(row.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}