import { useState, useEffect } from "react";
import { Bed, X, Plus, Search, AlertCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { receptionistApi, adminApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { AdmissionResponse, RoomResponse, WardResponse } from "@/api/receptionist.api";
import type { PatientProfileResponse } from "@/types";
import type { AdminUser } from "@/types";

export function AdmissionsManagement() {
  const [admissions, setAdmissions] = useState<AdmissionResponse[]>([]);
  const [patients, setPatients] = useState<PatientProfileResponse[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal display states
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedDischargeAdmission, setSelectedDischargeAdmission] = useState<AdmissionResponse | null>(null);

  // New Admission state
  const [selectedPatientId, setSelectedPatientId] = useState<number | "">("");
  const [admittingDoctorId, setAdmittingDoctorId] = useState<number | "">("");
  const [admissionReason, setAdmissionReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [expectedDischarge, setExpectedDischarge] = useState("");
  const [selectedWardId, setSelectedWardId] = useState<number | "">("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | "">("");
  const [selectedBedNumber, setSelectedBedNumber] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  // Discharge form state
  const [dischargeStatus, setDischargeStatus] = useState<"RECOVERED" | "AGAINST_MEDICAL_ADVICE" | "TRANSFERRED" | "DECEASED">("RECOVERED");
  const [conditionOnDischarge, setConditionOnDischarge] = useState<"STABLE" | "IMPROVED" | "UNCHANGED" | "CRITICAL">("STABLE");
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("");

  const getPatientDisplayName = (pId: number) => {
    const p = patients.find((pat) => pat.id === pId);
    if (!p) return `Patient ID #${pId}`;
    const u = users.find((user) => user.id === p.userId);
    return u ? `${u.firstName} ${u.lastName}` : `Patient Profile #${p.id}`;
  };

  const getDoctorDisplayName = (doctorUserId: number) => {
    const d = doctors.find((doc) => doc.id === doctorUserId);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : `Doctor #${doctorUserId}`;
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      receptionistApi.getActiveAdmissions(),
      receptionistApi.getPatientsList(0, 100),
      adminApi.getUsers("PATIENT"),
      adminApi.getUsers("DOCTOR"),
      receptionistApi.getWards(),
      receptionistApi.getRooms()
    ])
      .then(([{ data: active }, { data: ptsPage }, { data: ptsUsers }, { data: docs }, { data: wds }, { data: rms }]) => {
        setAdmissions(active);
        setPatients(ptsPage.content || []);
        setUsers(ptsUsers || []);
        setDoctors(docs || []);
        setWards(wds || []);
        setRooms(rms || []);
        if (wds.length > 0) setSelectedWardId(wds[0].id);
      })
      .catch((err) => {
        console.error(err);
        toast.error(getApiErrorMessage(err, "Failed to load admissions board."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset discharge form every time a new patient is opened for discharge
  useEffect(() => {
    if (selectedDischargeAdmission) {
      setDischargeStatus("RECOVERED");
      setConditionOnDischarge("STABLE");
      setDischargeNotes("");
      setFollowUpInstructions("");
    }
  }, [selectedDischargeAdmission]);

  const handleAdmit = async () => {
    if (!selectedPatientId || !admittingDoctorId || !selectedRoomId || !selectedBedNumber || !admissionReason) {
      toast.error("Please fill in patient, doctor, room, bed, and reason for admission.");
      return;
    }
    setSubmitting(true);
    try {
      await receptionistApi.admitPatient({
        patientId: Number(selectedPatientId),
        admittingDoctorId: Number(admittingDoctorId),
        roomId: Number(selectedRoomId),
        bedNumber: Number(selectedBedNumber),
        admissionReason: admissionReason.trim() || undefined,
        diagnosis: diagnosis.trim() || undefined,
        expectedDischargeDate: expectedDischarge || undefined,
      });

      toast.success("Patient admitted successfully!");
      setShowAdmitModal(false);
      
      // Reset form
      setSelectedPatientId("");
      setAdmittingDoctorId("");
      setSelectedRoomId("");
      setSelectedBedNumber("");
      setAdmissionReason("");
      setDiagnosis("");
      setExpectedDischarge("");
      
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to admit patient."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischarge = async () => {
    if (!selectedDischargeAdmission) return;
    setSubmitting(true);
    try {
      await receptionistApi.dischargePatient(selectedDischargeAdmission.id, {
        dischargeStatus,
        conditionOnDischarge,
        dischargeNotes: dischargeNotes.trim() || undefined,
        followUpInstructions: followUpInstructions.trim() || undefined,
      });

      toast.success("Discharge completed successfully.");
      setSelectedDischargeAdmission(null);
      setDischargeNotes("");
      setFollowUpInstructions("");
      setDischargeStatus("RECOVERED");
      setConditionOnDischarge("STABLE");
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to complete discharge."));
    } finally {
      setSubmitting(false);
    }
  };

  // Filter rooms by selected ward — exclude only MAINTENANCE rooms
  const filteredRooms = rooms.filter((r) => r.wardId === selectedWardId && r.status !== "MAINTENANCE");
  const selectedRoomObj = rooms.find((r) => r.id === selectedRoomId);
  const availableRoomsCount = rooms.filter((r) => r.status === "AVAILABLE").length;

  // Compute which beds in the selected room are already taken from current admissions
  const takenBedNumbers = admissions
    .filter(a => a.room?.id === selectedRoomId)
    .map(a => a.bedNumber);

  // Admit form reset
  const resetAdmitForm = () => {
    setSelectedPatientId("");
    setAdmittingDoctorId("");
    setAdmissionReason("");
    setDiagnosis("");
    setExpectedDischarge("");
    setSelectedWardId(wards.length > 0 ? wards[0].id : "");
    setSelectedRoomId("");
    setSelectedBedNumber("");
  };

  // Reset admit form each time modal opens
  useEffect(() => {
    if (showAdmitModal) resetAdmitForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdmitModal]);

  // Filtered admissions for table search
  const filteredAdmissions = admissions.filter(a => {
    if (!search.trim()) return true;
    const name = getPatientDisplayName(a.patientId).toLowerCase();
    const doc = getDoctorDisplayName(a.admittingDoctorId).toLowerCase();
    const room = a.room?.roomNumber?.toLowerCase() ?? "";
    const s = search.toLowerCase();
    return name.includes(s) || doc.includes(s) || room.includes(s);
  });

  return (
    <div>
      <PageHeader title="Admissions Management" subtitle="Inpatient admissions and discharge processing" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading admission board…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
            <StatCard title="Currently Admitted" value={String(admissions.length)} subtitle="Active inpatients" icon={<Bed size={20} className="text-[#1E3A5F]" />} iconBg="bg-blue-50" />
            <StatCard title="Available Rooms" value={String(availableRoomsCount)} subtitle="Rooms ready for use" icon={<Bed size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
            <StatCard title="Total Wards" value={String(wards.length)} subtitle="Hospital wards on file" icon={<AlertCircle size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3">
              <h3 className="font-semibold text-[#0F172A] shrink-0">Current Admissions</h3>
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search patient, doctor, room…"
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] bg-[#F8FAFC]"
                />
              </div>
              <button
                onClick={() => setShowAdmitModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 cursor-pointer shrink-0"
              >
                <Plus size={14} />Admit New Patient
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Patient Name", "Doctor", "Ward / Room", "Admit Date", "Est. Discharge", "Reason", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748B]">
                        {search.trim() ? `No admissions match "${search}"` : "No active inpatients in wards."}
                      </td>
                    </tr>
                  ) : (
                    filteredAdmissions.map((a, i) => {
                      const adt = a.admissionDate ? new Date(a.admissionDate).toLocaleDateString() : "—";
                      const edt = a.expectedDischargeDate ? new Date(a.expectedDischargeDate).toLocaleDateString() : "—";
                      const pName = getPatientDisplayName(a.patientId);
                      const initials = pName.slice(0, 2).toUpperCase();

                      return (
                        <tr key={a.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
                              <div>
                                <p className="font-medium text-[#0F172A] whitespace-nowrap">{pName}</p>
                                <p className="text-[10px] text-[#64748B]">ID #{a.patientId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{getDoctorDisplayName(a.admittingDoctorId)}</td>
                          <td className="px-4 py-3.5 text-[#0F172A] whitespace-nowrap">
                            <span className="font-bold">Room {a.room?.roomNumber}</span> (Bed {a.bedNumber})
                            {wards.find(w => w.id === a.room?.wardId)?.name && (
                              <p className="text-[10px] text-[#64748B]">{wards.find(w => w.id === a.room?.wardId)?.name}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{adt}</td>
                          <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{edt}</td>
                          <td className="px-4 py-3.5 text-[#64748B] max-w-[180px] truncate" title={a.admissionReason}>{a.admissionReason || "—"}</td>
                          <td className="px-4 py-3.5">
                            <Badge variant="active" dot>{a.status}</Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => setSelectedDischargeAdmission(a)}
                              className="px-3 py-1.5 rounded-lg bg-[#F59E0B] text-white text-xs font-bold hover:opacity-90 cursor-pointer transition-colors"
                            >
                              Discharge
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Admit Modal */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#0F172A] text-base">Admit New Patient</h3>
              <button className="cursor-pointer" onClick={() => setShowAdmitModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Select Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white"
                  >
                    <option value="">— Select Patient —</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{getPatientDisplayName(p.id)} (ID #{p.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Admitting Doctor</label>
                  <select
                    value={admittingDoctorId}
                    onChange={(e) => setAdmittingDoctorId(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  >
                    <option value="">— Select Doctor —</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName} ({doc.departmentName || "General"})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Admission Reason</label>
                  <textarea
                    rows={2}
                    value={admissionReason}
                    onChange={(e) => setAdmissionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none"
                    placeholder="Enter reason for admission..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Initial Diagnosis (Optional)</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    placeholder="e.g. Acute Appendicitis"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Expected Discharge</label>
                  <input
                    type="date"
                    value={expectedDischarge}
                    onChange={(e) => setExpectedDischarge(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Select Ward</label>
                  <select
                    value={selectedWardId}
                    onChange={(e) => {
                      setSelectedWardId(Number(e.target.value));
                      setSelectedRoomId("");
                      setSelectedBedNumber("");
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  >
                    <option value="">— Select Ward —</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} (Cap: {w.capacity})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Select Room</label>
                  {filteredRooms.length === 0 ? (
                    <div className="text-xs text-[#94A3B8] italic py-2">No rooms configured in this ward.</div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 max-h-[120px] overflow-y-auto p-1 border border-[#E2E8F0] rounded-lg">
                      {filteredRooms.map((r) => {
                        const takenInRoom = admissions.filter(a => a.room?.id === r.id).length;
                        const freeBeds = r.bedCount - takenInRoom;
                        const isFullyOccupied = freeBeds <= 0;
                        return (
                          <button
                            key={r.id}
                            disabled={isFullyOccupied}
                            onClick={() => { setSelectedRoomId(r.id); setSelectedBedNumber(""); }}
                            className={`p-2 rounded-lg border text-xs font-semibold transition-all flex flex-col items-center gap-0.5
                              ${selectedRoomId === r.id ? "border-[#1E3A5F] bg-[#1E3A5F] text-white" :
                                isFullyOccupied ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50" :
                                freeBeds < r.bedCount ? "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400 cursor-pointer" :
                                "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 cursor-pointer"}`}
                          >
                            <span>{r.roomNumber}</span>
                            <span className="text-[9px] font-normal mt-0.5">
                              {isFullyOccupied ? "Full" : `${freeBeds}/${r.bedCount} free`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {selectedRoomObj && (
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Select Bed (1-{selectedRoomObj.bedCount})</label>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: selectedRoomObj.bedCount }).map((_, idx) => {
                        const bNum = idx + 1;
                        const isTaken = takenBedNumbers.includes(bNum);
                        return (
                          <button
                            key={bNum}
                            disabled={isTaken}
                            onClick={() => !isTaken && setSelectedBedNumber(bNum)}
                            title={isTaken ? "This bed is already occupied" : `Select Bed ${bNum}`}
                            className={`h-9 rounded-md border text-xs font-bold transition-all ${
                              isTaken
                                ? "bg-red-50 border-red-200 text-red-300 cursor-not-allowed"
                                : selectedBedNumber === bNum
                                ? "bg-[#0EA5E9] border-[#0EA5E9] text-white"
                                : "bg-white border-[#CBD5E1] text-[#0F172A] hover:border-[#0EA5E9] cursor-pointer"
                            }`}
                          >
                            {isTaken ? "✕" : `B${bNum}`}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-1.5">Red beds are occupied. Select a free bed.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end gap-3 bg-[#F8FAFC]">
              <button onClick={() => setShowAdmitModal(false)} className="px-5 h-10 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer">Cancel</button>
              <button
                onClick={handleAdmit}
                disabled={submitting}
                className="px-5 h-10 rounded-lg bg-[#1E3A5F] text-white text-xs font-bold hover:opacity-90 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />}
                Confirm Admission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discharge Modal */}
      {selectedDischargeAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[#0F172A] text-base">Process Discharge</h3>
              <button className="cursor-pointer" onClick={() => setSelectedDischargeAdmission(null)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-4 text-xs">
                <p className="font-bold text-[#0EA5E9] text-sm">Discharging Inpatient: {getPatientDisplayName(selectedDischargeAdmission.patientId)}</p>
                <p className="text-[#64748B] mt-0.5">
                  Admitted {selectedDischargeAdmission.admissionDate ? new Date(selectedDischargeAdmission.admissionDate).toLocaleDateString() : "—"} · Room {selectedDischargeAdmission.room?.roomNumber} / Bed {selectedDischargeAdmission.bedNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Discharge Status</label>
                  <select
                    value={dischargeStatus}
                    onChange={(e) => setDischargeStatus(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  >
                    <option value="RECOVERED">Recovered</option>
                    <option value="AGAINST_MEDICAL_ADVICE">Against Medical Advice</option>
                    <option value="TRANSFERRED">Transferred</option>
                    <option value="DECEASED">Deceased</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Condition on Discharge</label>
                  <select
                    value={conditionOnDischarge}
                    onChange={(e) => setConditionOnDischarge(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  >
                    <option value="STABLE">Stable</option>
                    <option value="IMPROVED">Improved</option>
                    <option value="UNCHANGED">Unchanged</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Discharge Notes</label>
                <textarea
                  rows={2}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  placeholder="Enter final diagnosis condition on discharge..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Follow-up Instructions</label>
                <textarea
                  rows={2}
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  placeholder="Medications to take, next visit schedule..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end gap-3 bg-[#F8FAFC]">
              <button onClick={() => setSelectedDischargeAdmission(null)} className="px-5 h-10 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer">Cancel</button>
              <button
                onClick={handleDischarge}
                disabled={submitting}
                className="px-5 h-10 rounded-lg bg-[#10B981] text-white text-xs font-bold hover:opacity-90 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />}
                Complete Discharge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
