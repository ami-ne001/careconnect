import { useState } from "react";
import { Upload, Flag, CheckCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const inProgressTests = [
  { id: "LAB-4422", label: "LAB-4422 — Ahmed Al-Farsi — CBC" },
  { id: "LAB-4423", label: "LAB-4423 — Maria Santos — Lipid Panel" },
  { id: "LAB-4425", label: "LAB-4425 — Carlos Rivera — Liver Function Tests" },
  { id: "LAB-4430", label: "LAB-4430 — Diana Collins — Vitamin D Level" },
];

const cbcFields = [
  { name: "WBC (White Blood Cells)", unit: "10³/µL", normal: "4.5–11.0" },
  { name: "RBC (Red Blood Cells)", unit: "10⁶/µL", normal: "4.5–5.9" },
  { name: "Hemoglobin", unit: "g/dL", normal: "13.5–17.5" },
  { name: "Hematocrit", unit: "%", normal: "41–53" },
  { name: "Platelets", unit: "10³/µL", normal: "150–400" },
  { name: "MCV", unit: "fL", normal: "80–100" },
];

const recentUploads = [
  { patient: "John Whitaker", test: "Thyroid Panel", time: "11:45 AM", flagged: false },
  { patient: "Priya Sharma", test: "Urinalysis", time: "11:20 AM", flagged: false },
  { patient: "Robert James", test: "HbA1c", time: "10:55 AM", flagged: true },
  { patient: "Fatima Al-Sayed", test: "Coagulation Panel", time: "10:30 AM", flagged: true },
  { patient: "Kevin Yip", test: "Urine Culture", time: "10:10 AM", flagged: false },
];

export function LabResultsUpload() {
  const [selectedTest, setSelectedTest] = useState("");
  const [flagCritical, setFlagCritical] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Results Upload" subtitle="Enter and upload laboratory test results" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-5">Enter Test Results</h3>

            {/* Test Selector */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Select In-Progress Test</label>
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] bg-white"
              >
                <option value="">— Select a test —</option>
                {inProgressTests.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Patient Info (auto-fill) */}
            {selectedTest && (
              <div className="mb-5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#64748B]">Patient</p>
                  <p className="font-medium text-[#0F172A]">Ahmed Al-Farsi</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Test Type</p>
                  <p className="font-medium text-[#0F172A]">Complete Blood Count</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">Ordering Doctor</p>
                  <p className="font-medium text-[#0F172A]">Dr. Sarah Mitchell</p>
                </div>
              </div>
            )}

            {/* CBC Fields */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Result Values</p>
              <div className="space-y-3">
                {cbcFields.map((field) => (
                  <div key={field.name} className="grid grid-cols-3 gap-3 items-center">
                    <label className="text-sm text-[#0F172A]">{field.name}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Value"
                        className="flex-1 h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                      />
                      <span className="text-xs text-[#64748B] shrink-0">{field.unit}</span>
                    </div>
                    <span className="text-xs text-[#64748B]">Normal: {field.normal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Notes / Interpretation</label>
              <textarea
                rows={3}
                placeholder="Add notes or clinical interpretation..."
                className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] resize-none"
              />
            </div>

            {/* Flag Critical */}
            <div className="mb-6">
              <button
                onClick={() => setFlagCritical(!flagCritical)}
                className={`flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-colors ${
                  flagCritical
                    ? "border-[#EF4444] bg-[#FEF2F2]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#EF4444]/50"
                }`}
              >
                <Flag size={18} className={flagCritical ? "text-[#EF4444]" : "text-[#94A3B8]"} />
                <div className="text-left">
                  <p className={`text-sm font-semibold ${flagCritical ? "text-[#EF4444]" : "text-[#64748B]"}`}>
                    Flag as Critical
                  </p>
                  <p className="text-xs text-[#94A3B8]">Doctor will be notified immediately</p>
                </div>
                <div className="ml-auto">
                  <div className={`w-10 h-5 rounded-full transition-colors ${flagCritical ? "bg-[#EF4444]" : "bg-[#E2E8F0]"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-all ${flagCritical ? "ml-5.5" : "ml-0.5"}`} />
                  </div>
                </div>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className={`flex-1 h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  submitted ? "bg-[#10B981] text-white" : "bg-[#1E3A5F] text-white hover:bg-[#162d4a]"
                }`}
              >
                {submitted ? (
                  <><CheckCircle size={15} />Uploaded & Notified</>
                ) : (
                  <><Upload size={15} />Upload & Notify Doctor</>
                )}
              </button>
              <button className="px-5 h-11 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                Save Draft
              </button>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Recently Uploaded</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {recentUploads.map((item, i) => (
              <div key={i} className="p-4 hover:bg-[#F8FAFC]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[#0F172A]">{item.patient}</p>
                  {item.flagged ? (
                    <span className="flex items-center gap-1 text-xs text-[#EF4444] font-medium">
                      <AlertTriangle size={12} />Critical
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-[#10B981] font-medium">
                      <CheckCircle size={12} />Normal
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B]">{item.test}</p>
                <p className="text-xs text-[#94A3B8] mt-1">Uploaded at {item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
