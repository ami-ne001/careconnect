import { useCallback, useEffect, useState } from "react";
import { DoorOpen } from "lucide-react";
import { useNavigate } from "react-router";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import {
  clinicalApi,
  type OperatingRoomCardResponse,
  type OperatingRoomOverviewResponse,
} from "@/api";
import { getApiErrorMessage } from "@/utils/apiError";

const SCHEDULE_COLORS: Record<string, string> = {
  cardiac: "bg-[#1E3A5F] text-white",
  orthopedics: "bg-[#0EA5E9] text-white",
  general: "bg-[#10B981] text-white",
  scheduled: "bg-[#8B5CF6] text-white",
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

const badgeVariant = (uiStatus: string): "active" | "critical" | "pending" | "inactive" => {
  if (uiStatus === "Available") return "active";
  if (uiStatus === "In Use") return "critical";
  if (uiStatus === "Cleaning") return "pending";
  return "inactive";
};

const borderClass = (uiStatus: string) => {
  if (uiStatus === "In Use") return "border-red-200";
  if (uiStatus === "Cleaning") return "border-amber-200";
  if (uiStatus === "Maintenance") return "border-slate-200";
  return "border-emerald-200";
};

const headerBg = (uiStatus: string) => {
  if (uiStatus === "In Use") return "bg-red-50";
  if (uiStatus === "Cleaning") return "bg-amber-50";
  if (uiStatus === "Maintenance") return "bg-slate-50";
  return "bg-emerald-50";
};

export function OperatingRooms() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OperatingRoomOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRoomId, setUpdatingRoomId] = useState<number | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await clinicalApi.getOperatingRoomsOverview();
      setOverview(data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to load operating rooms.");
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404 || message.toLowerCase().includes("no static resource")) {
        setOverview(null);
        setError(null);
      } else {
        setOverview(null);
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleMarkReady = async (room: OperatingRoomCardResponse) => {
    setUpdatingRoomId(room.id);
    try {
      await clinicalApi.updateOperatingRoomStatus(room.id, "AVAILABLE");
      await loadOverview();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update room status."));
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const stats = overview?.stats;
  const rooms = overview?.rooms ?? [];
  const week = overview?.weekSchedule;

  return (
    <div>
      <PageHeader
        title="Operating Rooms"
        subtitle="Real-time OR availability and scheduling"
      />

      {error && (
        <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard
          title="Total ORs"
          value={loading ? "—" : String(stats?.total ?? 0)}
          subtitle="Operating rooms"
          icon={<DoorOpen size={20} className="text-[#1E3A5F]" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Currently In Use"
          value={loading ? "—" : String(stats?.inUse ?? 0)}
          subtitle="Active procedures"
          icon={<DoorOpen size={20} className="text-[#EF4444]" />}
          iconBg="bg-red-50"
        />
        <StatCard
          title="Available Now"
          value={loading ? "—" : String(stats?.available ?? 0)}
          subtitle="Ready to use"
          icon={<DoorOpen size={20} className="text-[#10B981]" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Under Cleaning"
          value={loading ? "—" : String(stats?.cleaning ?? 0)}
          subtitle="In preparation"
          icon={<DoorOpen size={20} className="text-[#F59E0B]" />}
          iconBg="bg-amber-50"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#64748B]">Loading operating rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-[#64748B]">No operating rooms configured yet.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
          {rooms.map((or) => (
            <div
              key={or.id}
              className={`bg-white rounded-xl border-2 overflow-hidden ${borderClass(or.uiStatus)}`}
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div className={`px-5 py-3 flex items-center justify-between ${headerBg(or.uiStatus)}`}>
                <h3 className="font-bold text-[#0F172A] text-lg">{or.name}</h3>
                <Badge variant={badgeVariant(or.uiStatus)}>
                  {or.uiStatus === "In Use" ? "In Use" : or.uiStatus}
                </Badge>
              </div>
              <div className="p-5 space-y-3">
                {or.uiStatus === "In Use" && or.current && (
                  <>
                    <div className="bg-[#F8FAFC] rounded-xl p-3 space-y-1">
                      <p className="font-semibold text-[#0F172A] text-sm">{or.current.surgeryType}</p>
                      <p className="text-xs text-[#64748B]">
                        Patient: {or.current.patientName} · Surgeon: {or.current.surgeonName}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Started: {formatDateTime(or.current.actualStartAt ?? or.current.scheduledAt)} · Est. End:{" "}
                        {formatDateTime(or.current.estimatedEndAt)}
                      </p>
                    </div>
                    {or.current.progressPercent != null && (
                      <div>
                        <div className="flex justify-between text-xs text-[#64748B] mb-1">
                          <span>Procedure Progress</span>
                          <span className="font-semibold text-[#F59E0B]">{or.current.progressPercent}%</span>
                        </div>
                        <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div
                            className="h-2.5 rounded-full bg-[#F59E0B]"
                            style={{ width: `${or.current.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {or.current.surgeryId && (
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/surgeries/${or.current!.surgeryId}`)}
                        className="w-full h-9 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                      >
                        View Surgery
                      </button>
                    )}
                  </>
                )}

                {or.uiStatus === "Available" && (
                  <>
                    {or.lastSurgery && (
                      <div className="text-sm text-[#64748B]">
                        <span className="text-xs text-[#94A3B8]">Last used: </span>
                        {formatDateTime(or.lastSurgery.actualEndAt ?? or.lastSurgery.scheduledAt)} —{" "}
                        {or.lastSurgery.surgeryType} ({or.lastSurgery.surgeonName})
                      </div>
                    )}
                    {or.nextSurgery && (
                      <div className="bg-[#F0F9FF] rounded-xl p-3">
                        <p className="text-xs text-[#94A3B8] mb-1">Next Scheduled</p>
                        <p className="font-semibold text-[#0F172A] text-sm">{or.nextSurgery.surgeryType}</p>
                        <p className="text-xs text-[#64748B]">
                          {formatDateTime(or.nextSurgery.scheduledAt)} · {or.nextSurgery.surgeonName}
                        </p>
                      </div>
                    )}
                    {or.upcoming.length > 0 && (
                      <div className="space-y-1.5">
                        {or.upcoming.map((u) => (
                          <div
                            key={u.surgeryId}
                            className="flex items-center justify-between text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg px-3 py-2"
                          >
                            <span className="font-medium text-[#0F172A]">{u.surgeryType}</span>
                            <span>{formatDateTime(u.scheduledAt)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled
                      title="Schedule from Doctor → Surgeries"
                      className="w-full h-9 rounded-lg bg-[#1E3A5F]/50 text-white text-sm font-medium cursor-not-allowed"
                    >
                      Schedule Surgery (Doctor module)
                    </button>
                  </>
                )}

                {or.uiStatus === "Cleaning" && (
                  <>
                    {or.lastSurgery && (
                      <div className="text-sm text-[#64748B]">
                        <span className="text-xs text-[#94A3B8]">Last surgery ended: </span>
                        {formatDateTime(or.lastSurgery.actualEndAt ?? or.lastSurgery.scheduledAt)} —{" "}
                        {or.lastSurgery.surgeryType}
                      </div>
                    )}
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-xs text-[#94A3B8] mb-1">Estimated Ready</p>
                      <p className="font-semibold text-amber-700 text-sm">
                        {or.estReady ? formatDateTime(or.estReady) : "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={updatingRoomId === or.id}
                      onClick={() => handleMarkReady(or)}
                      className="w-full h-9 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
                    >
                      {updatingRoomId === or.id ? "Updating..." : "Mark as Ready"}
                    </button>
                  </>
                )}

                {or.uiStatus === "Maintenance" && (
                  <p className="text-sm text-[#64748B]">This room is under maintenance and unavailable for scheduling.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Surgery Schedule — This Week</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            {week
              ? `${week.weekStart} – ${week.weekEnd}`
              : "Weekly schedule"}
          </p>
        </div>
        <div className="overflow-x-auto p-4">
          {loading || !week ? (
            <div className="py-8 text-center text-[#64748B]">Loading schedule...</div>
          ) : (
            <div className="min-w-[700px]">
              <div className="grid gap-0.5 mb-2" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
                <div />
                {week.dayLabels.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-[#64748B] py-1">
                    {d}
                  </div>
                ))}
              </div>

              {week.rows.map((row) => (
                <div
                  key={row.orName}
                  className="grid gap-0.5 mb-1.5 items-stretch"
                  style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}
                >
                  <div className="flex items-center justify-end pr-3">
                    <span className="text-xs font-semibold text-[#64748B]">{row.orName}</span>
                  </div>
                  {week.dayLabels.map((_, dayIdx) => {
                    const blocks = row.blocks.filter((b) => b.dayIndex === dayIdx);
                    return (
                      <div
                        key={dayIdx}
                        className="h-10 bg-[#F8FAFC] rounded border border-[#E2E8F0] relative overflow-hidden"
                      >
                        {blocks.map((b, bi) => (
                          <div
                            key={bi}
                            className={`absolute inset-y-0 left-0 right-0 flex items-center px-1.5 rounded ${SCHEDULE_COLORS[b.colorKey] ?? SCHEDULE_COLORS.scheduled}`}
                          >
                            <span className="text-[9px] font-semibold truncate">{b.label}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="flex gap-4 mt-3 flex-wrap">
                {[
                  { color: "bg-[#1E3A5F]", label: "Cardiac / CABG" },
                  { color: "bg-[#0EA5E9]", label: "Orthopedics" },
                  { color: "bg-[#10B981]", label: "General Surgery" },
                  { color: "bg-[#8B5CF6]", label: "Scheduled (other)" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#64748B]">
                    <span className={`w-3 h-3 rounded ${l.color}`} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
