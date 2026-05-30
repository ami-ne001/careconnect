import { useState } from "react";
import { FlaskConical as Flask, Download, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const labResults = [
  {
    id: "LAB-4421",
    test: "Complete Blood Count (CBC)",
    doctor: "Dr. Sarah Mitchell",
    date: "June 13, 2025",
    status: "ready",
    details: [
      { name: "WBC (White Blood Cells)", value: "7.2", unit: "10³/µL", range: "4.5–11.0", normal: true },
      { name: "RBC (Red Blood Cells)", value: "4.8", unit: "10⁶/µL", range: "4.5–5.9", normal: true },
      { name: "Hemoglobin", value: "14.2", unit: "g/dL", range: "13.5–17.5", normal: true },
      { name: "Hematocrit", value: "42.1", unit: "%", range: "41–53", normal: true },
      { name: "Platelets", value: "320", unit: "10³/µL", range: "150–400", normal: true },
      { name: "MCV", value: "88", unit: "fL", range: "80–100", normal: true },
    ],
  },
  {
    id: "LAB-4418",
    test: "Lipid Panel",
    doctor: "Dr. Sarah Mitchell",
    date: "June 13, 2025",
    status: "ready",
    details: [
      { name: "Total Cholesterol", value: "218", unit: "mg/dL", range: "<200", normal: false },
      { name: "LDL Cholesterol", value: "142", unit: "mg/dL", range: "<100", normal: false },
      { name: "HDL Cholesterol", value: "52", unit: "mg/dL", range: ">40", normal: true },
      { name: "Triglycerides", value: "128", unit: "mg/dL", range: "<150", normal: true },
    ],
  },
  {
    id: "LAB-4401",
    test: "Thyroid Panel (TSH, T3, T4)",
    doctor: "Dr. Alan Park",
    date: "June 10, 2025",
    status: "ready",
    details: [
      { name: "TSH", value: "2.4", unit: "mIU/L", range: "0.4–4.0", normal: true },
      { name: "Free T3", value: "3.1", unit: "pg/mL", range: "2.3–4.2", normal: true },
      { name: "Free T4", value: "1.2", unit: "ng/dL", range: "0.8–1.8", normal: true },
    ],
  },
  {
    id: "LAB-4389",
    test: "Basic Metabolic Panel",
    doctor: "Dr. Sarah Mitchell",
    date: "May 28, 2025",
    status: "ready",
    details: [
      { name: "Glucose", value: "98", unit: "mg/dL", range: "70–100", normal: true },
      { name: "BUN (Blood Urea Nitrogen)", value: "18", unit: "mg/dL", range: "7–20", normal: true },
      { name: "Creatinine", value: "0.9", unit: "mg/dL", range: "0.6–1.2", normal: true },
      { name: "Sodium", value: "140", unit: "mEq/L", range: "136–145", normal: true },
      { name: "Potassium", value: "4.1", unit: "mEq/L", range: "3.5–5.0", normal: true },
    ],
  },
];

export function PatientLabResults() {
  const [expanded, setExpanded] = useState<string | null>("LAB-4421");

  return (
    <div>
      <PageHeader title="Lab Results" subtitle="View your laboratory test results and reports" />

      <div className="space-y-4">
        {labResults.map((result) => {
          const isExpanded = expanded === result.id;
          const hasAbnormal = result.details.some((d) => !d.normal);
          return (
            <div
              key={result.id}
              className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              {/* Header */}
              <button
                className="w-full flex items-center justify-between p-5 hover:bg-[#F8FAFC] transition-colors"
                onClick={() => setExpanded(isExpanded ? null : result.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-xl">🧪</div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-[#0F172A]">{result.test}</h4>
                      {hasAbnormal && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-medium">
                          Values Out of Range
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#64748B]">
                      {result.id} · Ordered by {result.doctor} · {result.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="active" dot>Ready</Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-sm text-[#64748B] hover:bg-[#F8FAFC]"
                  >
                    <Download size={13} />
                    PDF
                  </button>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-[#64748B]" />
                  ) : (
                    <ChevronDown size={18} className="text-[#64748B]" />
                  )}
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-[#E2E8F0]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                          {["Test Parameter", "Your Value", "Unit", "Reference Range", "Status"].map((h) => (
                            <th
                              key={h}
                              className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.details.map((d, i) => (
                          <tr
                            key={i}
                            className={`border-b border-[#F1F5F9] ${
                              !d.normal ? "bg-[#FFF7ED]" : i % 2 === 1 ? "bg-[#FAFBFC]" : ""
                            }`}
                          >
                            <td className="px-5 py-3.5 font-medium text-[#0F172A]">{d.name}</td>
                            <td className={`px-5 py-3.5 font-bold ${d.normal ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                              {d.value}
                            </td>
                            <td className="px-5 py-3.5 text-[#64748B]">{d.unit}</td>
                            <td className="px-5 py-3.5 text-[#64748B]">{d.range}</td>
                            <td className="px-5 py-3.5">
                              {d.normal ? (
                                <span className="flex items-center gap-1 text-[#10B981] text-xs font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block" />
                                  Normal
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[#EF4444] text-xs font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block" />
                                  Out of Range
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                    <p className="text-xs text-[#64748B]">
                      Results reviewed by laboratory technician · Report generated {result.date}
                    </p>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:bg-[#162d4a]">
                      <Download size={13} />
                      Download Full Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
