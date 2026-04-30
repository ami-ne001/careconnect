import { useState } from "react";
import { Plus, Edit2, Users, Heart, Brain, Bone, Baby, Zap, FlaskConical } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const departments = [
  { name: "Cardiology", head: "Dr. Emily Ross", staff: 12, patients: 89, color: "bg-red-100", iconColor: "text-red-500", icon: <Heart size={22} /> },
  { name: "Neurology", head: "Dr. Alan Park", staff: 9, patients: 67, color: "bg-purple-100", iconColor: "text-purple-500", icon: <Brain size={22} /> },
  { name: "Orthopedics", head: "Dr. Sarah Lane", staff: 11, patients: 74, color: "bg-blue-100", iconColor: "text-blue-500", icon: <Bone size={22} /> },
  { name: "Pediatrics", head: "Dr. Mark Chen", staff: 14, patients: 103, color: "bg-green-100", iconColor: "text-green-500", icon: <Baby size={22} /> },
  { name: "Emergency", head: "Dr. Lisa Park", staff: 18, patients: 142, color: "bg-orange-100", iconColor: "text-orange-500", icon: <Zap size={22} /> },
  { name: "Laboratory", head: "Dr. Tom Hill", staff: 6, patients: null, color: "bg-cyan-100", iconColor: "text-cyan-500", icon: <FlaskConical size={22} /> },
];

const staffData = [
  { name: "Dr. Emily Ross", role: "Head of Department", dept: "Cardiology", status: "active" },
  { name: "Dr. James Holloway", role: "Senior Cardiologist", dept: "Cardiology", status: "active" },
  { name: "Nurse Sofia Vargas", role: "Cardiac Nurse", dept: "Cardiology", status: "active" },
  { name: "Nurse Chen Wei", role: "Cardiac Nurse", dept: "Cardiology", status: "active" },
  { name: "Dr. Michael Torres", role: "Cardiologist", dept: "Cardiology", status: "inactive" },
];

export function AdminDepartments() {
  const [selected, setSelected] = useState("Cardiology");

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage hospital departments and staff assignments"
        actions={
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={15} />Create Department
          </button>
        }
      />

      {/* Department cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-7">
        {departments.map((dept) => (
          <div
            key={dept.name}
            onClick={() => setSelected(dept.name)}
            className={`bg-white rounded-xl p-5 border-2 cursor-pointer transition-all hover:shadow-md ${selected === dept.name ? "border-[#0EA5E9]" : "border-[#E2E8F0]"}`}
            style={{ boxShadow: selected === dept.name ? "0 4px 16px rgba(14,165,233,0.15)" : "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${dept.color} ${dept.iconColor} flex items-center justify-center`}>
                {dept.icon}
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]">
                  <Edit2 size={13} />
                </button>
                <button className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC]">
                  <Users size={13} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-[#0F172A] mb-1">{dept.name}</h3>
            <p className="text-xs text-[#64748B] mb-3">{dept.head}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-[#94A3B8]" />
                <span className="font-semibold text-[#0F172A]">{dept.staff}</span>
                <span className="text-[#64748B]">staff</span>
              </div>
              <div className="w-px h-4 bg-[#E2E8F0]" />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#0F172A]">{dept.patients ?? "—"}</span>
                <span className="text-[#64748B]">{dept.patients ? "patients" : ""}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staff table for selected dept */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="font-semibold text-[#0F172A]">{selected} — Department Staff</h3>
          <span className="text-sm text-[#64748B]">{staffData.length} members</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Staff Member", "Role", "Department", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffData.map((s, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-semibold">
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-[#0F172A]">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">{s.role}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{s.dept}</td>
                  <td className="px-5 py-3.5"><Badge variant={s.status === "active" ? "active" : "inactive"} dot>{s.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8]">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
