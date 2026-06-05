import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, CareTaskResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";

const priorityBadge = (p: string): "urgent" | "warning" | "info" => p === "URGENT" || p === "urgent" ? "urgent" : p === "HIGH" || p === "high" ? "warning" : "info";

const columns = [
  { id: "PENDING", label: "To Do", color: "border-t-[#E2E8F0]", dot: "bg-[#94A3B8]" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-t-[#0EA5E9]", dot: "bg-[#0EA5E9]" },
  { id: "COMPLETED", label: "Completed", color: "border-t-[#10B981]", dot: "bg-[#10B981]" },
];

export function NurseCareTasks() {
  const { userId, firstName, lastName } = useAuth();
  const [tasks, setTasks] = useState<CareTaskResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "NORMAL", patientId: "" });
  const [loading, setLoading] = useState(true);

  const nurseName = `${firstName || ""} ${lastName || ""}`.trim() || "Nurse";

  useEffect(() => {
    if (!userId) return;
    clinicalApi.getCareTasksAssignedTo(userId).then(r => {
      setTasks(r.data);
      const pIds = Array.from(new Set(r.data.map(t => t.patientId)));
      pIds.forEach(id => {
        patientApi.getProfileByUserId(id)
          .then(p => setPatients(prev => ({ ...prev, [id]: `${p.data.firstName || ""} ${p.data.lastName || ""}`.trim() || `Patient #${id}` })))
          .catch(() => setPatients(prev => ({ ...prev, [id]: `Patient #${id}` })));
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  const moveTask = (id: number, newStatus: string) => {
    clinicalApi.updateCareTaskStatus(id, newStatus).then(() => {
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
    }).catch(console.error);
  };

  const addTask = () => {
    if (!newTask.title || !newTask.patientId) return;
    
    clinicalApi.createCareTask({
      patientId: Number(newTask.patientId),
      assignedTo: userId || 0,
      title: newTask.title,
      priority: newTask.priority
    }).then(res => {
      setTasks(prev => [...prev, res.data]);
      setNewTask({ title: "", priority: "NORMAL", patientId: "" });
      setShowAdd(false);
    }).catch(console.error);
  };

  return (
    <div>
      <PageHeader
        title="Care Tasks"
        subtitle="Kanban board for nursing care tasks"
        actions={
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={15} />Add Task
          </button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading tasks…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id || (col.id === "PENDING" && t.status !== "IN_PROGRESS" && t.status !== "COMPLETED"));
            return (
              <div key={col.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <h3 className="font-semibold text-[#0F172A]">{col.label}</h3>
                  <span className="ml-auto text-xs bg-[#F0F4F8] text-[#64748B] px-2 py-0.5 rounded-full font-medium">{colTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {colTasks.map((t) => (
                    <div key={t.id} className={`bg-white rounded-xl p-4 border-t-4 border border-[#E2E8F0] ${col.color}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-[#0F172A] flex-1">{t.title}</p>
                        <Badge variant={priorityBadge(t.priority)}>{t.priority}</Badge>
                      </div>
                      <p className="text-xs text-[#64748B] mb-3">Patient: {patients[t.patientId] || `Patient #${t.patientId}`}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold">
                            {nurseName[0]}
                          </div>
                          <span className="text-xs text-[#64748B] truncate max-w-[80px]">{nurseName}</span>
                        </div>
                        <select
                          value={t.status === "IN_PROGRESS" ? "IN_PROGRESS" : t.status === "COMPLETED" ? "COMPLETED" : "PENDING"}
                          onChange={(e) => moveTask(t.id, e.target.value)}
                          className="text-xs border border-[#E2E8F0] rounded-lg px-2 py-1 text-[#64748B] outline-none bg-white focus:ring-1 focus:ring-[#0EA5E9]"
                        >
                          <option value="PENDING">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="bg-[#F8FAFC] rounded-xl p-6 border border-dashed border-[#E2E8F0] text-center">
                      <p className="text-xs text-[#94A3B8]">No tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">Add New Task</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Task Description</label>
                <input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g. Change IV line" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Priority</label>
                <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Patient ID</label>
                <input value={newTask.patientId} onChange={(e) => setNewTask({ ...newTask, patientId: e.target.value })} placeholder="Enter patient ID" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button onClick={addTask} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:opacity-90">Add Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
