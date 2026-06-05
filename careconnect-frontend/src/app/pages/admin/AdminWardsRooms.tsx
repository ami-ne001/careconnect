import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Bed, Building2, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { receptionistApi } from "@/api/receptionist.api";
import type { WardResponse, RoomResponse } from "@/api/receptionist.api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { Badge } from "../../components/ui/Badge";

export function AdminWardsRooms() {
  const [activeTab, setActiveTab] = useState<"wards" | "rooms">("wards");

  // Wards State
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [loadingWards, setLoadingWards] = useState(true);
  const [wardModalOpen, setWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<WardResponse | null>(null);
  const [wardForm, setWardForm] = useState({ name: "", description: "", floor: "" });

  // Rooms State
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomResponse | null>(null);
  const [roomForm, setRoomForm] = useState({ wardId: "", roomNumber: "", bedCount: "", status: "AVAILABLE", notes: "" });
  const [filterWardId, setFilterWardId] = useState<string>("ALL");

  const fetchWards = async () => {
    try {
      setLoadingWards(true);
      const { data } = await receptionistApi.getWards();
      setWards(data);
    } catch (err) {
      toast.error("Failed to load wards");
    } finally {
      setLoadingWards(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const { data } = await receptionistApi.getRooms();
      setRooms(data);
    } catch (err) {
      toast.error("Failed to load rooms");
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchWards();
    fetchRooms();
  }, []);

  // --- Ward Handlers ---
  const handleOpenWardModal = (ward?: WardResponse) => {
    if (ward) {
      setEditingWard(ward);
      setWardForm({
        name: ward.name,
        description: ward.description || "",
        floor: ward.floor ? String(ward.floor) : "",
      });
    } else {
      setEditingWard(null);
      setWardForm({ name: "", description: "", floor: "" });
    }
    setWardModalOpen(true);
  };

  const handleSaveWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardForm.name.trim()) return;
    
    try {
      const payload = {
        name: wardForm.name,
        description: wardForm.description,
        floor: wardForm.floor ? parseInt(wardForm.floor) : undefined
      };
      
      if (editingWard) {
        await receptionistApi.updateWard(editingWard.id, payload);
        toast.success("Ward updated successfully");
      } else {
        await receptionistApi.createWard(payload);
        toast.success("Ward created successfully");
      }
      setWardModalOpen(false);
      fetchWards();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save ward"));
    }
  };

  const handleDeleteWard = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ward? All rooms inside it must be deleted first.")) return;
    try {
      await receptionistApi.deleteWard(id);
      toast.success("Ward deleted");
      fetchWards();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete ward"));
    }
  };

  // --- Room Handlers ---
  const handleOpenRoomModal = (room?: RoomResponse) => {
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        wardId: String(room.wardId),
        roomNumber: room.roomNumber,
        bedCount: String(room.bedCount),
        status: room.status,
        notes: room.notes || ""
      });
    } else {
      setEditingRoom(null);
      setRoomForm({ wardId: wards.length > 0 ? String(wards[0].id) : "", roomNumber: "", bedCount: "", status: "AVAILABLE", notes: "" });
    }
    setRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.wardId || !roomForm.roomNumber || !roomForm.bedCount) return;
    
    try {
      const payload = {
        wardId: parseInt(roomForm.wardId),
        roomNumber: roomForm.roomNumber,
        bedCount: parseInt(roomForm.bedCount),
        status: roomForm.status,
        notes: roomForm.notes
      };
      
      if (editingRoom) {
        await receptionistApi.updateRoom(editingRoom.id, payload);
        toast.success("Room updated successfully");
      } else {
        await receptionistApi.createRoom(payload);
        toast.success("Room created successfully");
      }
      setRoomModalOpen(false);
      fetchRooms();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save room"));
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await receptionistApi.deleteRoom(id);
      toast.success("Room deleted");
      fetchRooms();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete room"));
    }
  };

  const filteredRooms = filterWardId === "ALL" 
    ? rooms 
    : rooms.filter(r => r.wardId === parseInt(filterWardId));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wards & Rooms Management"
        subtitle="Configure hospital wards and patient rooms"
      />

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0]">
        <button
          onClick={() => setActiveTab("wards")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "wards"
              ? "border-[#0EA5E9] text-[#0EA5E9]"
              : "border-transparent text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <div className="flex items-center gap-2"><Building2 size={16} /> Wards</div>
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "rooms"
              ? "border-[#0EA5E9] text-[#0EA5E9]"
              : "border-transparent text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <div className="flex items-center gap-2"><Bed size={16} /> Rooms</div>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {/* WARDS TAB */}
        {activeTab === "wards" && (
          <div>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <h3 className="font-semibold text-[#0F172A]">All Wards</h3>
              <button
                onClick={() => handleOpenWardModal()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:opacity-90 transition-all cursor-pointer"
              >
                <Plus size={14} /> Add Ward
              </button>
            </div>
            {loadingWards ? (
              <div className="py-12 flex justify-center"><span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" /></div>
            ) : wards.length === 0 ? (
              <div className="py-12 text-center text-[#64748B]">No wards found. Create one to get started.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="text-left px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">Description</th>
                    <th className="text-left px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">Floor</th>
                    <th className="text-right px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wards.map(w => (
                    <tr key={w.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3 font-medium text-[#0F172A]">{w.name}</td>
                      <td className="px-5 py-3 text-[#64748B]">{w.description || "—"}</td>
                      <td className="px-5 py-3 text-[#64748B]">{w.floor ?? "—"}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenWardModal(w)} className="p-1.5 text-[#0F172A] hover:bg-[#E2E8F0] rounded cursor-pointer"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteWard(w.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ROOMS TAB */}
        {activeTab === "rooms" && (
          <div>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-[#0F172A]">All Rooms</h3>
                <select
                  value={filterWardId}
                  onChange={e => setFilterWardId(e.target.value)}
                  className="h-8 pl-3 pr-8 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] bg-white outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                >
                  <option value="ALL">All Wards</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handleOpenRoomModal()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:opacity-90 transition-all cursor-pointer"
              >
                <Plus size={14} /> Add Room
              </button>
            </div>
            {loadingRooms ? (
              <div className="py-12 flex justify-center"><span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" /></div>
            ) : filteredRooms.length === 0 ? (
              <div className="py-12 text-center text-[#64748B]">No rooms found for the selected ward.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="text-left px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">Room Number</th>
                    <th className="text-left px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">Ward</th>
                    <th className="text-left px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">Beds</th>
                    <th className="text-left px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map(r => (
                    <tr key={r.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="px-5 py-3 font-medium text-[#0F172A]">{r.roomNumber}</td>
                      <td className="px-5 py-3 text-[#64748B]">{r.wardName || `Ward #${r.wardId}`}</td>
                      <td className="px-5 py-3 text-[#64748B]">{r.bedCount}</td>
                      <td className="px-5 py-3">
                        <Badge variant={r.status === "AVAILABLE" ? "active" : r.status === "MAINTENANCE" ? "inactive" : "pending"}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenRoomModal(r)} className="p-1.5 text-[#0F172A] hover:bg-[#E2E8F0] rounded cursor-pointer"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteRoom(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Ward Modal */}
      {wardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setWardModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-semibold text-[#0F172A] text-lg">{editingWard ? "Edit Ward" : "Add Ward"}</h3>
              <button onClick={() => setWardModalOpen(false)} className="p-2 -mr-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-full cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveWard} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Ward Name <span className="text-red-500">*</span></label>
                <input required value={wardForm.name} onChange={e => setWardForm({...wardForm, name: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0EA5E9] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Floor (Optional)</label>
                <input type="number" value={wardForm.floor} onChange={e => setWardForm({...wardForm, floor: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0EA5E9] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Description (Optional)</label>
                <textarea rows={3} value={wardForm.description} onChange={e => setWardForm({...wardForm, description: e.target.value})} className="w-full p-3 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0EA5E9] outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setWardModalOpen(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Cancel</button>
                <button type="submit" className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">Save Ward</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRoomModalOpen(false)} />
          <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-semibold text-[#0F172A] text-lg">{editingRoom ? "Edit Room" : "Add Room"}</h3>
              <button onClick={() => setRoomModalOpen(false)} className="p-2 -mr-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-full cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Ward <span className="text-red-500">*</span></label>
                <select required value={roomForm.wardId} onChange={e => setRoomForm({...roomForm, wardId: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0EA5E9] outline-none">
                  <option value="">Select Ward</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Room Number <span className="text-red-500">*</span></label>
                  <input required value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0EA5E9] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Bed Count <span className="text-red-500">*</span></label>
                  <input type="number" required min="1" value={roomForm.bedCount} onChange={e => setRoomForm({...roomForm, bedCount: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0EA5E9] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Status</label>
                <select value={roomForm.status} onChange={e => setRoomForm({...roomForm, status: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0EA5E9] outline-none">
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="CLEANING">Cleaning</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1">Notes (Optional)</label>
                <textarea rows={2} value={roomForm.notes} onChange={e => setRoomForm({...roomForm, notes: e.target.value})} className="w-full p-3 rounded-lg border border-[#E2E8F0] text-sm focus:ring-2 focus:ring-[#0EA5E9] outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setRoomModalOpen(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Cancel</button>
                <button type="submit" className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
