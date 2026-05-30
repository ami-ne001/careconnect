import { useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, X, Filter } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const users = [
  { id: 1, name: "Dr. James Holloway", email: "james.holloway@careconnect.com", role: "Doctor", dept: "Cardiology", joined: "Jan 12, 2024", lastLogin: "Today", status: "active" },
  { id: 2, name: "Nurse Linda Torres", email: "linda.torres@careconnect.com", role: "Nurse", dept: "Emergency", joined: "Mar 5, 2023", lastLogin: "Today", status: "active" },
  { id: 3, name: "Emma Roberts", email: "emma.roberts@careconnect.com", role: "Receptionist", dept: "Front Desk", joined: "Jun 20, 2023", lastLogin: "Yesterday", status: "active" },
  { id: 4, name: "Marcus Webb", email: "marcus.webb@careconnect.com", role: "Pharmacist", dept: "Pharmacy", joined: "Feb 14, 2023", lastLogin: "Today", status: "active" },
  { id: 5, name: "Priya Nair", email: "priya.nair@careconnect.com", role: "Lab Technician", dept: "Laboratory", joined: "Apr 9, 2024", lastLogin: "Today", status: "active" },
  { id: 6, name: "Dr. Emily Ross", email: "emily.ross@careconnect.com", role: "Doctor", dept: "Cardiology", joined: "Nov 3, 2022", lastLogin: "2 days ago", status: "active" },
  { id: 7, name: "Dr. Alan Park", email: "alan.park@careconnect.com", role: "Doctor", dept: "Neurology", joined: "Dec 1, 2021", lastLogin: "Today", status: "active" },
  { id: 8, name: "Thomas Green", email: "thomas.green@careconnect.com", role: "Nurse", dept: "Pediatrics", joined: "May 18, 2023", lastLogin: "3 days ago", status: "inactive" },
  { id: 9, name: "Sofia Vargas", email: "sofia.vargas@careconnect.com", role: "Nurse", dept: "Orthopedics", joined: "Aug 7, 2023", lastLogin: "Today", status: "active" },
  { id: 10, name: "Nathan Cole", email: "nathan.cole@careconnect.com", role: "Lab Technician", dept: "Laboratory", joined: "Sep 22, 2023", lastLogin: "1 week ago", status: "inactive" },
];

const roleBadge: Record<string, "info" | "active" | "pending" | "warning"> = {
  Doctor: "info", Nurse: "active", Receptionist: "pending", Pharmacist: "warning", "Lab Technician": "completed" as any,
};

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editUser, setEditUser] = useState<typeof users[0] | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage all hospital staff accounts"
        actions={
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 transition-all">
            <Plus size={15} />Add New User
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] mb-5 flex flex-wrap gap-3 items-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={15} className="text-[#64748B] shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="bg-transparent text-sm w-full outline-none text-[#0F172A] placeholder:text-[#94A3B8]" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] bg-white outline-none focus:ring-2 focus:ring-[#0EA5E9]">
          <option>All</option>
          {["Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Technician"].map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] bg-white outline-none focus:ring-2 focus:ring-[#0EA5E9]">
          <option>All</option>
          <option>active</option>
          <option>inactive</option>
          <option>suspended</option>
        </select>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC]">
          <Filter size={14} />Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Name / Email", "Role", "Department", "Date Joined", "Last Login", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{u.name}</p>
                        <p className="text-xs text-[#64748B]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><Badge variant="info">{u.role}</Badge></td>
                  <td className="px-5 py-3.5 text-[#64748B]">{u.dept}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{u.joined}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{u.lastLogin}</td>
                  <td className="px-5 py-3.5"><Badge variant={u.status === "active" ? "active" : "inactive"} dot>{u.status}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditUser(u)} className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8] transition-colors">Edit</button>
                      <button className="px-3 py-1.5 rounded-lg bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-5 py-4 border-t border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <span className="text-sm text-[#64748B]">Showing 1–10 of 124 users</span>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-white transition-colors"><ChevronLeft size={15} /></button>
            {[1, 2, 3].map((n) => (
              <button key={n} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === 1 ? "bg-[#1E3A5F] text-white" : "border border-[#E2E8F0] text-[#64748B] hover:bg-white"}`}>{n}</button>
            ))}
            <button className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-white transition-colors"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {/* Edit slide-over */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setEditUser(null)} />
          <div className="w-96 bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Edit User</h3>
              <button onClick={() => setEditUser(null)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {[{ label: "Full Name", value: editUser.name }, { label: "Email", value: editUser.email }].map((f) => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{f.label}</label>
                  <input defaultValue={f.value} className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Role</label>
                <select defaultValue={editUser.role} className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                  {["Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Technician"].map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Department</label>
                <input defaultValue={editUser.dept} className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0]">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">Account Status</p>
                  <p className="text-xs text-[#64748B]">Toggle to activate or deactivate</p>
                </div>
                <button className={`w-12 h-6 rounded-full transition-colors relative ${editUser.status === "active" ? "bg-[#10B981]" : "bg-[#CBD5E1]"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${editUser.status === "active" ? "left-7" : "left-1"}`} />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex gap-3">
              <button onClick={() => setEditUser(null)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={() => setEditUser(null)} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
