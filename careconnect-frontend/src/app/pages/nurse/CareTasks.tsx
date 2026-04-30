import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

interface Task { id: number; task: string; priority: string; patient: string; nurse: string; status: string; }

const initialTasks: Task[] = [
  { id: 1, task: "Change dressing Room 302", priority: "high", patient: "Carlos Rivera", nurse: "Linda Torres", status: "todo" },
  { id: 2, task: "Monitor post-op patient Room 305", priority: "urgent", patient: "Omar Benali", nurse: "Linda Torres", status: "todo" },
  { id: 3, task: "Assist with patient transfer Room 308", priority: "normal", patient: "Maria Santos", nurse: "Sofia Vargas", status: "todo" },
  { id: 4, task: "Prepare IV line for Room 303", priority: "urgent", patient: "John Whitaker", nurse: "Linda Torres", status: "todo" },
  { id: 5, task: "IV line check Room 301", priority: "urgent", patient: "Fatima Al-Zahrani", nurse: "Linda Torres", status: "inprogress" },
  { id: 6, task: "Assist with ambulation Room 307", priority: "normal", patient: "Thomas Grey", nurse: "Sofia Vargas", status: "inprogress" },
  { id: 7, task: "Morning vitals round (all rooms)", priority: "normal", patient: "All Patients", nurse: "Linda Torres", status: "completed" },
  { id: 8, task: "Administered AM medications", priority: "high", patient: "Multiple", nurse: "Linda Torres", status: "completed" },
  { id: 9, task: "Updated patient charts", priority: "normal", patient: "Multiple", nurse: "Sofia Vargas", status: "completed" },
];

const priorityBadge = (p: string): "urgent" | "warning" | "info" => p === "urgent" ? "urgent" : p === "high" ? "warning" : "info";

const columns = [
  { id: "todo", label: "To Do", color: "border-t-[#E2E8F0]", dot: "bg-[#94A3B8]" },
  { id: "inprogress", label: "In Progress", color: "border-t-[#0EA5E9]", dot: "bg-[#0EA5E9]" },
  { id: "completed", label: "Completed", color: "border-t-[#10B981]", dot: "bg-[#10B981]" },
];

export function NurseCareTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ task: "", priority: "normal", patient: "", nurse: "Linda Torres" });

  const moveTask = (id: number, newStatus: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
  };

  const addTask = () => {
    if (!newTask.task) return;
    setTasks((prev) => [...prev, { ...newTask, id: Date.now(), status: "todo" }]);
    setNewTask({ task: "", priority: "normal", patient: "", nurse: "Linda Torres" });
    setShowAdd(false);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
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
                      <p className="text-sm font-semibold text-[#0F172A] flex-1">{t.task}</p>
                      <Badge variant={priorityBadge(t.priority)}>{t.priority}</Badge>
                    </div>
                    <p className="text-xs text-[#64748B] mb-3">Patient: {t.patient}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold">
                          {t.nurse.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-xs text-[#64748B]">{t.nurse}</span>
                      </div>
                      <select
                        value={t.status}
                        onChange={(e) => moveTask(t.id, e.target.value)}
                        className="text-xs border border-[#E2E8F0] rounded-lg px-2 py-1 text-[#64748B] outline-none bg-white focus:ring-1 focus:ring-[#0EA5E9]"
                      >
                        <option value="todo">To Do</option>
                        <option value="inprogress">In Progress</option>
                        <option value="completed">Completed</option>
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
                <input value={newTask.task} onChange={(e) => setNewTask({ ...newTask, task: e.target.value })} placeholder="e.g. Change IV line Room 302" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Priority</label>
                <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Patient</label>
                <input value={newTask.patient} onChange={(e) => setNewTask({ ...newTask, patient: e.target.value })} placeholder="Patient name or room" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button onClick={addTask} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold">Add Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
