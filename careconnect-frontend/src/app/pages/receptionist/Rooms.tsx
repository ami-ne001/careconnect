import { useState } from "react";
import { Bed, Wrench } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

type RoomStatus = "available" | "occupied" | "maintenance";

interface RoomData {
  number: string;
  status: RoomStatus;
  patient?: string;
  admitDate?: string;
  doctor?: string;
  beds?: number;
}

const wardData: { name: string; rooms: RoomData[] }[] = [
  {
    name: "Cardiology Ward",
    rooms: [
      { number: "301", status: "occupied", patient: "Fatima Al-Zahrani", admitDate: "June 13", doctor: "Dr. Mitchell", beds: 1 },
      { number: "302", status: "occupied", patient: "Kevin Osei", admitDate: "June 11", doctor: "Dr. Mitchell", beds: 1 },
      { number: "303", status: "available", beds: 1 },
      { number: "304", status: "available", beds: 2 },
      { number: "305", status: "occupied", patient: "Carlos Rivera", admitDate: "June 14", doctor: "Dr. Holloway", beds: 1 },
      { number: "306", status: "maintenance", beds: 1 },
      { number: "307", status: "available", beds: 2 },
      { number: "308", status: "occupied", patient: "Ahmed Al-Farsi", admitDate: "June 16", doctor: "Dr. Mitchell", beds: 1 },
    ],
  },
  {
    name: "CCU",
    rooms: [
      { number: "501", status: "occupied", patient: "John Whitaker", admitDate: "June 16", doctor: "Dr. Park", beds: 1 },
      { number: "502", status: "occupied", patient: "Priya Singh", admitDate: "June 15", doctor: "Dr. Park", beds: 1 },
      { number: "503", status: "occupied", patient: "Omar Nasser", admitDate: "June 14", doctor: "Dr. Mitchell", beds: 1 },
      { number: "504", status: "occupied", patient: "Grace Kimani", admitDate: "June 13", doctor: "Dr. Park", beds: 1 },
      { number: "505", status: "occupied", patient: "Lucas Ferrer", admitDate: "June 12", doctor: "Dr. Mitchell", beds: 1 },
      { number: "506", status: "occupied", patient: "Amara Diallo", admitDate: "June 11", doctor: "Dr. Park", beds: 1 },
    ],
  },
  {
    name: "General Ward",
    rooms: [
      { number: "201", status: "available", beds: 2 },
      { number: "202", status: "occupied", patient: "Yasmine Tazi", admitDate: "June 15", doctor: "Dr. Holloway", beds: 2 },
      { number: "203", status: "available", beds: 2 },
      { number: "204", status: "occupied", patient: "Remi Okafor", admitDate: "June 14", doctor: "Dr. Holloway", beds: 2 },
      { number: "205", status: "maintenance", beds: 2 },
      { number: "206", status: "available", beds: 2 },
      { number: "207", status: "occupied", patient: "Nadia Kowalski", admitDate: "June 15", doctor: "Dr. Holloway", beds: 1 },
      { number: "208", status: "occupied", patient: "Maria Santos", admitDate: "June 15", doctor: "Dr. Mitchell", beds: 1 },
      { number: "209", status: "available", beds: 2 },
      { number: "210", status: "available", beds: 2 },
    ],
  },
  {
    name: "Orthopedics Ward",
    rooms: [
      { number: "401", status: "available", beds: 1 },
      { number: "402", status: "occupied", patient: "Sofia Ferreira", admitDate: "June 16", doctor: "Dr. Chen", beds: 1 },
      { number: "403", status: "available", beds: 1 },
      { number: "410", status: "occupied", patient: "Thomas Green", admitDate: "June 12", doctor: "Dr. Ross", beds: 1 },
      { number: "411", status: "available", beds: 2 },
      { number: "412", status: "maintenance", beds: 1 },
    ],
  },
  {
    name: "Pediatrics Ward",
    rooms: [
      { number: "601", status: "occupied", patient: "Zara El-Amin", admitDate: "June 15", doctor: "Dr. Chen", beds: 1 },
      { number: "602", status: "available", beds: 1 },
      { number: "603", status: "available", beds: 1 },
      { number: "604", status: "occupied", patient: "Leo Martins", admitDate: "June 14", doctor: "Dr. Chen", beds: 1 },
    ],
  },
  {
    name: "Endocrinology Ward",
    rooms: [
      { number: "701", status: "available", beds: 1 },
      { number: "702", status: "occupied", patient: "Maria Santos", admitDate: "June 15", doctor: "Dr. Mitchell", beds: 1 },
      { number: "703", status: "available", beds: 2 },
      { number: "704", status: "available", beds: 1 },
    ],
  },
];

