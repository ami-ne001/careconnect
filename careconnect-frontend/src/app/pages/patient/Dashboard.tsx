import { Calendar, Pill, FlaskConical, CreditCard, Bed } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router";

const activities = [
  { icon: "🔬", text: "Lab result uploaded: Complete Blood Count", time: "Today, 10:30 AM", color: "bg-purple-100 text-purple-600" },
  { icon: "📅", text: "Appointment confirmed: June 18 with Dr. Mitchell", time: "Yesterday, 3:00 PM", color: "bg-blue-100 text-blue-600" },
  { icon: "💊", text: "Prescription renewed: Amlodipine 5mg", time: "June 12, 11:00 AM", color: "bg-green-100 text-green-600" },
  { icon: "💳", text: "Payment received: $120.00 — INV-2847", time: "June 11, 2:30 PM", color: "bg-amber-100 text-amber-600" },
  { icon: "🔬", text: "Lab result ready: Lipid Panel", time: "June 10, 9:00 AM", color: "bg-purple-100 text-purple-600" },
];

const tips = [
  "💧 Drink at least 8 glasses of water daily to stay hydrated.",
  "🏃 Aim for 30 minutes of moderate exercise most days of the week.",
  "😴 Adults need 7–9 hours of quality sleep each night.",
  "🥗 Include more fruits and vegetables in your daily diet.",
];

export function PatientDashboard() {
  const navigate = useNavigate();
  const tipIdx = new Date().getDay() % tips.length;

  return (
    <div>
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0EA5E9] rounded-xl p-5 mb-6 text-white">
        <h2 className="font-bold text-xl mb-0.5">Hello, Ahmed 👋</h2>
        <p className="text-white/70 text-sm">Here's your health summary for today</p>
      </div>

      {/* Inpatient status banner */}
      <div className="border-l-4 border-[#0EA5E9] bg-[#F0F9FF] rounded-xl p-4 mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Bed size={20} className="text-[#0EA5E9] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#0F172A] text-sm">You are currently admitted</p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#64748B]">
              <span>🏥 Room 301, Cardiology Ward</span>
              <span>📅 Admitted June 13</span>
              <span>📤 Expected Discharge June 18</span>
              <span>👨‍⚕️ Attending: Dr. Sarah Mitchell</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming surgery card */}
      <div className="border-l-4 border-[#0EA5E9] bg-white rounded-xl p-4 mb-6 border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">🔪</span>
            <div>
              <p className="font-semibold text-[#0F172A] text-sm">You have a scheduled surgery</p>
              <p className="text-sm text-[#64748B] mt-0.5">Coronary Artery Bypass Graft (CABG)</p>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-[#64748B]">
                <span>📅 June 17, 2025 at 08:00 AM</span>
                <span>👨‍⚕️ Dr. Sarah Mitchell</span>
                <span>🚪 Operating Room: OR-2</span>
              </div>
              <p className="text-xs text-amber-600 font-medium mt-1.5 bg-amber-50 px-2 py-1 rounded-lg inline-block">⚠️ Fasting required from midnight. Report to OR prep area at 06:30 AM.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]">View Details</button>
            <button className="px-3 py-2 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:opacity-90">Contact Surgeon</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Next Appointment" value="June 18" subtitle="Dr. Sarah Mitchell" icon={<Calendar size={20} className="text-[#0EA5E9]" />} iconBg="bg-sky-50" />
        <StatCard title="Active Prescriptions" value="2" subtitle="On file" icon={<Pill size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
        <StatCard title="Lab Results Ready" value="1 new" subtitle="View now" trend="up" trendValue="New result" icon={<FlaskConical size={20} className="text-[#8B5CF6]" />} iconBg="bg-purple-50" />
        <StatCard title="Outstanding Balance" value="$120" subtitle="Due July 1" icon={<CreditCard size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Upcoming appointment */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-4">Upcoming Appointment</h3>
          <div className="bg-gradient-to-r from-[#EFF6FF] to-[#F0F9FF] rounded-xl p-5 border border-[#BFDBFE]">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white text-lg font-bold shrink-0">SM</div>
              <div className="flex-1">
                <h4 className="font-bold text-[#0F172A]" style={{ fontSize: 16 }}>Dr. Sarah Mitchell</h4>
                <p className="text-sm text-[#64748B]">Cardiology · Senior Cardiologist</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-[#0F172A]">
                    <Calendar size={14} className="text-[#0EA5E9]" />
                    <span className="font-medium">June 18, 2025 — 10:30 AM</span>
                  </div>
                  <span className="text-[#64748B] text-sm">Room 204 · Follow-up</span>
                </div>
              </div>
              <Badge variant="active">Confirmed</Badge>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 h-10 rounded-xl border border-[#BFDBFE] bg-white text-[#0EA5E9] text-sm font-medium hover:bg-[#EFF6FF] transition-colors">Add to Calendar</button>
              <button onClick={() => navigate("/patient/appointments")} className="flex-1 h-10 rounded-xl bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">View Details</button>
            </div>
          </div>
        </div>

        {/* Active prescriptions */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-4">Active Prescriptions</h3>
          <div className="space-y-3">
            {[
              { med: "Amlodipine 5mg", dose: "1 tablet daily", refill: "June 30" },
              { med: "Aspirin 81mg", dose: "1 tablet daily", refill: "July 10" },
            ].map((p, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-lg">💊</span>
                  <p className="font-semibold text-[#0F172A] text-sm">{p.med}</p>
                </div>
                <p className="text-xs text-[#64748B] ml-7">{p.dose}</p>
                <p className="text-xs text-[#94A3B8] ml-7 mt-0.5">Refill due: {p.refill}</p>
              </div>
            ))}
            <button onClick={() => navigate("/patient/prescriptions")} className="w-full h-9 rounded-xl border border-[#E2E8F0] text-sm text-[#0EA5E9] font-medium hover:bg-[#F0F4F8] transition-colors">Request Refill</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Recent Activity</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3.5 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center text-base shrink-0`}>
                  {a.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#0F172A] font-medium">{a.text}</p>
                  <p className="text-xs text-[#94A3B8]">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health tip */}
        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#0EA5E9] rounded-xl p-6 text-white" style={{ boxShadow: "0 4px 16px rgba(14,165,233,0.2)" }}>
          <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">Health Tip of the Day</p>
          <p className="text-lg font-medium leading-relaxed">{tips[tipIdx]}</p>
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-white/50 text-xs">From your care team at CareConnect</p>
          </div>
        </div>
      </div>
    </div>
  );
}