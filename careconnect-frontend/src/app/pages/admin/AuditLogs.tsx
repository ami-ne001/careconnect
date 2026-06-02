import { useEffect, useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { clinicalApi, type AuditActivityResponse } from "@/api";
import { getApiErrorMessage } from "@/utils/apiError";

const actionStyle: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-slate-100 text-slate-600",
  LOGOUT: "bg-slate-100 text-slate-600",
  VIEW: "bg-gray-100 text-gray-500",
  EXPORT: "bg-indigo-100 text-indigo-700",
};

export function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [logs, setLogs] = useState<AuditActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [size, total]);

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await clinicalApi.getAuditLogs({
          q: search.trim() || undefined,
          action: actionFilter === "All" ? undefined : actionFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
          size,
        });
        setLogs(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        setLogs([]);
        setTotal(0);
        const message = getApiErrorMessage(err, "Failed to load audit logs.");
        const status = (err as any)?.response?.status;

        // If backend route is not available yet (404/no static resource),
        // treat it as an empty dataset instead of a hard error.
        const shouldTreatAsEmpty =
          status === 404 || message.toLowerCase().includes("no static resource");

        if (shouldTreatAsEmpty) {
          setError(null);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [actionFilter, endDate, page, search, size, startDate]);

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const formatRole = (raw: string) =>
    raw
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const fromEntry = total === 0 ? 0 : page * size + 1;
  const toEntry = Math.min(total, page * size + logs.length);

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Complete record of all system actions and user activity"
        actions={
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#94A3B8] cursor-not-allowed"
          >
            <Download size={15} />Export CSV
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] mb-5 flex flex-wrap gap-3 items-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={15} className="text-[#64748B] shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            placeholder="Search user, details, module, action, IP..."
            className="bg-transparent text-sm w-full outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setPage(0);
            setActionFilter(e.target.value);
          }}
          className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] bg-white outline-none"
        >
          <option>All</option>
          {["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT"].map((a) => <option key={a}>{a}</option>)}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setPage(0);
            setStartDate(e.target.value);
          }}
          className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] bg-white outline-none"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setPage(0);
            setEndDate(e.target.value);
          }}
          className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] bg-white outline-none"
        />
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#64748B]">Loading audit logs...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-red-600">{error}</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#64748B]">No audit log entries found.</td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                    <td className="px-5 py-3.5 text-xs text-[#64748B] whitespace-nowrap font-mono">{formatTimestamp(log.createdAt)}</td>
                    <td className="px-5 py-3.5 font-medium text-[#0F172A] whitespace-nowrap">{log.userName}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{formatRole(log.role)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${actionStyle[log.action] || "bg-gray-100 text-gray-500"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{log.module}</td>
                    <td className="px-5 py-3.5 text-[#64748B] max-w-xs truncate">{log.description || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-[#64748B] font-mono">{log.ipAddress || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-[#64748B]">
              Showing {fromEntry}-{toEntry} of {total} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-md border border-[#E2E8F0] text-sm text-[#334155] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-[#64748B]">Page {page + 1} / {totalPages}</span>
              <button
                disabled={page + 1 >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-md border border-[#E2E8F0] text-sm text-[#334155] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
