import { useState } from "react";
import { ArrowLeft, Check, DollarSign } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Badge } from "../../components/ui/Badge";

const STEPS = ["Scheduled", "Pre-Op Prep", "In Progress", "Post-Op Recovery", "Completed"];

const surgery = {
  id: "surg-001",
  type: "Coronary Artery Bypass Graft (CABG)",
  status: "Pre-Op Prep",
  patient: {
    name: "John Whitaker",
    initials: "JW",
    dob: "March 5, 1963",
    blood: "O+",
    allergies: ["Penicillin", "NSAIDs"],
    conditions: ["CAD", "Hypertension", "T2DM"],
  },
  info: {
    leadSurgeon: "Dr. Sarah Mitchell",
    assistSurgeon: "Dr. James Holloway",
    nurse: "Nurse Rachel Kim",
    or: "OR-2",
    dateTime: "June 17, 2025 — 08:00 AM",
    duration: "4 hours",
    priority: "Urgent",
  },
  preOpNotes: "Patient cleared for surgery. Fasting since midnight. IV access established. Consent signed. Pre-op antibiotics administered.",
  vitals: { bp: "152/94", hr: "98 bpm", temp: "37.1 °C", o2: "97%", weight: "88 kg" },
  timeline: [
    { event: "Surgery Scheduled", time: "June 14, 2025", user: "Dr. Mitchell" },
    { event: "Pre-Op Prep Started", time: "June 17, 06:30 AM", user: "Nurse Rachel Kim" },
    { event: "Pre-Op Completed", time: "June 17, 07:45 AM", user: "Nurse Rachel Kim" },
  ],
  billing: { estimated: 8400, status: "Pending" },
  admission: { room: "Room 501", ward: "CCU", admitDate: "June 16, 2025" },
};

function StatusStepper({ currentStep }: { currentStep: string }) {
  const currentIdx = STEPS.indexOf(currentStep);
  return (
    <div className="flex items-start gap-0 w-full">
      {STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                ${isDone ? "bg-[#10B981] text-white" : isActive ? "bg-[#0EA5E9] text-white ring-4 ring-[#0EA5E9]/20" : "bg-[#E2E8F0] text-[#94A3B8]"}`}>
                {isDone ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] mt-1.5 text-center w-full px-1 ${isActive ? "text-[#0EA5E9] font-semibold" : isDone ? "text-[#10B981]" : "text-[#94A3B8]"}`}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < currentIdx ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`} style={{ minWidth: 12 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SurgeryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [preOpNotes, setPreOpNotes] = useState(surgery.preOpNotes);

  return (
    <div>
      <button onClick={() => navigate("/doctor/surgeries")} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] mb-5 transition-colors">
        <ArrowLeft size={15} /> Back to Surgeries
      </button>

      {/* Top banner */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Surgery</p>
            <h1 className="font-bold text-[#0F172A]" style={{ fontSize: 22 }}>{surgery.type}</h1>
          </div>
          <div className="flex gap-3">
            <Badge variant="pending">{surgery.status}</Badge>
            <button className="px-4 py-2 rounded-lg bg-[#0EA5E9] text-white text-sm font-medium hover:opacity-90">Update Status</button>
          </div>
        </div>
        <StatusStepper currentStep={surgery.status} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left 60% */}
        <div className="xl:col-span-3 space-y-5">
          {/* Patient card */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-4">Patient</h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white font-bold shrink-0">{surgery.patient.initials}</div>
              <div className="flex-1">
                <h4 className="font-bold text-[#0F172A] mb-0.5">{surgery.patient.name}</h4>
                <p className="text-sm text-[#64748B] mb-3">DOB: {surgery.patient.dob} · Blood: <span className="font-semibold text-red-600">{surgery.patient.blood}</span></p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs font-medium text-[#64748B]">Allergies:</span>
                  {surgery.patient.allergies.map((a) => <span key={a} className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">{a}</span>)}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-[#64748B]">Conditions:</span>
                  {surgery.patient.conditions.map((c) => <span key={c} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{c}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Surgery info */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-4">Surgery Information</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Lead Surgeon", val: surgery.info.leadSurgeon },
                { label: "Assisting Surgeon", val: surgery.info.assistSurgeon },
                { label: "Assisting Nurse", val: surgery.info.nurse },
                { label: "Operating Room", val: surgery.info.or },
                { label: "Date & Time", val: surgery.info.dateTime },
                { label: "Est. Duration", val: surgery.info.duration },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-lg bg-[#F8FAFC]">
                  <p className="text-xs text-[#94A3B8] mb-0.5">{f.label}</p>
                  <p className="text-sm font-medium text-[#0F172A]">{f.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-[#64748B]">Priority:</span>
              <Badge variant="warning">{surgery.info.priority}</Badge>
            </div>
          </div>

          {/* Pre-Op Notes */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-3">Pre-Op Notes</h3>
            <textarea
              rows={4}
              value={preOpNotes}
              onChange={(e) => setPreOpNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none"
            />
            <button className="mt-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">Save Notes</button>
          </div>

          {/* Post-Op Notes */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-3">Post-Op Notes</h3>
            <textarea
              rows={3}
              disabled
              placeholder="Add post-operative notes after procedure"
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm bg-[#F8FAFC] text-[#94A3B8] resize-none cursor-not-allowed"
            />
            <p className="text-xs text-[#94A3B8] mt-1.5">Available once surgery is In Progress or beyond.</p>
          </div>
        </div>

        {/* Right 40% */}
        <div className="xl:col-span-2 space-y-5">
          {/* Timeline */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-4">Surgery Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />
              <div className="space-y-4">
                {surgery.timeline.map((t, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 border-2 border-[#0EA5E9] flex items-center justify-center shrink-0 relative z-10">
                      <Check size={12} className="text-[#0EA5E9]" />
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-[#0F172A]">{t.event}</p>
                      <p className="text-xs text-[#94A3B8]">{t.time} · {t.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pre-op vitals */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-3">Pre-Op Vitals</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(surgery.vitals).map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-xs text-[#94A3B8] capitalize mb-0.5">{k === "bp" ? "Blood Pressure" : k === "hr" ? "Heart Rate" : k === "temp" ? "Temperature" : k === "o2" ? "O₂ Sat." : "Weight"}</p>
                  <p className="text-sm font-bold text-[#0F172A]">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related admission */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-3">Related Admission</h3>
            <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3">
              <p className="font-medium text-[#0F172A] text-sm">{surgery.patient.name}</p>
              <p className="text-xs text-[#64748B]">{surgery.admission.room} · {surgery.admission.ward}</p>
              <p className="text-xs text-[#64748B]">Admitted {surgery.admission.admitDate}</p>
            </div>
          </div>

          {/* Billing */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-3">Billing</h3>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-[#94A3B8]">Estimated Cost</p>
                <p className="text-2xl font-bold text-[#0F172A]">${surgery.billing.estimated.toLocaleString()}</p>
              </div>
              <Badge variant="pending">{surgery.billing.status}</Badge>
            </div>
            <p className="text-xs text-[#94A3B8] mb-3">Pending invoice generation</p>
            <button className="w-full h-9 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2">
              <DollarSign size={14} />Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
