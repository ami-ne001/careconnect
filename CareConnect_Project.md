# CareConnect — Hospital Management System
## Complete Project Documentation

---

## 📋 Project Overview

**CareConnect** is a comprehensive web-based hospital management system built with a **microservices architecture**. It digitizes and streamlines all core hospital operations including patient management, appointment scheduling, medical consultations, surgical planning, inpatient admissions, laboratory services, and billing.

The system supports **6 distinct user roles** with role-based access control (RBAC), ensuring secure and appropriate access to hospital data and functionality.

**Team:** 4 Computer Science students  
**Development Period:** 2025-2026

---

## 🎯 Core Objectives

1. **Centralize hospital operations** — eliminate paper-based workflows
2. **Role-based access control** — secure, appropriate access for all users
3. **End-to-end patient journey** — from appointment to discharge to billing
4. **Clinical workflow support** — consultations, prescriptions, surgeries, lab tests
5. **Real-time coordination** — queue management, OR scheduling, bed availability
6. **Financial transparency** — automated invoicing, payment tracking

---

## 🏗️ Architecture

### Architecture Type: **Microservices**

The application is decomposed into **7 independent services** communicating via REST APIs (OpenFeign) and asynchronous events (RabbitMQ).

```
┌─────────────────┐
│   React + TS    │  Frontend (Vite)
│   Frontend      │  Port: 5173
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │  Entry point, JWT validation, routing
│  Port: 8088     │  Spring Cloud Gateway
└────────┬────────┘
         │
         ├──────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
         ▼                  ▼              ▼              ▼              ▼              ▼
┌──────────────┐  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ auth-service │  │patient-service│ │appointment-  │ │clinical-     │ │lab-service   │ │billing-      │
│ Port: 8081   │  │Port: 8082    │ │service       │ │service       │ │Port: 8085    │ │service       │
│              │  │              │ │Port: 8083    │ │Port: 8084    │ │              │ │Port: 8086    │
│ • users      │  │ • patients   │ │ • appts      │ │ • consults   │ │ • lab tests  │ │ • invoices   │
│ • roles      │  │ • admissions │ │ • queue      │ │ • surgeries  │ │ • results    │ │ • payments   │
│ • JWT        │  │ • rooms      │ │ • doctor     │ │ • vitals     │ │ • equipment  │ │              │
│              │  │ • wards      │ │   availability│ │ • prescriptions│              │              │
└──────────────┘  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
       │                 │                │                │                │                │
       ▼                 ▼                ▼                ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ careconnect_ │  │ careconnect_ │ │ careconnect_ │ │ careconnect_ │ │ careconnect_ │ │ careconnect_ │
│ auth         │  │ patient      │ │ appointment  │ │ clinical     │ │ lab          │ │ billing      │
│ (MySQL)      │  │ (MySQL)      │ │ (MySQL)      │ │ (MySQL)      │ │ (MySQL)      │ │ (MySQL)      │
└──────────────┘  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

                                    ┌─────────────────────┐
                                    │   RabbitMQ          │
                                    │   Port: 5672        │
                                    │   (Event Bus)       │
                                    └─────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** Material UI + Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Routing:** React Router DOM v6
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Date Handling:** Day.js

### Backend (all services)
- **Framework:** Spring Boot 4.0.6
- **Language:** Java 21
- **Build Tool:** Maven
- **Key Dependencies:**
  - Spring Web (REST APIs)
  - Spring Data JPA (ORM)
  - Spring Security (authentication & authorization)
  - Spring Cloud Gateway (API Gateway routing)
  - Spring Cloud OpenFeign 4.3.0 (inter-service communication)
  - Spring AMQP (RabbitMQ integration)
  - Flyway (database migrations)
  - Lombok (boilerplate reduction)
  - MapStruct (DTO mapping)
  - JJWT 0.12.3 (JWT handling)
  - Hibernate Validator (bean validation)

### Database
- **DBMS:** MySQL 8.0+
- **Strategy:** One schema per service (6 total)
- **Migration Tool:** Flyway

### Message Broker
- **Tool:** RabbitMQ 3.x
- **Purpose:** Asynchronous event-driven communication between services

### Repository
- **Structure:** Monorepo (all services + frontend in one Git repository)
- **VCS:** Git + GitHub

---

## 👥 User Roles

| Role | Count | Primary Responsibilities |
|---|---|---|
| **Admin** | System-wide | User management, system configuration, audit logs, analytics |
| **Doctor** | Clinical staff | Consultations, diagnoses, prescriptions, surgeries, lab requests |
| **Nurse** | Clinical staff | Vitals monitoring, care tasks, medication administration, surgery prep |
| **Receptionist** | Front desk | Appointments, patient registration, admissions, queue management, billing |
| **Patient** | End users | Self-service: view records, book appointments, view results, pay bills |
| **Lab Technician** | Lab staff | Process lab requests, upload results, maintain equipment |

**Note:** Pharmacy role was removed from scope.

---

## 🗄️ Database Architecture

### Database-per-Service Pattern

Each microservice owns its own MySQL schema. Cross-service data references are stored as plain ID columns (no foreign key constraints across databases). Data consistency is maintained through service APIs and eventual consistency via RabbitMQ events.

#### Schema Distribution

| Service | Schema Name | Tables | Purpose |
|---|---|---|---|
| **auth-service** | `careconnect_auth` | 2 | User accounts, departments |
| **patient-service** | `careconnect_patient` | 7 | Patients, admissions, rooms, wards, documents, notifications |
| **appointment-service** | `careconnect_appointment` | 4 | Appointments, queue, doctor availability/unavailability |
| **clinical-service** | `careconnect_clinical` | 10 | Consultations, surgeries, vitals, prescriptions, care tasks, doctor profiles, operating rooms, audit logs |
| **lab-service** | `careconnect_lab` | 6 | Lab test types, reference ranges, requests, results, equipment |
| **billing-service** | `careconnect_billing` | 3 | Invoices, invoice items, payments |

**Total:** 32 tables across 6 schemas

---

## 📊 Key Database Tables (Highlights)

### auth-service
- **users** — all system users (admin, doctors, nurses, receptionists, patients, lab techs)
  - Role-based enum
  - BCrypt password hashing
  - Department association
  - Gender: MALE or FEMALE only
- **departments** — hospital departments (Cardiology, Neurology, etc.)

### patient-service
- **patient_profiles** — patient-specific data (blood type, insurance, emergency contact)
- **allergies** — patient allergies with severity
- **chronic_conditions** — ongoing medical conditions
- **admissions** — inpatient stays with admission/discharge workflow
- **rooms** & **wards** — bed management
- **medical_documents** — uploaded files (lab reports, imaging, discharge summaries, surgery reports)
- **notifications** — system notifications to users

### appointment-service
- **appointments** — scheduled patient-doctor visits
  - Duration: 30, 60, or 90 minutes (SMALLINT)
  - Status workflow: SCHEDULED → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED
- **queue** — check-in queue management with ticket numbers
- **doctor_availability** — weekly schedule per doctor (Monday-Sunday, start/end times)
- **doctor_unavailability** — vacations, leaves, exceptions (date ranges)

### clinical-service
- **doctor_profiles** — surgeon qualification (`is_surgeon` boolean), specialty, license, years of experience, bio
- **consultations** — patient visits with symptoms, diagnosis, clinical notes
  - No ICD-10 code field (removed)
- **surgeries** — surgical procedures
  - Duration: 30, 60, 90, 120, 150, 180, 210, 240 minutes (SMALLINT)
  - Status: SCHEDULED → PRE_OP → IN_PROGRESS → POST_OP → COMPLETED
  - Links to admission if inpatient surgery
- **operating_rooms** — OR availability and status
- **vitals** — patient vital signs (BP, HR, temp, O2, weight, height)
  - Can link to consultation, admission, or surgery
- **prescriptions** & **prescription_items** — medication orders
  - Items now store medication as plain VARCHAR(150) (no separate medications table)
- **care_tasks** — nurse task board (TODO/IN_PROGRESS/DONE)
  - Links to patient, surgery, or admission
- **audit_logs** — system-wide audit trail

### lab-service
- **lab_test_types** — catalog of available tests (CBC, Lipid Panel, HbA1c, etc.)
- **lab_test_reference_ranges** — normal ranges per test component (e.g., WBC: 4.5-11.0 K/uL)
  - Supports gender-specific ranges
- **lab_requests** — doctor-ordered tests
- **lab_results** — uploaded results with JSON data + interpretation
  - No `is_critical` field (removed; criticality determined by comparing to reference ranges)
- **equipment** & **equipment_maintenance** — lab equipment tracking

### billing-service
- **invoices** — patient bills linked to consultations, admissions, or surgeries
- **invoice_items** — line items (consultation fee, lab tests, room charges, surgery fees)
- **payments** — payment records
  - Methods: CASH, CARD, INSURANCE (TRANSFER removed)

---

## 🔄 Inter-Service Communication

### Synchronous (REST via OpenFeign)

Services call each other directly when they need immediate data:

```
billing-service needs patient name
  → GET patient-service/api/internal/patients/{id}
  → Returns patient DTO

