import { useState, useEffect } from "react";
import { ArrowLeft, Check, DollarSign } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Badge } from "../../components/ui/Badge";
import { clinicalApi, SurgeryResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";
import type { PatientProfileResponse } from "../../../types/patient.types";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../utils/apiError";

const STEPS = ["SCHEDULED", "PRE_OP", "IN_PROGRESS", "POST_OP", "COMPLETED"];

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
              <span className={`text-[10px] mt-1.5 text-center w-full px-1 ${isActive ? "text-[#0EA5E9] font-semibold" : isDone ? "text-[#10B981]" : "text-[#94A3B8]"}`}>{step.replace("_", " ")}</span>
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
  const [surgery, setSurgery] = useState<SurgeryResponse | null>(null);
  const [patient, setPatient] = useState<PatientProfileResponse | null>(null);
  const [preOpNotes, setPreOpNotes] = useState("");
  const [postOpNotes, setPostOpNotes] = useState("");
  const [outcome, setOutcome] = useState("SUCCESSFUL");
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (id) {
      clinicalApi.getSurgery(Number(id)).then(res => {
        setSurgery(res.data);
        setPreOpNotes(res.data.preOpNotes || "");
        setPostOpNotes(res.data.postOpNotes || "");
        setOutcome(res.data.outcome || "SUCCESSFUL");
        if (res.data.patientId) {
          patientApi.getProfileByUserId(res.data.patientId).then(pRes => {
            setPatient(pRes.data);
          }).catch(console.error);
        }
      }).catch(err => {
        toast.error("Failed to load surgery details.");
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!surgery) return;
    const currentIdx = STEPS.indexOf(surgery.status);
    if (currentIdx >= 0 && currentIdx < STEPS.length - 1) {
      const nextStatus = STEPS[currentIdx + 1];
      try {
        await clinicalApi.updateSurgeryStatus(surgery.id, nextStatus);
        toast.success(`Surgery status updated to ${nextStatus.replace("_", " ")}`);
        const res = await clinicalApi.getSurgery(Number(id));
        setSurgery(res.data);
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to update surgery status"));
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!surgery) return;
    setSavingNotes(true);
    try {
      if (surgery.status === "COMPLETED" || surgery.status === "POST_OP") {
        await clinicalApi.addPostOpNotes(surgery.id, { postOpNotes, outcome });
        toast.success("Post-op notes saved");
      } else {
        await clinicalApi.updateSurgery(surgery.id, { preOpNotes });
        toast.success("Pre-op notes saved");
      }
      const res = await clinicalApi.getSurgery(Number(id));
      setSurgery(res.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save notes"));
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#64748B]">Loading...</div>;
  if (!surgery) return <div className="p-8 text-center text-[#64748B]">Surgery not found.</div>;

  const getPatientInitials = () => {
    if (!patient) return `P`;
    return `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`;
  };

  const getStatusVariant = (status: string) => {
    if (status === "COMPLETED") return "active";
    if (status === "SCHEDULED") return "info";
    if (status === "CANCELLED") return "error";
    return "pending";
  };

  const isPostOpEnabled = surgery.status === "IN_PROGRESS" || surgery.status === "POST_OP" || surgery.status === "COMPLETED";

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
            <h1 className="font-bold text-[#0F172A]" style={{ fontSize: 22 }}>{surgery.surgeryType}</h1>
          </div>
          <div className="flex gap-3">
            <Badge variant={getStatusVariant(surgery.status) as any}>{surgery.status.replace("_", " ")}</Badge>
            {STEPS.indexOf(surgery.status) < STEPS.length - 1 && surgery.status !== "CANCELLED" && (
              <button 
                onClick={handleUpdateStatus}
                className="px-4 py-2 rounded-lg bg-[#0EA5E9] text-white text-sm font-medium hover:opacity-90"
              >
                Update to {STEPS[STEPS.indexOf(surgery.status) + 1].replace("_", " ")}
              </button>
            )}
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
              <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white font-bold shrink-0">{getPatientInitials()}</div>
              <div className="flex-1">
                <h4 className="font-bold text-[#0F172A] mb-0.5">{patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${surgery.patientId}`}</h4>
                <p className="text-sm text-[#64748B] mb-3">DOB: {patient?.dateOfBirth || "Unknown"} · Blood: <span className="font-semibold text-red-600">{patient?.bloodType || "Unknown"}</span></p>
              </div>
            </div>
          </div>

          {/* Surgery info */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-4">Surgery Information</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Lead Surgeon ID", val: String(surgery.leadSurgeonId) },
                { label: "Assisting Surgeon ID", val: surgery.assistingSurgeonId ? String(surgery.assistingSurgeonId) : "None" },
                { label: "Assisting Nurse ID", val: surgery.assistingNurseId ? String(surgery.assistingNurseId) : "None" },
                { label: "Operating Room", val: surgery.operatingRoomName },
                { label: "Scheduled Date & Time", val: new Date(surgery.scheduledAt).toLocaleString() },
                { label: "Est. Duration", val: `${surgery.estimatedDuration} mins` },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-lg bg-[#F8FAFC]">
                  <p className="text-xs text-[#94A3B8] mb-0.5">{f.label}</p>
                  <p className="text-sm font-medium text-[#0F172A]">{f.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-[#64748B]">Priority:</span>
              <Badge variant="warning">{surgery.priority}</Badge>
            </div>
          </div>

          {/* Pre-Op Notes */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-3">Pre-Op Notes</h3>
            <textarea
              rows={4}
              value={preOpNotes}
              onChange={(e) => setPreOpNotes(e.target.value)}
              disabled={isPostOpEnabled && surgery.status !== "IN_PROGRESS"}
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none disabled:bg-[#F8FAFC]"
            />
            {!isPostOpEnabled && (
              <button disabled={savingNotes} onClick={handleSaveNotes} className="mt-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
                {savingNotes ? "Saving..." : "Save Pre-Op Notes"}
              </button>
            )}
          </div>

          {/* Post-Op Notes */}
          <div className={`bg-white rounded-xl p-5 border border-[#E2E8F0] ${!isPostOpEnabled ? "opacity-60" : ""}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-[#0F172A]">Post-Op Notes</h3>
              {isPostOpEnabled && (
                <select value={outcome} onChange={e => setOutcome(e.target.value)} className="text-sm border border-[#E2E8F0] rounded-lg px-2 py-1 outline-none">
                  <option value="SUCCESSFUL">Successful</option>
                  <option value="COMPLICATIONS">Complications</option>
                  <option value="FAILED">Failed</option>
                </select>
              )}
            </div>
            <textarea
              rows={3}
              disabled={!isPostOpEnabled}
              value={postOpNotes}
              onChange={(e) => setPostOpNotes(e.target.value)}
              placeholder={isPostOpEnabled ? "Enter post-operative notes..." : "Add post-operative notes after procedure"}
              className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm bg-white disabled:bg-[#F8FAFC] text-[#0F172A] disabled:text-[#94A3B8] resize-none"
            />
            {!isPostOpEnabled ? (
              <p className="text-xs text-[#94A3B8] mt-1.5">Available once surgery is In Progress or beyond.</p>
            ) : (
              <button disabled={savingNotes} onClick={handleSaveNotes} className="mt-2 px-4 py-2 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:opacity-90">
                {savingNotes ? "Saving..." : "Save Post-Op Notes"}
              </button>
            )}
          </div>
        </div>

        {/* Right 40% */}
        <div className="xl:col-span-2 space-y-5">
          {/* Timeline */}
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-4">Surgery Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-sm text-[#64748B]">Actual Start</span>
                <span className="text-sm font-medium text-[#0F172A]">{surgery.actualStartAt ? new Date(surgery.actualStartAt).toLocaleString() : "Not started"}</span>
              </div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-sm text-[#64748B]">Actual End</span>
                <span className="text-sm font-medium text-[#0F172A]">{surgery.actualEndAt ? new Date(surgery.actualEndAt).toLocaleString() : "Not ended"}</span>
              </div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
                <span className="text-sm text-[#64748B]">Outcome</span>
                <span className="text-sm font-medium text-[#0F172A]">{surgery.outcome || "Pending"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
