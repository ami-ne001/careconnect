import { api } from "./axios";

export interface InvoiceItemResponse {
  id: number;
  description: string;
  amount: number;
  quantity: number;
}

export interface InvoiceResponse {
  id: number;
  patientId: number;
  patientName?: string;
  consultationId?: number;
  admissionId?: number;
  surgeryId?: number;
  issuedAt: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  notes?: string;
  items: InvoiceItemResponse[];
}

export interface InvoiceCreateRequest {
  patientId: number;
  sourceType: string;
  sourceId: number;
  items: {
    description: string;
    amount: number;
    quantity: number;
  }[];
}

export interface PaymentCreateRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
}

export interface PaymentResponse {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate: string;
  receivedBy?: number;
}

export const billingApi = {
  createInvoice: (body: InvoiceCreateRequest) =>
    api.post<InvoiceResponse>("/api/billing/invoices", body),

  getInvoiceById: (id: number) =>
    api.get<InvoiceResponse>(`/api/billing/invoices/${id}`),

  getInvoicesByPatient: (patientId: number) =>
    api.get<InvoiceResponse[]>(`/api/billing/invoices/patient/${patientId}`),

  getInvoicesByStatus: (status: string) =>
    api.get<InvoiceResponse[]>(`/api/billing/invoices/status/${status}`),

  updateInvoiceStatus: (id: number, status: string) =>
    api.patch<InvoiceResponse>(`/api/billing/invoices/${id}/status`, { status }),

  recordPayment: (body: PaymentCreateRequest) =>
    api.post<PaymentResponse>("/api/billing/payments", body),

  getPaymentsForInvoice: (invoiceId: number) =>
    api.get<PaymentResponse[]>(`/api/billing/payments/invoice/${invoiceId}`),
};
