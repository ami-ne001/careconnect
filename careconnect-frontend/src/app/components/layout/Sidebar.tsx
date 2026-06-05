import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Building2, FileText, BarChart3, Settings,
  Calendar, UserCircle, ClipboardList, Pill, FlaskConical, FolderOpen,
  HeartPulse, Stethoscope, Activity, Clock, CreditCard, UserCheck,
  History, AlertTriangle, TestTube, Upload, Wrench, LogOut,
  ChevronRight, Bed, LayoutGrid, DoorOpen, Scissors,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navByRole: Record<string, NavItem[]> = {
  Admin: [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin/dashboard" },
    { label: "User Management", icon: <Users size={18} />, path: "/admin/users-management" },
    { label: "Doctor Schedules", icon: <Calendar size={18} />, path: "/admin/doctor-schedules" },
    { label: "Wards & Rooms", icon: <Building2 size={18} />, path: "/admin/wards-rooms" },
    { label: "Departments", icon: <Building2 size={18} />, path: "/admin/departments" },
    { label: "Audit Logs", icon: <FileText size={18} />, path: "/admin/audit-logs" },
    { label: "Reports & Analytics", icon: <BarChart3 size={18} />, path: "/admin/reports" },
    { label: "System Config", icon: <Settings size={18} />, path: "/admin/system-config" },
    { label: "Operating Rooms", icon: <DoorOpen size={18} />, path: "/admin/operating-rooms" },
  ],
  Doctor: [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/doctor/dashboard" },
    { label: "My Appointments", icon: <Calendar size={18} />, path: "/doctor/appointments" },
    { label: "Patients", icon: <Users size={18} />, path: "/doctor/patients" },
    { label: "Consultations", icon: <Stethoscope size={18} />, path: "/doctor/consultations" },
    { label: "Surgeries", icon: <Scissors size={18} />, path: "/doctor/surgeries" },
    { label: "Prescriptions", icon: <Pill size={18} />, path: "/doctor/prescriptions" },
    { label: "Lab Requests", icon: <FlaskConical size={18} />, path: "/doctor/lab-requests" },
    { label: "Medical Records", icon: <FolderOpen size={18} />, path: "/doctor/medical-records" },
  ],
  Nurse: [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/nurse/dashboard" },
    { label: "Patients", icon: <Users size={18} />, path: "/nurse/patients" },
    { label: "Vitals Monitoring", icon: <HeartPulse size={18} />, path: "/nurse/vitals-monitoring" },
    { label: "Care Tasks", icon: <ClipboardList size={18} />, path: "/nurse/care-tasks" },
  ],
  Receptionist: [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/receptionist/dashboard" },
    { label: "Appointments", icon: <Calendar size={18} />, path: "/receptionist/appointments" },
    { label: "Patient Registration", icon: <UserCircle size={18} />, path: "/receptionist/patient-registration" },
    { label: "Queue Management", icon: <Clock size={18} />, path: "/receptionist/queue-management" },
    { label: "Billing", icon: <CreditCard size={18} />, path: "/receptionist/billing" },
    { label: "Check-in", icon: <UserCheck size={18} />, path: "/receptionist/check-in" },
    { label: "Admissions", icon: <Bed size={18} />, path: "/receptionist/admissions" },
    { label: "Room Board", icon: <LayoutGrid size={18} />, path: "/receptionist/rooms" },
    { label: "Operating Rooms", icon: <DoorOpen size={18} />, path: "/admin/operating-rooms" },
  ],
  Patient: [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/patient/dashboard" },
    { label: "My Appointments", icon: <Calendar size={18} />, path: "/patient/appointments" },
    { label: "Medical Records", icon: <FolderOpen size={18} />, path: "/patient/medical-records" },
    { label: "Prescriptions", icon: <Pill size={18} />, path: "/patient/prescriptions" },
    { label: "Lab Results", icon: <FlaskConical size={18} />, path: "/patient/lab-results" },
    { label: "Billing", icon: <CreditCard size={18} />, path: "/patient/billing" },
    { label: "My Profile", icon: <UserCircle size={18} />, path: "/patient/profile" },
  ],
  "Lab Technician": [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/lab/dashboard" },
    { label: "Test Catalog", icon: <FlaskConical size={18} />, path: "/lab/test-catalog" },
    { label: "Test Workflow", icon: <Activity size={18} />, path: "/lab/test-requests" },
    { label: "Equipment Status", icon: <Wrench size={18} />, path: "/lab/equipment-status" },
  ],
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("cc_role") || "Admin";
  const userName = localStorage.getItem("cc_user") || "Admin User";
  const navItems = navByRole[role] || navByRole["Admin"];
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Group receptionist inpatient links
  const receptionistInpatientPaths = ["/receptionist/admissions", "/receptionist/rooms", "/admin/operating-rooms"];

  const handleLogout = () => {
    localStorage.removeItem("cc_role");
    localStorage.removeItem("cc_user");
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_userId");
    localStorage.removeItem("cc_email");
    localStorage.removeItem("cc_firstName");
    localStorage.removeItem("cc_lastName");
    localStorage.removeItem("cc-auth");
    window.dispatchEvent(new Event("cc-auth-change"));
    navigate("/auth/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300
          lg:relative lg:translate-x-0 lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: 240, background: "#1E3A5F" }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-2 px-5 border-b border-white/10" style={{ height: 64 }}>
          <div className="w-7 h-7 rounded-md bg-[#0EA5E9] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v14M1 8h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-bold text-base tracking-tight">CareConnect</span>
        </div>

        {/* Role label */}
        <div className="px-5 py-3">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">{role}</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {role === "Receptionist" ? (
            <>
              {navItems.filter((item) => !receptionistInpatientPaths.includes(item.path)).map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative
                      ${isActive
                        ? "bg-[#0EA5E9]/20 text-white border-l-[3px] border-[#0EA5E9]"
                        : "text-white/70 hover:bg-white/10 hover:text-white border-l-[3px] border-transparent"
                      }`}
                  >
                    <span className={isActive ? "text-[#0EA5E9]" : "text-white/60"}>{item.icon}</span>
                    <span>{item.label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto text-[#0EA5E9]" />}
                  </button>
                );
              })}
              {/* Inpatient Management group */}
              <div className="pt-2">
                <p className="text-[9px] uppercase tracking-widest text-white/30 font-semibold px-3 pb-1.5">Inpatient Management</p>
                {navItems.filter((item) => receptionistInpatientPaths.includes(item.path)).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); onClose(); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative
                        ${isActive
                          ? "bg-[#0EA5E9]/20 text-white border-l-[3px] border-[#0EA5E9]"
                          : "text-white/70 hover:bg-white/10 hover:text-white border-l-[3px] border-transparent"
                        }`}
                    >
                      <span className={isActive ? "text-[#0EA5E9]" : "text-white/60"}>{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto text-[#0EA5E9]" />}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative
                    ${isActive
                      ? "bg-[#0EA5E9]/20 text-white border-l-[3px] border-[#0EA5E9]"
                      : "text-white/70 hover:bg-white/10 hover:text-white border-l-[3px] border-transparent"
                    }`}
                >
                  <span className={isActive ? "text-[#0EA5E9]" : "text-white/60"}>{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-[#0EA5E9]" />}
                </button>
              );
            })
          )}
        </nav>

        {/* Bottom user card */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userName}</p>
              <p className="text-white/50 text-xs truncate">{role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-white/40 hover:text-white transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}