clinical-service needs doctor details for surgery
  → GET auth-service/api/internal/users/{id}
  → Returns user DTO
```

Each service exposes `/api/internal/*` endpoints for service-to-service calls (not exposed to frontend).

### Asynchronous (RabbitMQ Events)

Services publish events when state changes; other services listen and react:

| Event | Publisher | Consumers | Purpose |
|---|---|---|---|
| `CONSULTATION_CLOSED` | clinical-service | billing-service | Auto-generate invoice |
| `PATIENT_ADMITTED` | patient-service | patient-service, clinical-service | Create notification, assign care tasks |
| `PATIENT_DISCHARGED` | patient-service | billing-service | Add room charges to invoice |
| `SURGERY_SCHEDULED` | clinical-service | patient-service, clinical-service | Notify patient, create pre-op tasks |
| `LAB_RESULT_UPLOADED` | lab-service | patient-service, clinical-service | Notify doctor and patient |
| `APPOINTMENT_CONFIRMED` | appointment-service | patient-service | Send reminder notification |

---

## 🔐 Security & Authentication

### JWT-Based Authentication

1. User logs in via `auth-service` → receives JWT token
2. Token contains: user ID, role, email, expiry
3. Frontend stores token in `localStorage`
4. Every API request includes: `Authorization: Bearer <token>`
5. **api-gateway** validates JWT before routing to services
6. Each service also validates JWT (double-check for security)

### Role-Based Access Control (RBAC)

- Each endpoint is annotated with `@PreAuthorize("hasRole('DOCTOR')")`
- Spring Security enforces access control
- Frontend also hides/shows UI elements based on role (UX only, not security)

---

## 🎨 Frontend Structure

### Pages by Role

```
src/app/pages/
├── auth/
│   ├── Login.tsx
│   └── ForgotPassword.tsx
├── admin/
│   ├── Dashboard.tsx
│   ├── UsersManagement.tsx
│   ├── Departments.tsx
│   ├── AuditLogs.tsx
│   ├── Reports.tsx
│   ├── SystemConfig.tsx
│   └── OperatingRooms.tsx
├── doctor/
│   ├── Dashboard.tsx
│   ├── Appointments.tsx
│   ├── Patients.tsx
│   ├── PatientProfile.tsx
│   ├── Consultations.tsx
│   ├── Surgeries.tsx
│   ├── SurgeryDetail.tsx
│   ├── Prescriptions.tsx
│   ├── LabRequests.tsx
│   └── MedicalRecords.tsx
├── nurse/
│   ├── Dashboard.tsx
│   ├── Patients.tsx
│   ├── VitalsMonitoring.tsx
│   ├── Medications.tsx
│   ├── CareTasks.tsx
│   └── Appointments.tsx
├── receptionist/
│   ├── Dashboard.tsx
│   ├── Appointments.tsx
│   ├── PatientRegistration.tsx
│   ├── Admissions.tsx
│   ├── Rooms.tsx
│   ├── QueueManagement.tsx
│   ├── CheckIn.tsx
│   └── Billing.tsx
├── patient/
│   ├── Dashboard.tsx
│   ├── Appointments.tsx
│   ├── MedicalRecords.tsx
│   ├── Prescriptions.tsx
│   ├── LabResults.tsx
│   ├── Billing.tsx
│   └── Profile.tsx
└── lab/
    ├── Dashboard.tsx
    ├── TestRequests.tsx
    ├── TestProcessing.tsx
    ├── ResultsUpload.tsx
    └── EquipmentStatus.tsx
```

---

## 🔁 Core Workflows

### 1. Outpatient Appointment Flow
```
Patient books appointment (or receptionist books)
  ↓
Appointment stored in appointment-service
  ↓
Event: APPOINTMENT_CONFIRMED → notification sent
  ↓
Patient checks in at hospital → queue entry created
  ↓
Receptionist calls next patient → status: CALLED
  ↓
Doctor starts consultation → consultation record created
  ↓
Doctor adds diagnosis, prescribes meds, requests lab tests
  ↓
Consultation closed → event: CONSULTATION_CLOSED
  ↓
Billing-service auto-generates invoice
  ↓
Patient pays at reception → payment recorded
```

### 2. Inpatient Admission Flow
```
Doctor recommends admission
  ↓
Receptionist admits patient → selects ward, room, bed
  ↓
Admission record created in patient-service
  ↓
Event: PATIENT_ADMITTED → notifications sent
  ↓
Nurse monitors vitals daily → vitals linked to admission
  ↓
Doctor performs daily rounds → consultations continue
  ↓
Discharge decision → receptionist processes discharge
  ↓
Discharge summary filled → status: DISCHARGED
  ↓
Event: PATIENT_DISCHARGED → billing adds room charges
  ↓
Final invoice generated → patient settles bill
```

### 3. Surgery Workflow
```
Doctor schedules surgery
  ↓
Surgery record created → OR assigned, time booked
  ↓
Event: SURGERY_SCHEDULED → notifications + pre-op tasks created
  ↓
Nurse completes pre-op checklist (fasting, IV, consent, meds)
  ↓
Surgery status: PRE_OP → IN_PROGRESS → POST_OP → COMPLETED
  ↓
Post-op notes added → outcome recorded
  ↓
If inpatient: surgery linked to admission
  ↓
Billing-service adds surgery fee to invoice
```

### 4. Lab Test Workflow
```
Doctor requests lab test during consultation
  ↓
Lab request created in lab-service (priority: NORMAL/URGENT/CRITICAL)
  ↓
Lab technician receives request
  ↓
Sample collected → status: SAMPLE_RECEIVED
  ↓
Test processed → status: PROCESSING
  ↓
Results uploaded (JSON data + interpretation)
  ↓
Results compared to reference ranges → flag if out of range
  ↓
Event: LAB_RESULT_UPLOADED → doctor and patient notified
  ↓
Doctor reviews results in consultations or lab requests page
```

---

## 🏥 Key Features

### Appointment Management
- **Doctor availability:** Weekly schedule (Mon-Sun, start/end times per day)
- **Doctor unavailability:** Vacation/leave tracking (date ranges)
- **Smart scheduling:** 30-minute time slot intervals, conflict detection
- **Appointment durations:** 30, 60, or 90 minutes
- **Queue system:** Ticket-based queue with real-time status

### Inpatient Management
- **Ward & room organization:** Wards contain rooms, rooms have beds
- **Room status:** Available, Occupied, Maintenance
- **Admission workflow:** Admission → care → discharge with full documentation
- **Discharge process:** Status, condition, medications, follow-up instructions

### Surgery Management
- **Operating rooms:** 4 ORs with status tracking (Available, In Use, Cleaning, Maintenance)
- **Surgery durations:** 30, 60, 90, 120, 150, 180, 210, or 240 minutes
- **Surgeon qualification:** Doctor profiles include `is_surgeon` flag
- **Surgery workflow:** 5-stage status (Scheduled → Pre-Op → In Progress → Post-Op → Completed)
- **Pre/post-op notes:** Comprehensive documentation
- **Care task integration:** Automated pre-op task creation for nurses

### Clinical Documentation
- **Consultations:** Symptoms, diagnosis, clinical notes (no ICD-10 code)
- **Vitals tracking:** BP, HR, temperature, O2 sat, weight, height
  - Can link to consultation, admission, or surgery
- **Prescriptions:** Medication name (free text), dosage, frequency, duration, quantity, instructions
- **Medical documents:** Upload/store lab reports, imaging, discharge summaries, surgery reports

### Laboratory
- **Test catalog:** Lab test types with categories and sample types
- **Reference ranges:** Per-component normal ranges with gender-specific support
- **Results storage:** JSON format for flexible test result structure
- **Equipment tracking:** Calibration schedules, maintenance logs

### Billing
- **Multi-source invoices:** Link to consultation, admission, or surgery
- **Line items:** Consultation fees, lab tests, room charges (per night), surgery fees, medications
- **Payment methods:** Cash, Card, Insurance (no bank transfer)
- **Status tracking:** Pending → Partially Paid → Paid / Overdue / Cancelled

---

## 🚀 Deployment & Development

### Local Development Setup

**Prerequisites:**
- JDK 21
- Node.js 18+
- MySQL 8.0+
- RabbitMQ 3.x
- Maven 3.8+

**Backend startup order:**
```bash
# 1. Start MySQL and RabbitMQ
# 2. Create 6 schemas (see database section)
# 3. Start services in order:

mvn spring-boot:run -pl auth-service         # Port 8081
mvn spring-boot:run -pl patient-service      # Port 8082
mvn spring-boot:run -pl appointment-service  # Port 8083
mvn spring-boot:run -pl clinical-service     # Port 8084
mvn spring-boot:run -pl lab-service          # Port 8085
mvn spring-boot:run -pl billing-service      # Port 8086
mvn spring-boot:run -pl api-gateway          # Port 8088
```

**Frontend:**
```bash
cd careconnect-frontend
npm install
npm run dev  # Port 5173
```

### Service Ports

| Service | Port |
|---|---|
| Frontend | 5173 |
| API Gateway | 8088 |
| auth-service | 8081 |
| patient-service | 8082 |
| appointment-service | 8083 |
| clinical-service | 8084 |
| lab-service | 8085 |
| billing-service | 8086 |
| MySQL | 3306 |
| RabbitMQ | 5672 |
| RabbitMQ Management | 15672 |

---

## 👨‍💻 Team Responsibilities

### Person 1 — Auth & Gateway
- **Services:** auth-service, api-gateway
- **Frontend:** Auth pages, Admin pages
- **Priority:** Must finish first (JWT blocks all other services)

### Person 2 — Patient & Appointment
- **Services:** patient-service, appointment-service
- **Frontend:** Receptionist pages, Patient pages

### Person 3 — Clinical
- **Services:** clinical-service
- **Frontend:** Doctor pages, Nurse pages

### Person 4 — Lab & Billing
- **Services:** lab-service, billing-service
- **Frontend:** Lab Technician pages

---

## 📦 Repository Structure

```
careconnect/
├── api-gateway/
│   ├── src/main/
│   │   ├── java/com/careconnect/gateway/
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
├── auth-service/
│   ├── src/main/
│   │   ├── java/com/careconnect/auth/
│   │   └── resources/
│   │       ├── db/migration/
│   │       │   └── V1__init.sql
│   │       └── application.properties
│   └── pom.xml
├── patient-service/
├── appointment-service/
├── clinical-service/
├── lab-service/
├── billing-service/
├── careconnect-frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   └── pages/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 🎓 Learning Outcomes

This project demonstrates practical implementation of:
- **Microservices architecture** with Spring Boot
- **Database-per-service pattern** with Flyway migrations
- **API Gateway pattern** with Spring Cloud Gateway
- **Service-to-service communication** (synchronous via Feign, asynchronous via RabbitMQ)
- **JWT-based authentication & RBAC**
- **Event-driven architecture** for loose coupling
- **Full-stack development** (React + Spring Boot)
- **RESTful API design**
- **Monorepo management** for multi-service projects

---

## 📝 Future Enhancements (Out of Scope)

- Docker containerization
- Kubernetes orchestration
- Service discovery (Eureka)
- Distributed tracing (Zipkin/Jaeger)
- Circuit breakers (Resilience4j)
- Centralized configuration (Spring Cloud Config)
- ElasticSearch for medical records search
- Real-time notifications (WebSocket)
- Mobile app (React Native)

---

## 📄 License

Academic project - not for commercial use.

---

**Document Version:** 2.0  
**Last Updated:** April 2026  
**Status:** Active Development