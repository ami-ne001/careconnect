import { useState, useEffect } from "react";
import { Bed, X, Plus, ChevronDown, Search, AlertCircle } from "lucide-react";
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

  // Modal display states
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedDischargeAdmission, setSelectedDischargeAdmission] = useState<AdmissionResponse | null>(null);

  // New Admission state
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [admittingDoctorId, setAdmittingDoctorId] = useState<number | null>(null);
  const [admissionReason, setAdmissionReason] = useState("");
  const [admitDate, setAdmitDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDischarge, setExpectedDischarge] = useState("");
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Discharge form state
  const [actualDischargeDate, setActualDischargeDate] = useState(new Date().toISOString().split("T")[0]);
  const [dischargeNotes, setDischargeNotes] = useState("");

  const getPatientDisplayName = (p: PatientProfileResponse) => {
    const u = users.find((user) => user.id === p.userId);
    return u ? `${u.firstName} ${u.lastName}` : `Patient Profile #${p.id}`;
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

  const handleAdmit = async () => {
    if (!selectedPatientId || !selectedRoomId || !admissionReason) {
      toast.error("Please fill in patient, room, and reason for admission.");
      return;
    }
    setSubmitting(true);
    try {
      await receptionistApi.admitPatient({
        patientId: selectedPatientId,
        roomId: selectedRoomId,
        admissionDate: admitDate,
        reason: admissionReason.trim() + (notes.trim() ? ` (Notes: ${notes.trim()})` : ""),
        expectedDischargeDate: expectedDischarge || undefined,
      });

      toast.success("Patient admitted successfully!");
      setShowAdmitModal(false);
      // Reset form
      setSelectedPatientId(null);
      setSelectedRoomId(null);
      setAdmissionReason("");
      setExpectedDischarge("");
      setNotes("");
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
        dischargeDate: actualDischargeDate,
        dischargeNotes: dischargeNotes.trim() || undefined,
      });

      toast.success("Discharge completed successfully.");
      setSelectedDischargeAdmission(null);
      setDischargeNotes("");
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to complete discharge."));
    } finally {
      setSubmitting(false);
    }
  };

  // Filter rooms by selected ward
  const filteredRooms = rooms.filter((r) => r.wardId === selectedWardId);
  const availableRoomsCount = rooms.filter((r) => r.status === "AVAILABLE").length;

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
            <StatCard title="Available Rooms" value={String(availableRoomsCount)} subtitle="Beds ready for use" icon={<Bed size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
            <StatCard title="Total Wards" value={String(wards.length)} subtitle="Hospital wards on file" icon={<AlertCircle size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-semibold text-[#0F172A]">Current Admissions</h3>
              <button
                onClick={() => setShowAdmitModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
              >
                <Plus size={14} />Admit New Patient
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Patient ID / Name", "Ward Name", "Room Number", "Admit Date", "Expected Discharge", "Reason", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {admissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748B]">No active inpatients in wards.</td>
                    </tr>
                  ) : (
                    admissions.map((a, i) => {
                      const adt = new Date(a.admissionDate).toLocaleDateString();
                      const edt = a.expectedDischargeDate ? new Date(a.expectedDischargeDate).toLocaleDateString() : "—";
                      const initials = a.patientName ? a.patientName.slice(0, 2).toUpperCase() : "IP";

                      return (
                        <tr key={a.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
                              <div>
                                <p className="font-medium text-[#0F172A] whitespace-nowrap">{a.patientName || "Inpatient"}</p>
                                <p className="text-[10px] text-[#64748B]">ID #{a.patientId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{a.wardName || "General Care"}</td>
                          <td className="px-4 py-3.5 font-bold text-[#0F172A] whitespace-nowrap">Room {a.roomNumber || "—"}</td>
                          <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{adt}</td>
                          <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{edt}</td>
                          <td className="px-4 py-3.5 text-[#64748B] max-w-[180px] truncate" title={a.reason}>{a.reason}</td>
                          <td className="px-4 py-3.5">
                            <Badge variant="active" dot>{a.status}</Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => setSelectedDischargeAdmission(a)}
                              className="px-3 py-1.5 rounded-lg bg-[#F59E0B] text-white text-xs font-bold hover:opacity-90 cursor-pointer transition-colors"
                            >
                              Discharge Patient
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
                    value={selectedPatientId || ""}
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white"
                  >
                    <option value="">— Select Patient —</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{getPatientDisplayName(p)} (ID #{p.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Admitting Doctor</label>
                  <select
                    value={admittingDoctorId || ""}
                    onChange={(e) => setAdmittingDoctorId(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  >
                    <option value="">— Select Doctor —</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName} ({doc.departmentName || "General Care"})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Admission Reason / Diagnosis</label>
                  <textarea
                    rows={3}
                    value={admissionReason}
                    onChange={(e) => setAdmissionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none text-xs"
                    placeholder="Enter diagnosis or clinical reason for admission..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Admit Date</label>
                    <input
                      type="date"
                      value={admitDate}
                      onChange={(e) => setAdmitDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
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
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Select Ward</label>
                  <select
                    value={selectedWardId || ""}
                    onChange={(e) => {
                      setSelectedWardId(Number(e.target.value));
                      setSelectedRoomId(null);
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
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Select Bed / Room</label>
                  {filteredRooms.length === 0 ? (
                    <div className="text-xs text-[#94A3B8] italic p-4 text-center">No rooms configured in this ward.</div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto p-1 border border-[#E2E8F0] rounded-xl">
                      {filteredRooms.map((r) => (
                        <button
                          key={r.id}
                          disabled={r.status !== "AVAILABLE"}
                          onClick={() => setSelectedRoomId(r.id)}
                          className={`p-2 rounded-lg border text-xs font-semibold transition-all flex flex-col items-center gap-0.5 cursor-pointer
                            ${selectedRoomId === r.id ? "border-[#1E3A5F] bg-[#1E3A5F] text-white" :
                              r.status === "AVAILABLE" ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400" :
                              "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"}`}
                        >
                          <span>{r.roomNumber}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.status === "AVAILABLE" ? "bg-emerald-500" : "bg-red-500"}`} />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 mt-3 text-[10px] text-[#64748B]">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Available</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Occupied / Maintenance</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Additional Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none text-xs"
                    placeholder="Enter additional intake comments..."
                  />
                </div>
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
                <p className="font-bold text-[#0EA5E9] text-sm">Discharging Inpatient: {selectedDischargeAdmission.patientName}</p>
                <p className="text-[#64748B] mt-0.5">
                  Admitted {new Date(selectedDischargeAdmission.admissionDate).toLocaleDateString()} · Bed/Room {selectedDischargeAdmission.roomNumber} ({selectedDischargeAdmission.wardName})
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Actual Discharge Date</label>
                <input
                  type="date"
                  value={actualDischargeDate}
                  onChange={(e) => setActualDischargeDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Discharge Summary & Notes</label>
                <textarea
                  rows={4}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  placeholder="Enter diagnosis condition on discharge, recovery instructions..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none"
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
