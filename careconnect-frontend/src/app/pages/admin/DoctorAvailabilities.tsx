import { useState, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarCheck, Search } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { adminApi } from "@/api";
import { appointmentApi } from "@/api/appointment.api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { AdminUser } from "@/types";
import type { DoctorAvailabilityResponse } from "@/api/appointment.api";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

export function DoctorAvailabilities() {
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState<AdminUser | null>(null);
  const [availabilities, setAvailabilities] = useState<DoctorAvailabilityResponse[]>([]);
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState("MONDAY");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [adding, setAdding] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const { data } = await adminApi.getUsers("DOCTOR");
      setDoctors(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load doctors"));
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchAvailability = async (doctorId: number) => {
    try {
      setLoadingAvailabilities(true);
      const { data } = await appointmentApi.getDoctorAvailability(doctorId);
      setAvailabilities(data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load availabilities"));
    } finally {
      setLoadingAvailabilities(false);
    }
  };

  const handleSelectDoctor = (doc: AdminUser) => {
    setSelectedDoctor(doc);
    fetchAvailability(doc.id);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    if (!startTime || !endTime) {
      toast.error("Please provide both start and end times.");
      return;
    }
    if (startTime >= endTime) {
      toast.error("Start time must be before end time.");
      return;
    }

    try {
      setAdding(true);
      await appointmentApi.setDoctorAvailability(selectedDoctor.id, {
        dayOfWeek,
        startTime,
        endTime
      });
      toast.success("Availability added successfully");
      fetchAvailability(selectedDoctor.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to add availability"));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!selectedDoctor) return;
    try {
      await appointmentApi.deleteDoctorAvailability(id);
      toast.success("Availability removed");
      fetchAvailability(selectedDoctor.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove availability"));
    }
  };

  const filteredDoctors = doctors.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <PageHeader
        title="Doctor Schedules & Availability"
        subtitle="Manage working hours and shift availabilities for hospital doctors"
      />

      <div className="flex gap-6 flex-1 h-[calc(100vh-140px)]">
        {/* Left Sidebar: Doctor Selection */}
        <div className="w-1/3 bg-white rounded-xl border border-[#E2E8F0] flex flex-col overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loadingDoctors ? (
              <div className="flex justify-center py-8">
                <span className="animate-spin rounded-full h-6 w-6 border-2 border-[#1E3A5F] border-t-transparent" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-8 text-[#64748B] text-sm">
                No doctors found.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredDoctors.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectDoctor(doc)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 cursor-pointer ${
                      selectedDoctor?.id === doc.id
                        ? "bg-[#0EA5E9] text-white"
                        : "hover:bg-[#F1F5F9] text-[#0F172A]"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      selectedDoctor?.id === doc.id ? "bg-white/20 text-white" : "bg-[#1E3A5F] text-white"
                    }`}>
                      {doc.firstName[0]}{doc.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">Dr. {doc.firstName} {doc.lastName}</p>
                      <p className={`text-xs truncate ${selectedDoctor?.id === doc.id ? "text-sky-100" : "text-[#64748B]"}`}>
                        {doc.departmentName || "General Practice"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Main Content: Availability Management */}
        <div className="flex-1 bg-white rounded-xl border border-[#E2E8F0] flex flex-col overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {selectedDoctor ? (
            <>
              <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="font-bold text-[#0F172A] text-lg">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
                <p className="text-sm text-[#64748B]">Manage Weekly Schedule</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Add Slot Form */}
                  <div className="lg:col-span-2">
                    <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5">
                      <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <Plus size={16} className="text-[#0EA5E9]" /> Add Availability Slot
                      </h4>
                      
                      <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-[#0F172A] mb-1">Day of Week</label>
                          <select
                            value={dayOfWeek}
                            onChange={(e) => setDayOfWeek(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                          >
                            {DAYS_OF_WEEK.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#0F172A] mb-1">Start Time</label>
                            <input
                              type="time"
                              required
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#0F172A] mb-1">End Time</label>
                            <input
                              type="time"
                              required
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={adding}
                          className="w-full h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {adding ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <CalendarCheck size={16} /> Save Slot
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Schedule List */}
                  <div className="lg:col-span-3">
                    <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-[#0EA5E9]" /> Current Weekly Schedule
                    </h4>
                    
                    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                      {loadingAvailabilities ? (
                        <div className="flex justify-center py-12">
                          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
                        </div>
                      ) : availabilities.length === 0 ? (
                        <div className="text-center py-12 text-[#64748B] bg-[#F8FAFC]">
                          <p>No availability slots defined.</p>
                          <p className="text-sm mt-1">Patients won't be able to book appointments with this doctor.</p>
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                              <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">Day</th>
                              <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">Time Slot</th>
                              <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {availabilities.sort((a, b) => DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek)).map((avail) => (
                              <tr key={avail.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                                <td className="px-5 py-3.5">
                                  <Badge variant="info">{avail.dayOfWeek}</Badge>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-2 text-[#0F172A] font-medium">
                                    <Clock size={14} className="text-[#64748B]" />
                                    {avail.startTime.substring(0, 5)} - {avail.endTime.substring(0, 5)}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <button
                                    onClick={() => handleDelete(avail.id)}
                                    className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
                                    title="Remove Slot"
                                  >
                                    <Trash2 size={16} /> Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#64748B]">
              <CalendarCheck size={48} className="text-[#CBD5E1] mb-4" />
              <p className="text-lg font-medium text-[#0F172A]">Select a Doctor</p>
              <p className="text-sm mt-1">Choose a doctor from the list to view and manage their schedule.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
