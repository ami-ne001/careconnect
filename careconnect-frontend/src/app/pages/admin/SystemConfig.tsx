import { useState } from "react";
import { Building2, Shield, Bell, Database, Upload } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden mb-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#0EA5E9]">{icon}</div>
        <h3 className="font-semibold text-[#0F172A]">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Toggle({ label, sublabel, defaultValue }: { label: string; sublabel?: string; defaultValue?: boolean }) {
  const [on, setOn] = useState(defaultValue ?? false);
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        {sublabel && <p className="text-xs text-[#64748B] mt-0.5">{sublabel}</p>}
      </div>
      <button onClick={() => setOn(!on)} className={`w-12 h-6 rounded-full transition-colors relative ${on ? "bg-[#0EA5E9]" : "bg-[#CBD5E1]"}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
}

export function AdminSystemConfig() {
  return (
    <div>
      <PageHeader title="System Configuration" subtitle="Manage hospital settings, security and notifications" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
        <div className="xl:pr-3">
          {/* Hospital Info */}
          <Section icon={<Building2 size={16} />} title="Hospital Information">
            <div className="space-y-4">
              {[
                { label: "Hospital Name", val: "CareConnect General Hospital" },
                { label: "Address", val: "123 Medical Drive, Healthcare City, HC 00100" },
                { label: "Phone Number", val: "+1 (555) 200-0100" },
                { label: "Admin Email", val: "admin@careconnect.com" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">{f.label}</label>
                  <input defaultValue={f.val} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">Hospital Logo</label>
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[#0EA5E9] transition-colors">
                  <Upload size={20} className="text-[#94A3B8]" />
                  <span className="text-xs text-[#64748B]">Click to upload or drag & drop</span>
                  <span className="text-xs text-[#94A3B8]">PNG, JPG up to 2MB</span>
                </div>
              </div>
              <button className="w-full h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">Save Changes</button>
            </div>
          </Section>

          {/* Security */}
          <Section icon={<Shield size={16} />} title="Security Settings">
            <div>
              <div className="space-y-4 mb-4">
                {[
                  { label: "Minimum Password Length", val: "10" },
                  { label: "Session Timeout (minutes)", val: "30" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">{f.label}</label>
                    <input type="number" defaultValue={f.val} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                ))}
              </div>
              <Toggle label="Two-Factor Authentication" sublabel="Require 2FA for all staff logins" defaultValue={true} />
              <Toggle label="Force Password Reset" sublabel="Require staff to reset password every 90 days" defaultValue={false} />
              <Toggle label="IP Allowlist" sublabel="Restrict access to approved IP addresses only" defaultValue={false} />
              <button className="w-full h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 mt-4">Save Changes</button>
            </div>
          </Section>
        </div>

        <div className="xl:pl-3">
          {/* Notifications */}
          <Section icon={<Bell size={16} />} title="Notification Settings">
            <Toggle label="Email Alerts" sublabel="Send email notifications for critical events" defaultValue={true} />
            <Toggle label="SMS Alerts" sublabel="Send SMS for urgent patient updates" defaultValue={true} />
            <Toggle label="Appointment Reminders" sublabel="Remind patients 24h before appointment" defaultValue={true} />
            <Toggle label="Lab Result Notifications" sublabel="Notify doctors when results are ready" defaultValue={true} />
            <Toggle label="Low Stock Alerts" sublabel="Alert pharmacists when inventory is low" defaultValue={true} />
            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">Reminder Timing</label>
              <select className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                <option>24 hours before</option>
                <option>12 hours before</option>
                <option>2 hours before</option>
                <option>1 hour before</option>
              </select>
            </div>
            <button className="w-full h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 mt-4">Save Changes</button>
          </Section>

          {/* Backup */}
          <Section icon={<Database size={16} />} title="Backup Settings">
            <Toggle label="Automatic Backups" sublabel="Enable scheduled automatic backups" defaultValue={true} />
            <Toggle label="Cloud Backup" sublabel="Mirror backups to cloud storage" defaultValue={true} />
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">Backup Frequency</label>
                <select className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                  <option>Every 6 hours</option>
                  <option>Every 12 hours</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                </select>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">Last Backup Successful</p>
                  <p className="text-xs text-[#64748B]">June 14, 2025 — 08:00 AM (2 hours ago)</p>
                </div>
              </div>
            </div>
            <button className="w-full h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 mt-4">Save Changes</button>
          </Section>
        </div>
      </div>
    </div>
  );
}
