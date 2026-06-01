import { useState, useEffect } from "react";
import { Bed, Wrench } from "lucide-react";
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

function RoomCard({ room }: { room: RoomResponse }) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E2E8F0] p-3.5 ${borderColor[room.status as RoomStatus || "AVAILABLE"]} flex flex-col gap-1.5`}
      style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center justify-between">
        <p className="font-bold text-[#0F172A] text-xs">Room {room.roomNumber}</p>
        <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
          <Bed size={10} />
          <span>{room.type}</span>
        </div>
      </div>
      {room.status === "AVAILABLE" && (
        <div className="flex items-center justify-center py-3">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
            Available
          </span>
        </div>
      )}
      {room.status === "OCCUPIED" && (
        <div className="flex items-center justify-center py-3">
          <span className="px-2.5 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] text-[10px] font-bold">
            Occupied
          </span>
        </div>
      )}
      {room.status === "MAINTENANCE" && (
        <div className="flex items-center gap-1.5 py-2 justify-center">
          <Wrench size={10} className="text-amber-500 shrink-0" />
          <span className="text-[10px] text-amber-700 font-bold">Maintenance</span>
        </div>
      )}
    </div>
  );
}

export function RoomsBoard() {
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWardId, setActiveWardId] = useState<number | "All">("All");

  useEffect(() => {
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
  }, []);

  const totalRooms = rooms.length;
  const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
  const available = rooms.filter((r) => r.status === "AVAILABLE").length;
  const maintenance = rooms.filter((r) => r.status === "MAINTENANCE").length;

  // Group rooms by ward
  const getRoomsForWard = (wardId: number) => {
    return rooms.filter((r) => r.wardId === wardId);
  };

  const visibleWards = activeWardId === "All"
    ? wards
    : wards.filter((w) => w.id === activeWardId);

  return (
    <div>
      <PageHeader title="Room Board" subtitle="Hospital room and bed availability" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading hospital beds…</span>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { label: "Total Rooms", value: totalRooms, color: "bg-blue-100 text-blue-700" },
              { label: "Occupied", value: occupied, color: "bg-[#1E3A5F] text-white" },
              { label: "Available", value: available, color: "bg-emerald-100 text-emerald-700" },
              { label: "Maintenance", value: maintenance, color: "bg-amber-100 text-amber-700" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${s.color}`}>
                <span>{s.label}:</span>
                <span className="font-extrabold">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Ward filter tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-6 overflow-x-auto" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <button
              onClick={() => setActiveWardId("All")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeWardId === "All" ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              All Wards
            </button>
            {wards.map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveWardId(w.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeWardId === w.id ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>

          {/* Wards grid */}
          <div className="space-y-6">
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
                        <RoomCard key={room.id} room={room} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