const allWards = ["All Wards", ...wardData.map((w) => w.name)];

const borderColor: Record<RoomStatus, string> = {
  available: "border-t-4 border-t-emerald-400",
  occupied: "border-t-4 border-t-[#1E3A5F]",
  maintenance: "border-t-4 border-t-amber-400",
};

function RoomCard({ room }: { room: RoomData }) {
  return (
    <div className={`bg-white rounded-xl border border-[#E2E8F0] p-3 ${borderColor[room.status]} flex flex-col gap-1.5`} style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-[#0F172A]">Room {room.number}</p>
        <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
          <Bed size={10} />
          <span>{room.beds}</span>
        </div>
      </div>
      {room.status === "available" && (
        <div className="flex items-center justify-center py-3">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Available</span>
        </div>
      )}
      {room.status === "occupied" && room.patient && (
        <div>
          <p className="text-xs font-semibold text-[#0F172A] truncate">{room.patient}</p>
          <p className="text-[10px] text-[#64748B] truncate">{room.doctor}</p>
          <p className="text-[10px] text-[#94A3B8]">Admitted {room.admitDate}</p>
        </div>
      )}
      {room.status === "maintenance" && (
        <div className="flex items-center gap-1.5 py-2">
          <Wrench size={12} className="text-amber-500 shrink-0" />
          <span className="text-xs text-amber-700 font-medium">Under Maintenance</span>
        </div>
      )}
    </div>
  );
}

export function RoomsBoard() {
  const [activeWard, setActiveWard] = useState("All Wards");

  const allRooms = wardData.flatMap((w) => w.rooms);
  const totalRooms = allRooms.length;
  const occupied = allRooms.filter((r) => r.status === "occupied").length;
  const available = allRooms.filter((r) => r.status === "available").length;
  const maintenance = allRooms.filter((r) => r.status === "maintenance").length;

  const visibleWards = activeWard === "All Wards" ? wardData : wardData.filter((w) => w.name === activeWard);

  return (
    <div>
      <PageHeader title="Room Board" subtitle="Hospital room and bed availability · /receptionist/rooms" />

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: "Total Rooms", value: totalRooms, color: "bg-blue-100 text-blue-700" },
          { label: "Occupied", value: occupied, color: "bg-[#1E3A5F] text-white" },
          { label: "Available", value: available, color: "bg-emerald-100 text-emerald-700" },
          { label: "Maintenance", value: maintenance, color: "bg-amber-100 text-amber-700" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${s.color}`}>
            <span>{s.label}:</span>
            <span className="font-bold">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Ward filter tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-6 overflow-x-auto" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {allWards.map((w) => (
          <button
            key={w}
            onClick={() => setActiveWard(w)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeWard === w ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"}`}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Wards grid */}
      <div className="space-y-6">
        {visibleWards.map((ward) => (
          <div key={ward.name} className="bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold text-[#0F172A]">{ward.name}</h3>
              <span className="text-xs text-[#64748B] bg-[#F0F4F8] px-2 py-0.5 rounded-full">{ward.rooms.length} rooms</span>
              <div className="flex items-center gap-3 ml-auto text-xs text-[#64748B]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />{ward.rooms.filter((r) => r.status === "occupied").length} occupied</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{ward.rooms.filter((r) => r.status === "available").length} available</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-3">
              {ward.rooms.map((room) => (
                <RoomCard key={room.number} room={room} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
