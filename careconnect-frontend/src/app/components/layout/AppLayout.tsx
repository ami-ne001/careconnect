import { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ChevronRight, Home } from "lucide-react";

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.replace(/^\//, "").split("/");

  const labels: Record<string, string> = {
    admin: "Admin", doctor: "Doctor", nurse: "Nurse", receptionist: "Receptionist",
    patient: "Patient", pharmacist: "Pharmacist", lab: "Lab",
    dashboard: "Dashboard", "users-management": "User Management",
    departments: "Departments", "audit-logs": "Audit Logs",
    reports: "Reports & Analytics", "system-config": "System Config",
    appointments: "Appointments", patients: "Patients",
    consultations: "Consultations", prescriptions: "Prescriptions",
    "lab-requests": "Lab Requests", "medical-records": "Medical Records",
    "vitals-monitoring": "Vitals Monitoring", medications: "Medications",
    "care-tasks": "Care Tasks", "patient-registration": "Patient Registration",
    "queue-management": "Queue Management", billing: "Billing",
    "check-in": "Check-in", profile: "My Profile",
    "prescriptions-queue": "Prescriptions Queue",
    "medication-inventory": "Medication Inventory",
    "dispensing-history": "Dispensing History",
    "drug-interactions": "Drug Interactions",
    "test-requests": "Test Requests", "test-processing": "Test Processing",
    "results-upload": "Results Upload", "equipment-status": "Equipment Status",
  };

  return (
    <div className="flex items-center gap-1.5 text-sm mb-6">
      <Home size={14} className="text-[#64748B]" />
      {parts.map((part, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <ChevronRight size={13} className="text-[#CBD5E1]" />
          <span className={idx === parts.length - 1 ? "text-[#0F172A] font-medium" : "text-[#64748B]"}>
            {labels[part] || part}
          </span>
        </span>
      ))}
    </div>
  );
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("cc_token");
  const role = localStorage.getItem("cc_role");
  
  if (!token || !role) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8]" style={{ fontFamily: "Inter, sans-serif" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
