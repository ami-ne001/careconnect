import { useState, useEffect } from "react";
import { Bed, Wrench, X, Edit2 } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { receptionistApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { RoomResponse, WardResponse } from "@/api/receptionist.api";

type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

const borderColor: Record<RoomStatus, string> = {
  AVAILABLE: "border-t-4 border-t-emerald-400",
  OCCUPIED: "border-t-4 border-t-[#1E3A5F]",
  MAINTENANCE: "border-t-4 border-t-amber-400",
};

export function RoomsBoard() {
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWardId, setActiveWardId] = useState<number | "All">("All");

  // Edit Modal State
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  const [newStatus, setNewStatus] = useState<RoomStatus | "">("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      receptionistApi.getWards(),
      receptionistApi.getRooms()
    ])
      .then(([{ data: wds }, { data: rms }]) => {
        setWards(wds);
        setRooms(rms);
      })
      .catch((err) => {
        console.error(err);
        toast.error(getApiErrorMessage(err, "Failed to load rooms board."));
      })
      .finally(() => setLoading(false));
  };

  const totalRooms = rooms.length;
  const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
  const available = rooms.filter((r) => r.status === "AVAILABLE").length;
  const maintenance = rooms.filter((r) => r.status === "MAINTENANCE").length;

  const getRoomsForWard = (wardId: number) => {
    return rooms.filter((r) => r.wardId === wardId);
  };

  const visibleWards = activeWardId === "All"
    ? wards
    : wards.filter((w) => w.id === activeWardId);

  const handleRoomClick = (room: RoomResponse) => {
    // Receptionist shouldn't manually toggle 'OCCUPIED' unless discharging
    // Discharging should be done through Admissions.
    if (room.status === "OCCUPIED") {
      toast.info("Occupied rooms must be discharged through Admissions.");
      return;
    }
    setSelectedRoom(room);
    setNewStatus(room.status as RoomStatus);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRoom || !newStatus || newStatus === selectedRoom.status) {
      setSelectedRoom(null);
      return;
    }
    try {
      setIsUpdating(true);
      await receptionistApi.updateRoomStatus(selectedRoom.id, newStatus);
      toast.success(`Room ${selectedRoom.roomNumber} updated to ${newStatus}`);
      setSelectedRoom(null);
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update room status."));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-full flex flex-col pb-6">
      <PageHeader title="Room Board" subtitle="Hospital room and bed availability" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading hospital beds…</span>
        </div>
      ) : (
        <>
          {/* Controls: Stats & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Total Rooms", value: totalRooms, color: "bg-blue-100 text-blue-700" },
                { label: "Occupied", value: occupied, color: "bg-[#1E3A5F] text-white" },
                { label: "Available", value: available, color: "bg-emerald-100 text-emerald-700" },
                { label: "Maintenance", value: maintenance, color: "bg-amber-100 text-amber-700" },
              ].map((s) => (
                <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${s.color}`}>
                  <span>{s.label}:</span>
                  <span className="font-extrabold">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-[#0F172A] whitespace-nowrap">Filter by Ward:</label>
              <select
                value={activeWardId}
                onChange={(e) => setActiveWardId(e.target.value === "All" ? "All" : Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white font-medium min-w-[200px]"
              >
                <option value="All">All Wards</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Wards grid */}
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {visibleWards.map((ward) => {
              const wardRoomsList = getRoomsForWard(ward.id);
              return (
                <div key={ward.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-semibold text-sm text-[#0F172A]">{ward.name}</h3>
                    <span className="text-[10px] font-bold text-[#64748B] bg-[#F0F4F8] px-2.5 py-0.5 rounded-full">
                      {wardRoomsList.length} rooms (Cap: {ward.capacity})
                    </span>
                    <div className="flex items-center gap-3 ml-auto text-[10px] text-[#64748B] font-medium">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />
                        {wardRoomsList.filter((r) => r.status === "OCCUPIED").length} occupied
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {wardRoomsList.filter((r) => r.status === "AVAILABLE").length} available
                      </span>
                    </div>
                  </div>
                  {wardRoomsList.length === 0 ? (
                    <div className="text-xs text-[#94A3B8] italic py-4 text-center">No beds currently configured in this ward.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-3">
                      {wardRoomsList.map((room) => (
                        <div
                          key={room.id}
                          onClick={() => handleRoomClick(room)}
                          className={`bg-white rounded-xl border border-[#E2E8F0] p-3.5 ${borderColor[room.status as RoomStatus || "AVAILABLE"]} flex flex-col justify-between gap-1.5 cursor-pointer hover:shadow-md transition-shadow relative group h-24`}
                          style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
                        >
                          {room.status !== "OCCUPIED" && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit2 size={12} className="text-[#94A3B8]" />
                            </div>
                          )}
                          <div className="flex items-start justify-between mt-0.5">
                            <div>
                              <p className="font-bold text-[#0F172A] text-xs">Room {room.roomNumber}</p>
                              {room.notes && (
                                <p className="text-[9px] text-[#64748B] truncate max-w-[80px]" title={room.notes}>{room.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#1E3A5F] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                              <Bed size={10} />
                              <span>{room.bedCount}</span>
                            </div>
                          </div>
                          <div className="mt-auto">
                            {room.status === "AVAILABLE" && (
                              <div className="flex items-center justify-center">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase">
                                  Available
                                </span>
                              </div>
                            )}
                            {room.status === "OCCUPIED" && (
                              <div className="flex items-center justify-center">
                                <span className="px-2.5 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] text-[9px] font-bold uppercase">
                                  Occupied
                                </span>
                              </div>
                            )}
                            {room.status === "MAINTENANCE" && (
                              <div className="flex items-center gap-1 justify-center">
                                <Wrench size={10} className="text-amber-500 shrink-0" />
                                <span className="text-[9px] text-amber-700 font-bold uppercase">Maintenance</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Edit Room Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A] text-lg">Update Room Status</h3>
              <button onClick={() => setSelectedRoom(null)}>
                <X size={18} className="text-[#64748B] hover:text-[#0F172A]" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mb-5 text-sm">
                <p><span className="text-[#64748B]">Room Number:</span> <span className="font-bold text-[#0F172A]">{selectedRoom.roomNumber}</span></p>
                <p><span className="text-[#64748B]">Beds:</span> <span className="font-bold text-[#0F172A]">{selectedRoom.bedCount}</span></p>
                {selectedRoom.notes && (
                  <p className="mt-1"><span className="text-[#64748B]">Notes:</span> <span className="italic text-[#0F172A]">{selectedRoom.notes}</span></p>
                )}
              </div>

              <label className="block text-sm font-semibold text-[#0F172A] mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RoomStatus)}
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white"
              >
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setSelectedRoom(null)} 
                className="flex-1 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] font-medium text-sm hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateStatus} 
                disabled={isUpdating}
                className="flex-1 py-2 rounded-lg bg-[#0EA5E9] text-white font-medium text-sm hover:bg-[#0284C7] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isUpdating ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
