import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";

// Auth
import { Login } from "./pages/auth/Login";
import { ForgotPassword } from "./pages/auth/ForgotPassword";

// Admin
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminUsers } from "./pages/admin/UsersManagement";
import { AdminDepartments } from "./pages/admin/Departments";
import { AdminAuditLogs } from "./pages/admin/AuditLogs";
import { AdminReports } from "./pages/admin/Reports";
import { AdminSystemConfig } from "./pages/admin/SystemConfig";
import { OperatingRooms } from "./pages/admin/OperatingRooms";

// Doctor
import { DoctorDashboard } from "./pages/doctor/Dashboard";
import { DoctorAppointments } from "./pages/doctor/Appointments";
import { DoctorPatients } from "./pages/doctor/Patients";
import { PatientProfile } from "./pages/doctor/PatientProfile";
import { DoctorConsultations } from "./pages/doctor/Consultations";
import { DoctorPrescriptions } from "./pages/doctor/Prescriptions";
import { DoctorLabRequests } from "./pages/doctor/LabRequests";
import { DoctorMedicalRecords } from "./pages/doctor/MedicalRecords";
import { DoctorSurgeries } from "./pages/doctor/Surgeries";
import { SurgeryDetail } from "./pages/doctor/SurgeryDetail";

// Nurse
import { NurseDashboard } from "./pages/nurse/Dashboard";
import { NursePatients } from "./pages/nurse/Patients";
import { NurseVitals } from "./pages/nurse/VitalsMonitoring";
import { NurseMedications } from "./pages/nurse/Medications";
import { NurseCareTasks } from "./pages/nurse/CareTasks";
import { NurseAppointments } from "./pages/nurse/Appointments";

// Receptionist
import { ReceptionistDashboard } from "./pages/receptionist/Dashboard";
import { ReceptionistAppointments } from "./pages/receptionist/Appointments";
import { PatientRegistration } from "./pages/receptionist/PatientRegistration";
import { QueueManagement } from "./pages/receptionist/QueueManagement";
import { ReceptionistBilling } from "./pages/receptionist/Billing";
import { CheckIn } from "./pages/receptionist/CheckIn";
import { AdmissionsManagement } from "./pages/receptionist/Admissions";
import { RoomsBoard } from "./pages/receptionist/Rooms";

// Patient
import { PatientDashboard } from "./pages/patient/Dashboard";
import { PatientAppointments } from "./pages/patient/Appointments";
import { PatientMedicalRecords } from "./pages/patient/MedicalRecords";
import { PatientPrescriptions } from "./pages/patient/Prescriptions";
import { PatientLabResults } from "./pages/patient/LabResults";
import { PatientBilling } from "./pages/patient/Billing";
import { PatientProfilePage } from "./pages/patient/Profile";

// Lab
import { LabDashboard } from "./pages/lab/Dashboard";
import { LabTestRequests } from "./pages/lab/TestRequests";
import { LabTestProcessing } from "./pages/lab/TestProcessing";
import { LabResultsUpload } from "./pages/lab/ResultsUpload";
import { LabEquipmentStatus } from "./pages/lab/EquipmentStatus";

export const router = createBrowserRouter([
  { path: "/", Component: Login },
  { path: "/auth/login", Component: Login },
  { path: "/auth/forgot-password", Component: ForgotPassword },
  {
    path: "/",
    Component: AppLayout,
    children: [
      // Admin
      { path: "admin/dashboard", Component: AdminDashboard },
      { path: "admin/users-management", Component: AdminUsers },
      { path: "admin/departments", Component: AdminDepartments },
      { path: "admin/audit-logs", Component: AdminAuditLogs },
      { path: "admin/reports", Component: AdminReports },
      { path: "admin/system-config", Component: AdminSystemConfig },
      { path: "admin/operating-rooms", Component: OperatingRooms },
      // Doctor
      { path: "doctor/dashboard", Component: DoctorDashboard },
      { path: "doctor/appointments", Component: DoctorAppointments },
      { path: "doctor/patients", Component: DoctorPatients },
      { path: "doctor/patients/:id", Component: PatientProfile },
      { path: "doctor/consultations", Component: DoctorConsultations },
      { path: "doctor/prescriptions", Component: DoctorPrescriptions },
      { path: "doctor/lab-requests", Component: DoctorLabRequests },
      { path: "doctor/medical-records", Component: DoctorMedicalRecords },
      { path: "doctor/surgeries", Component: DoctorSurgeries },
      { path: "doctor/surgeries/:id", Component: SurgeryDetail },
      // Nurse
      { path: "nurse/dashboard", Component: NurseDashboard },
      { path: "nurse/patients", Component: NursePatients },
      { path: "nurse/vitals-monitoring", Component: NurseVitals },
      { path: "nurse/medications", Component: NurseMedications },
      { path: "nurse/care-tasks", Component: NurseCareTasks },
      { path: "nurse/appointments", Component: NurseAppointments },
      // Receptionist
      { path: "receptionist/dashboard", Component: ReceptionistDashboard },
      { path: "receptionist/appointments", Component: ReceptionistAppointments },
      { path: "receptionist/patient-registration", Component: PatientRegistration },
      { path: "receptionist/queue-management", Component: QueueManagement },
      { path: "receptionist/billing", Component: ReceptionistBilling },
      { path: "receptionist/check-in", Component: CheckIn },
      { path: "receptionist/admissions", Component: AdmissionsManagement },
      { path: "receptionist/rooms", Component: RoomsBoard },
      // Patient
      { path: "patient/dashboard", Component: PatientDashboard },
      { path: "patient/appointments", Component: PatientAppointments },
      { path: "patient/medical-records", Component: PatientMedicalRecords },
      { path: "patient/prescriptions", Component: PatientPrescriptions },
      { path: "patient/lab-results", Component: PatientLabResults },
      { path: "patient/billing", Component: PatientBilling },
      { path: "patient/profile", Component: PatientProfilePage },
      // Lab
      { path: "lab/dashboard", Component: LabDashboard },
      { path: "lab/test-requests", Component: LabTestRequests },
      { path: "lab/test-processing", Component: LabTestProcessing },
      { path: "lab/results-upload", Component: LabResultsUpload },
      { path: "lab/equipment-status", Component: LabEquipmentStatus },
    ],
  },
]);