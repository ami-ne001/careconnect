import { useState, useEffect } from "react";
import { Calendar, Pill, FlaskConical, CreditCard } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { patientApi } from "@/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";
import type { PatientProfileResponse } from "@/types";

const tips = [
  "💧 Drink at least 8 glasses of water daily to stay hydrated.",
  "🏃 Aim for 30 minutes of moderate exercise most days of the week.",
  "😴 Adults need 7–9 hours of quality sleep each night.",
  "🥗 Include more fruits and vegetables in your daily diet.",
];

export function PatientDashboard() {
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const tipIdx = new Date().getDay() % tips.length;

  useEffect(() => {
    const userIdRaw = localStorage.getItem("cc_userId");
    if (!userIdRaw) return;
    const userId = Number(userIdRaw);

    patientApi.getProfileByUserId(userId)
      .then(({ data }) => {
        setProfile(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(getApiErrorMessage(err, "Failed to load patient summary."));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const patientName = profile ? `${profile.firstName} ${profile.lastName}` : "Patient";

  return (
    <div>
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0EA5E9] rounded-xl p-6 mb-6 text-white" style={{ boxShadow: "0 4px 12px rgba(30,58,95,0.15)" }}>
        <h2 className="font-bold text-2xl mb-1">Hello, {patientName} 👋</h2>
        <p className="text-white/80 text-sm">Welcome back to your health dashboard.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Active Profile Status" value={profile ? "Verified" : "Pending"} subtitle={profile ? `Ref ID: #${profile.id}` : "Unregistered"} icon={<Calendar size={20} className="text-[#0EA5E9]" />} iconBg="bg-sky-50" />
        <StatCard title="Active Allergies" value={profile ? String(profile.allergies.length) : "0"} subtitle="On file" icon={<Pill size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
        <StatCard title="Chronic Conditions" value={profile ? String(profile.chronicConditions.length) : "0"} subtitle="Diagnosed" icon={<FlaskConical size={20} className="text-[#8B5CF6]" />} iconBg="bg-purple-50" />
        <StatCard title="Emergency Contact" value={profile?.emergencyContactName || "Not Set"} subtitle={profile?.emergencyContactPhone || "—"} icon={<CreditCard size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Profile Card Summary */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-4">Patient Profile Summary</h3>
          {loading ? (
            <div className="flex justify-center py-6">
              <span className="animate-spin rounded-full h-6 w-6 border-2 border-[#1E3A5F] border-t-transparent" />
            </div>
          ) : profile ? (
            <div className="space-y-3.5 text-sm text-[#475569]">
              <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                <span className="font-medium text-[#64748B]">Date of Birth:</span>
                <span className="text-[#0F172A]">{profile.dateOfBirth}</span>
              </div>
              <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                <span className="font-medium text-[#64748B]">Gender:</span>
                <span className="text-[#0F172A]">{profile.gender}</span>
              </div>
              <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                <span className="font-medium text-[#64748B]">Blood Group:</span>
                <span className="text-[#0F172A]">{profile.bloodType?.replace("_", " ") || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-[#F1F5F9] pb-2">
                <span className="font-medium text-[#64748B]">Phone Number:</span>
                <span className="text-[#0F172A]">{profile.phone || "—"}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="font-medium text-[#64748B]">Residential Address:</span>
                <span className="text-[#0F172A] text-right max-w-xs truncate">{profile.address || "—"}</span>
              </div>
            </div>
          ) : (
            <p className="text-[#64748B]">No active patient profile found.</p>
          )}
        </div>

        {/* Health Tip */}
        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#0EA5E9] rounded-xl p-6 text-white flex flex-col justify-between" style={{ boxShadow: "0 4px 16px rgba(14,165,233,0.2)" }}>
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">Health Tip of the Day</p>
            <p className="text-lg font-medium leading-relaxed">{tips[tipIdx]}</p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-white/50 text-xs">From your care team at CareConnect</p>
          </div>
        </div>
      </div>
    </div>
  );
}