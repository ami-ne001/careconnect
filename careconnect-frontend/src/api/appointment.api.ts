import { api } from "./axios";

export interface AppointmentResponse {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  room?: string;
  notes?: string;
  status: string;
}

export interface AppointmentCreateRequest {
  patientId: number;
  doctorId: number;
  scheduledAt: string;
  durationMinutes: number;
  type: string;
  room?: string;
  notes?: string;
}

export interface AvailableSlotResponse {
  startTime: string;
  endTime: string;
}

export interface DoctorAvailabilityResponse {
  id: number;
  doctorId: number;
  dayOfWeek: string; // e.g. "MONDAY", "TUESDAY"
  startTime: string;
  endTime: string;
}

export interface QueueResponse {
  id: number;
  appointmentId: number;
  ticketNumber: number;
  checkedInAt: string;
  calledAt?: string;
  status: string;
}

export const appointmentApi = {
  getMyAppointments: () => api.get<AppointmentResponse[]>("/api/appointments/my"),
  
  getAppointmentsByPatient: (patientId: number) =>
    api.get<AppointmentResponse[]>(`/api/appointments/patient/${patientId}`),

  getAllAppointments: (page = 0, size = 100) =>
    api.get<{ content: AppointmentResponse[] }>(`/api/appointments?page=${page}&size=${size}`),

  getAppointmentsByDoctor: (doctorId: number) =>
    api.get<AppointmentResponse[]>(`/api/appointments/doctor/${doctorId}`),

  createAppointment: (body: AppointmentCreateRequest) =>
    api.post<AppointmentResponse>("/api/appointments", body),

  updateAppointmentStatus: (id: number, status: string) =>
    api.put<AppointmentResponse>(`/api/appointments/${id}/status`, { status }),

  cancelAppointment: (id: number) =>
    api.delete<AppointmentResponse>(`/api/appointments/${id}`),

  getAvailableSlots: (doctorId: number, date: string, durationMinutes: number) =>
    api.get<AvailableSlotResponse[]>("/api/availability/slots", {
      params: { doctorId, date, durationMinutes }
    }),

  getDoctorAvailability: (doctorId: number) =>
    api.get<DoctorAvailabilityResponse[]>(`/api/availability/doctor/${doctorId}`),

  // Queue
  getTodayQueue: () => api.get<QueueResponse[]>("/api/queue/today"),
  
  checkIn: (appointmentId: number) =>
    api.post<QueueResponse>(`/api/queue/check-in/${appointmentId}`),

  callNext: (id: number) =>
    api.put<QueueResponse>(`/api/queue/${id}/call-next`),

  updateQueueStatus: (id: number, status: string) =>
    api.put<QueueResponse>(`/api/queue/${id}/status`, { status }),
};
