import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, FileText, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/ui/PageHeader";
import { adminApi, billingApi, receptionistApi } from "@/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { downloadCsv, formatFileSize, rowsToCsv } from "@/utils/csv";
import { isAxiosError } from "axios";

const CHART_COLORS = ["#EF4444", "#0EA5E9", "#10B981", "#8B5CF6", "#F59E0B", "#94A3B8", "#EC4899", "#14B8A6"];

type RevenuePoint = { month: string; revenue: number };
type AdmissionSlice = { name: string; value: number; color: string };
type StaffPoint = { dept: string; rate: number };
type ReportType = "patient" | "financial" | "staff";

type GeneratedReport = {
  id: string;
  title: string;
  type: ReportType;
  generatedAt: Date;
  filename: string;
  csvContent: string;
  sizeLabel: string;
};

const REPORT_CARDS: {
  type: ReportType;
  title: string;
  desc: string;
  icon: ReactNode;
  bg: string;
}[] = [
  {
    type: "patient",
    title: "Patient Reports",
    desc: "Admissions, discharges, diagnoses, readmission rates",
    icon: <Users size={20} className="text-[#0EA5E9]" />,
    bg: "bg-blue-50",
  },
  {
    type: "financial",
    title: "Financial Reports",
    desc: "Revenue, billing, outstanding payments, department costs",
    icon: <DollarSign size={20} className="text-[#10B981]" />,
    bg: "bg-emerald-50",
  },
  {
    type: "staff",
    title: "Staff Reports",
    desc: "Attendance, performance, shift coverage, overtime",
    icon: <FileText size={20} className="text-[#8B5CF6]" />,
    bg: "bg-purple-50",
  },
];

