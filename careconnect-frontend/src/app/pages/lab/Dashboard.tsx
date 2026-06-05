import { useState, useEffect, useMemo } from "react";
import { FlaskConical, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router";
import { labApi, LabRequestResponse } from "../../../api/lab.api";
import { receptionistApi } from "../../../api/receptionist.api";
import { adminApi } from "../../../api/admin.api";
import { AdminUser } from "../../../types";

export function LabDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LabRequestResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, string>>({});
  const [doctors, setDoctors] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, pRes, dRes] = await Promise.all([
        labApi.getAllLabRequests(),
        receptionistApi.getPatientsList(0, 1000).catch(() => ({ data: { content: [] } })),
        adminApi.getUsers("DOCTOR" as any).catch(() => ({ data: [] }))
      ]);

      setRequests(reqRes.data || []);

      const pMap: Record<number, string> = {};
      (pRes.data.content || []).forEach((p: any) => {
        if (p.userId) pMap[p.userId] = `${p.firstName} ${p.lastName}`.trim();
      });
      setPatients(pMap);

      const dMap: Record<number, string> = {};
      (dRes.data || []).forEach((d: AdminUser) => {
        dMap[d.id] = `Dr. ${d.firstName} ${d.lastName}`.trim();
      });
      setDoctors(dMap);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPatientName = (id: number, fallback?: string) => patients[id] || fallback || `Patient #${id}`;
  const getDoctorName = (id: number, fallback?: string) => doctors[id] || fallback || `Doctor #${id}`;

  const { pending, inProgress, completedToday, criticalResults, pendingQueue, workloadData, criticalCompleted } = useMemo(() => {
    const today = new Date().toDateString();
    let pendingCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;
    let criticalCount = 0;
    
    const pendingItems: LabRequestResponse[] = [];
    const criticalItems: LabRequestResponse[] = [];
    const hourlyCounts: Record<string, number> = {};

    // Initialize 8am to 4pm for workload
    for (let i = 8; i <= 16; i++) {
      hourlyCounts[`${i.toString().padStart(2, '0')}:00`] = 0;
    }

    requests.forEach(r => {
      if (r.status === "REQUESTED") pendingCount++;
      if (r.status === "SAMPLE_RECEIVED" || r.status === "PROCESSING") inProgressCount++;
      
      const reqDate = new Date(r.requestedAt);
      if (r.status === "COMPLETED" && reqDate.toDateString() === today) {
        completedCount++;
        const hour = `${reqDate.getHours().toString().padStart(2, '0')}:00`;
        if (hourlyCounts[hour] !== undefined) hourlyCounts[hour]++;
      }

      if (r.status === "COMPLETED" && r.priority === "CRITICAL") {
        criticalCount++;
        criticalItems.push(r);
      }

      if (r.status !== "COMPLETED" && r.status !== "CANCELLED") {
        pendingItems.push(r);
      }
    });

    // Sort queue by priority then time
    const priorityWeight: Record<string, number> = { "CRITICAL": 3, "URGENT": 2, "NORMAL": 1 };
    pendingItems.sort((a, b) => {
      const wA = priorityWeight[a.priority] || 0;
      const wB = priorityWeight[b.priority] || 0;
      if (wA !== wB) return wB - wA;
      return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
    });

    const chartData = Object.keys(hourlyCounts).map(hour => ({
      hour,
      tests: hourlyCounts[hour]
    }));

    return { 
      pending: pendingCount, 
      inProgress: inProgressCount, 
      completedToday: completedCount, 
      criticalResults: criticalCount,
      pendingQueue: pendingItems,
      workloadData: chartData,
      criticalCompleted: criticalItems
    };
  }, [requests]);

  const handleStartProcessing = async (id: number) => {
    try {
      await labApi.updateLabRequestStatus(id, "PROCESSING");
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <PageHeader title="Lab Dashboard" subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-[#0EA5E9] text-xs font-semibold text-[#64748B] hover:text-[#0EA5E9] bg-white cursor-pointer transition-all"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Pending Tests" value={pending.toString()} icon={<Clock size={20} />} trendValue="waiting" trend="stable" iconBg="bg-[#FEF3C7]" />
        <StatCard title="In Progress" value={inProgress.toString()} icon={<FlaskConical size={20} />} trendValue="processing" trend="stable" iconBg="bg-[#EFF6FF]" />
        <StatCard title="Completed Today" value={completedToday.toString()} icon={<CheckCircle size={20} />} trendValue="today" trend="up" iconBg="bg-[#D1FAE5]" />
        <StatCard title="Critical Results" value={criticalResults.toString()} icon={<AlertTriangle size={20} />} trendValue="attention required" trend="down" iconBg="bg-[#FEE2E2]" />
      </div>

      {/* Critical Results Alert */}
      {criticalCompleted.length > 0 && (
        <div className="mb-6 space-y-3">
          {criticalCompleted.map((cr, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[#FEF2F2] border-2 border-[#FCA5A5]">
              <AlertTriangle size={20} className="text-[#EF4444] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-[#991B1B]">{getPatientName(cr.patientId, cr.patientName)} — {cr.testTypeName}</p>
                <p className="text-sm text-[#64748B]">Critical priority test completed · Ordering Doctor: {getDoctorName(cr.doctorId, cr.doctorName)}</p>
              </div>
              <button 
                onClick={() => navigate("/lab/test-requests")}
                className="px-4 py-1.5 rounded-lg bg-[#EF4444] text-white text-xs font-semibold hover:bg-[#DC2626] cursor-pointer"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Test Queue */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Pending Test Queue</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9] max-h-[400px] overflow-y-auto">
            {pendingQueue.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] text-sm">No pending tests in queue.</div>
            ) : (
              pendingQueue.map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center text-base">🧪</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#0F172A]">{getPatientName(item.patientId, item.patientName)}</p>
                        <Badge variant={item.priority === "CRITICAL" ? "critical" : item.priority === "URGENT" ? "warning" : "inactive"}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B]">{item.testTypeName} · {getDoctorName(item.doctorId, item.doctorName)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#64748B]">
                      {new Date(item.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {item.status === "REQUESTED" || item.status === "SAMPLE_RECEIVED" ? (
                      <button 
                        onClick={() => handleStartProcessing(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:bg-[#162d4a] cursor-pointer"
                      >
                        Start Processing
                      </button>
                    ) : item.status === "PROCESSING" ? (
                      <button 
                        onClick={() => navigate(`/lab/test-requests/upload/${item.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium hover:bg-[#0284C7] cursor-pointer"
                      >
                        Upload Results
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workload Chart */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-4">Completed Tests Per Hour</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={workloadData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="tests" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}