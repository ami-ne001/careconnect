import { useState, useEffect } from "react";
import { Calendar, Clock, User, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { appointmentApi, adminApi } from "@/api";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { AppointmentResponse } from "@/api/appointment.api";

const TABS = ["All", "Today", "Upcoming", "Completed", "Cancelled"] as const;
type Tab = (typeof TABS)[number];

function statusVariant(
  status: string
): "active" | "completed" | "inactive" | "pending" | "urgent" {
  switch (status) {
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
    case "NO_SHOW":
      return "inactive";
    case "IN_PROGRESS":
      return "urgent";
    case "CHECKED_IN":
      return "active";
    default:
      return "pending";
  }
}

export function DoctorAppointments() {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const getPatientName = (patientId: number) =>
    patients[patientId] ?? `Patient #${patientId}`;

  const loadData = () => {
    if (!userId) return;
    setLoading(true);
    // Load appointments first — always works for DOCTOR role
    appointmentApi
      .getAppointmentsByDoctor(userId)
      .then(({ data }) => {
        setAppointments(data || []);
      })
      .catch((err) => toast.error(getApiErrorMessage(err, "Failed to load appointments.")))
      .finally(() => setLoading(false));

    // Try to load patient names separately — may fail if doctor lacks admin access
    adminApi
      .getUsers("PATIENT")
      .then(({ data }) => {
        const map: Record<number, string> = {};
        (data || []).forEach((p) => { map[p.id] = `${p.firstName} ${p.lastName}`; });
        setPatients(map);
      })
      .catch(() => {/* silently ignore — patient names show as Patient #id */});
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  // ── Tab filtering ──────────────────────────────────────────────
  const filtered = appointments.filter((a) => {
    const d = new Date(a.scheduledAt);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const isUpcoming = d > today && !isToday;

    if (activeTab === "Today") return isToday;
    if (activeTab === "Upcoming") return isUpcoming;
    if (activeTab === "Completed") return a.status === "COMPLETED";
    if (activeTab === "Cancelled")
      return a.status === "CANCELLED" || a.status === "NO_SHOW";
    return true;
  });

  // ── Status update (mark as completed / in progress) ───────────
  const markStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await appointmentApi.updateAppointmentStatus(id, status);
      toast.success(`Appointment marked as ${status.replace("_", " ").toLowerCase()}.`);
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update status."));
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────
  const todayStr = new Date().toDateString();
  const todayAppts = appointments.filter(
    (a) => new Date(a.scheduledAt).toDateString() === todayStr
  );
  const completedToday = todayAppts.filter((a) => a.status === "COMPLETED").length;
  const pendingToday = todayAppts.filter(
    (a) => !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(a.status)
  ).length;

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, color: "#0EA5E9" },
    { label: "Completed Today", value: completedToday, color: "#10B981" },
    { label: "Remaining Today", value: pendingToday, color: "#F59E0B" },
    { label: "Total", value: appointments.length, color: "#1E3A5F" },
  ];

  return (
    <div>
      <PageHeader title="My Appointments" subtitle="Manage your schedule and patient visits" />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 border border-[#E2E8F0]"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <p className="text-xs text-[#64748B] mb-1">{s.label}</p>
            <p className="text-3xl font-black" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-5 w-fit overflow-x-auto"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === t ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {t}
            {t === "Today" && todayAppts.length > 0 && (
              <span className="ml-1.5 bg-[#0EA5E9] text-white text-xs rounded-full px-1.5 py-0.5">
                {todayAppts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
            <span className="text-sm text-[#64748B]">Loading appointments…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Date & Time", "Patient", "Type", "Room", "Duration", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-[#64748B]">
                      No appointments found for this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, i) => {
                    const dt = new Date(a.scheduledAt);
                    const isToday = dt.toDateString() === new Date().toDateString();
                    const canStart =
                      isToday && ["CHECKED_IN", "SCHEDULED", "CONFIRMED"].includes(a.status);
                    const canComplete = a.status === "IN_PROGRESS";
                    const isUpdating = updatingId === a.id;

                    return (
                      <tr
                        key={a.id}
                        className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors ${
                          i % 2 === 0 ? "" : "bg-[#FAFBFC]"
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#0EA5E9] shrink-0" />
                            <div>
                              <p className="font-semibold text-[#0F172A] text-xs">
                                {dt.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                                {isToday && (
                                  <span className="ml-1.5 text-[10px] bg-[#0EA5E9] text-white rounded px-1 py-0.5 font-semibold">
                                    TODAY
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[#64748B] flex items-center gap-1">
                                <Clock size={11} />
                                {dt.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#0EA5E9] text-xs font-bold">
                              {getPatientName(a.patientId).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-[#0F172A]">
                              {getPatientName(a.patientId)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#64748B]">
                          {String(a.type).replace(/_/g, " ")}
                        </td>
                        <td className="px-5 py-3.5 text-[#64748B]">{a.room || "—"}</td>
                        <td className="px-5 py-3.5 text-[#64748B]">{a.durationMinutes} min</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={statusVariant(a.status)} dot>
                            {String(a.status).replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2">
                            {canStart && (
                              <button
                                disabled={isUpdating}
                                onClick={() => markStatus(a.id, "IN_PROGRESS")}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-semibold hover:opacity-90 cursor-pointer disabled:opacity-50 transition-colors"
                              >
                                {isUpdating ? (
                                  <RefreshCw size={12} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={12} />
                                )}
                                Start
                              </button>
                            )}
                            {canComplete && (
                              <button
                                disabled={isUpdating}
                                onClick={() => markStatus(a.id, "COMPLETED")}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-semibold hover:opacity-90 cursor-pointer disabled:opacity-50 transition-colors"
                              >
                                {isUpdating ? (
                                  <RefreshCw size={12} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={12} />
                                )}
                                Complete
                              </button>
                            )}
                            {a.status === "IN_PROGRESS" && (
                              <button
                                onClick={() => markStatus(a.id, "NO_SHOW")}
                                disabled={isUpdating}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 cursor-pointer disabled:opacity-50 transition-colors"
                              >
                                <XCircle size={12} />
                                No Show
                              </button>
                            )}
                            {!canStart && !canComplete && a.status !== "IN_PROGRESS" && (
                              <span className="text-xs text-[#94A3B8] italic">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
