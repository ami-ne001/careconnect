export type NotificationType =
  | "APPOINTMENT_REMINDER"
  | "LAB_RESULT_READY"
  | "SURGERY_SCHEDULED"
  | "SURGERY_UPDATE"
  | "PATIENT_ADMITTED"
  | "PATIENT_DISCHARGED"
  | "PAYMENT_DUE"
  | "SYSTEM"
  | "GENERAL";

export interface NotificationResponse {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

