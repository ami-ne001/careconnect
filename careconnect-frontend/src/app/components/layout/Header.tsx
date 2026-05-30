import { Bell, Search, Menu } from "lucide-react";
import { useNavigate } from "react-router";

interface HeaderProps {
  onMenuClick: () => void;
}

const roleColors: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700",
  Doctor: "bg-blue-100 text-blue-700",
  Nurse: "bg-pink-100 text-pink-700",
  Receptionist: "bg-green-100 text-green-700",
  Patient: "bg-orange-100 text-orange-700",
  Pharmacist: "bg-cyan-100 text-cyan-700",
  "Lab Technician": "bg-yellow-100 text-yellow-700",
};

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const role = localStorage.getItem("cc_role") || "Admin";
  const userName = localStorage.getItem("cc_user") || "Admin User";
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 bg-white border-b border-[#E2E8F0]"
      style={{ height: 64, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-[#F0F4F8] transition-colors lg:hidden"
        >
          <Menu size={20} className="text-[#64748B]" />
        </button>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v14M1 8h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[#1E3A5F] font-bold text-lg tracking-tight">
            CareConnect
          </span>
        </div>
      </div>

      {/* Center: search */}
      <div className="hidden md:flex items-center bg-[#F0F4F8] rounded-lg px-4 gap-2 flex-1 max-w-md mx-8">
        <Search size={16} className="text-[#64748B] shrink-0" />
        <input
          type="text"
          placeholder="Search patients, appointments..."
          className="bg-transparent w-full py-2.5 text-sm text-[#0F172A] placeholder:text-[#64748B] outline-none"
        />
      </div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-[#F0F4F8] transition-colors">
          <Bell size={20} className="text-[#64748B]" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
            3
          </span>
        </button>
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-[#0F172A] font-medium leading-tight">{userName}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleColors[role] || "bg-gray-100 text-gray-700"}`}>
              {role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