const formatRevenueHeadline = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value.toLocaleString()}`;
};

const formatMonthRange = (points: RevenuePoint[]) => {
  if (points.length === 0) return "No data";
  if (points.length === 1) return points[0].month;
  return `${points[0].month} – ${points[points.length - 1].month}`;
};

const formatDateRangeLabel = (start?: string, end?: string) => {
  if (!start || !end) return "Current month";
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return `${start} – ${end}`;
  return s.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

const dateStamp = () => new Date().toISOString().slice(0, 10);

const isNotFound = (err: unknown) =>
  isAxiosError(err) && (err.response?.status === 404 || String(err.response?.data ?? "").includes("No static resource"));

const buildPatientCsv = (report: {
  startDate: string;
  endDate: string;
  totalAdmissions: number;
  slices: { departmentName: string; count: number }[];
}) => {
  const rows: (string | number)[][] = [
    ["CareConnect Patient Report - Admissions by Department"],
    ["Period", `${report.startDate} to ${report.endDate}`],
    ["Total Admissions", report.totalAdmissions],
    [],
    ["Department", "Admissions"],
    ...report.slices.map((s) => [s.departmentName, s.count]),
  ];
  return rowsToCsv(rows);
};

const buildFinancialCsv = (points: { month: string; revenue: number }[]) => {
  const total = points.reduce((sum, p) => sum + p.revenue, 0);
  const rows: (string | number)[][] = [
    ["CareConnect Financial Report - Monthly Revenue"],
    ["Generated", new Date().toISOString()],
    [],
    ["Month", "Revenue (USD)"],
    ...points.map((p) => [p.month, p.revenue]),
    [],
    ["Total", total],
  ];
  return rowsToCsv(rows);
};

const buildStaffCsv = (departments: {
  departmentName: string;
  activeCount: number;
  totalCount: number;
  activeRate: number;
}[]) => {
  const rows: (string | number)[][] = [
    ["CareConnect Staff Report - Active Staff by Department"],
    ["Generated", new Date().toISOString()],
    [],
    ["Department", "Active Count", "Total Count", "Active Rate (%)"],
    ...departments.map((d) => [d.departmentName, d.activeCount, d.totalCount, d.activeRate]),
  ];
  return rowsToCsv(rows);
};

const saveGeneratedReport = (
  title: string,
  type: ReportType,
  filename: string,
  csvContent: string,
  setGeneratedReports: Dispatch<SetStateAction<GeneratedReport[]>>,
) => {
  const bytes = new Blob([csvContent]).size;
  const entry: GeneratedReport = {
    id: crypto.randomUUID(),
    title,
    type,
    generatedAt: new Date(),
    filename,
    csvContent,
    sizeLabel: formatFileSize(bytes),
  };
  setGeneratedReports((prev) => [entry, ...prev]);
  downloadCsv(filename, csvContent);
};

export function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [generatingType, setGeneratingType] = useState<ReportType | null>(null);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [admissionsData, setAdmissionsData] = useState<AdmissionSlice[]>([]);
  const [attendanceData, setAttendanceData] = useState<StaffPoint[]>([]);
  const [totalAdmissions, setTotalAdmissions] = useState(0);
  const [admissionsRangeLabel, setAdmissionsRangeLabel] = useState("Current month");

  const lastMonthRevenue = useMemo(() => {
    if (revenueData.length === 0) return 0;
    return revenueData[revenueData.length - 1].revenue;
  }, [revenueData]);

  const staffDomain = useMemo(() => {
    if (attendanceData.length === 0) return [0, 100] as [number, number];
    const rates = attendanceData.map((d) => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    return [Math.max(0, min - 5), Math.min(100, max + 5)] as [number, number];
  }, [attendanceData]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [revenueRes, admissionsRes, staffRes] = await Promise.all([
          billingApi.getMonthlyRevenueReport(6).catch((e) => (isNotFound(e) ? { data: { points: [] } } : Promise.reject(e))),
          receptionistApi.getAdmissionsByDepartment().catch((e) =>
            isNotFound(e)
              ? { data: { slices: [], totalAdmissions: 0, startDate: "", endDate: "" } }
              : Promise.reject(e),
          ),
          adminApi.getStaffByDepartmentReport().catch((e) =>
            isNotFound(e) ? { data: { departments: [] } } : Promise.reject(e),
          ),
        ]);

        if (cancelled) return;

        const points = (revenueRes.data?.points ?? []).map((p) => ({
          month: p.month,
          revenue: Number(p.revenue ?? 0),
        }));
        setRevenueData(points);

        const report = admissionsRes.data;
        setTotalAdmissions(report?.totalAdmissions ?? 0);
        setAdmissionsRangeLabel(formatDateRangeLabel(report?.startDate, report?.endDate));
        setAdmissionsData(
          (report?.slices ?? []).map((slice, i) => ({
            name: slice.departmentName,
            value: slice.count,
            color: CHART_COLORS[i % CHART_COLORS.length],
          })),
        );

        setAttendanceData(
          (staffRes.data?.departments ?? []).map((d) => ({
            dept: d.departmentName,
            rate: d.activeRate,
          })),
        );
      } catch {
        if (!cancelled) {
          setRevenueData([]);
          setAdmissionsData([]);
          setAttendanceData([]);
          setTotalAdmissions(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerateReport = async (type: ReportType) => {
    setGeneratingType(type);
    try {
      if (type === "patient") {
        const { data } = await receptionistApi.getAdmissionsByDepartment();
        if (!data.slices?.length) {
          toast.warning("No admissions data to export for this period.");
          return;
        }
        const csvContent = buildPatientCsv(data);
        const filename = `patient-admissions-report-${dateStamp()}.csv`;
        saveGeneratedReport("Patient Admissions by Department", type, filename, csvContent, setGeneratedReports);
        toast.success("Patient report downloaded.");
      } else if (type === "financial") {
        const { data } = await billingApi.getMonthlyRevenueReport(6);
        if (!data.points?.length) {
          toast.warning("No revenue data to export.");
          return;
        }
        const csvContent = buildFinancialCsv(data.points);
        const filename = `financial-revenue-report-${dateStamp()}.csv`;
        saveGeneratedReport("Monthly Revenue Overview", type, filename, csvContent, setGeneratedReports);
        toast.success("Financial report downloaded.");
      } else {
        const { data } = await adminApi.getStaffByDepartmentReport();
        if (!data.departments?.length) {
          toast.warning("No staff data to export.");
          return;
        }
        const csvContent = buildStaffCsv(data.departments);
        const filename = `staff-by-department-report-${dateStamp()}.csv`;
        saveGeneratedReport("Active Staff by Department", type, filename, csvContent, setGeneratedReports);
        toast.success("Staff report downloaded.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to generate report."));
    } finally {
      setGeneratingType(null);
    }
  };

  const handleRedownload = (report: GeneratedReport) => {
    downloadCsv(report.filename, report.csvContent);
    toast.success("Report downloaded.");
  };

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Generate and view hospital performance reports" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
        {REPORT_CARDS.map((r) => {
          const isGenerating = generatingType === r.type;
          return (
            <div key={r.title} className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center mb-3`}>{r.icon}</div>
              <h3 className="font-semibold text-[#0F172A] mb-1">{r.title}</h3>
              <p className="text-xs text-[#64748B] mb-4 leading-relaxed">{r.desc}</p>
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => handleGenerateReport(r.type)}
                className={`w-full h-9 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium transition-opacity ${
                  isGenerating ? "opacity-70 cursor-wait" : "hover:opacity-90"
                }`}
              >
                {isGenerating ? "Generating…" : "Generate Report"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#0F172A]">Monthly Revenue Overview</h3>
            <p className="text-xs text-[#64748B]">
              {loading ? "Loading…" : formatMonthRange(revenueData)}
            </p>
          </div>
          <span className="text-2xl font-bold text-[#10B981]">
            {loading ? "—" : formatRevenueHeadline(lastMonthRevenue)}
          </span>
        </div>
        {loading ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-[#64748B]">Loading chart…</div>
        ) : revenueData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-[#64748B]">No revenue data yet</div>
        ) : (
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
              <Tooltip formatter={(v: number) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-1">Patient Admissions by Department</h3>
          <p className="text-xs text-[#64748B] mb-3">
            {loading ? "Loading…" : `${admissionsRangeLabel} — ${totalAdmissions} total admissions`}
          </p>
          {loading ? (
            <div className="h-[160px] flex items-center justify-center text-sm text-[#64748B]">Loading chart…</div>
          ) : admissionsData.length === 0 ? (
            <div className="h-[160px] flex items-center justify-center text-sm text-[#64748B]">No admissions in this period</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={admissionsData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                    {admissionsData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [v, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {admissionsData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-[#64748B]">{d.name}</span>
                    <span className="ml-auto font-semibold text-[#0F172A]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-1">Active Staff Rate</h3>
          <p className="text-xs text-[#64748B] mb-3">By department — active accounts vs total staff</p>
          {loading ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-[#64748B]">Loading chart…</div>
          ) : attendanceData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-[#64748B]">No staff data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={attendanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={staffDomain} tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: "#64748B" }} width={72} />
                <Tooltip formatter={(v) => [`${v}%`, "Active rate"]} />
                <Bar dataKey="rate" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Previously Generated Reports</h3>
          <p className="text-xs text-[#64748B] mt-0.5">CSV exports from this session appear here</p>
        </div>
        {generatedReports.length === 0 ? (
          <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center mb-3">
              <FileText size={22} className="text-[#94A3B8]" />
            </div>
            <p className="text-sm font-medium text-[#0F172A]">No reports generated yet</p>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm">
              Use the Generate Report buttons above to export CSV files. Charts use live data from billing, admissions, and staff records.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {generatedReports.map((report) => (
              <div key={report.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-[#64748B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{report.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {report.generatedAt.toLocaleString()} · {report.sizeLabel} · CSV
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRedownload(report)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] shrink-0"
                >
                  <Download size={13} />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
