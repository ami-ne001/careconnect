import { CheckCircle, Clock } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";

const activeTests = [
  {
    id: "LAB-4422",
    patient: "Ahmed Al-Farsi",
    test: "Complete Blood Count (CBC)",
    startTime: "09:15 AM",
    technician: "Tech. Samuel Brooks",
    stage: 2, // 0=Sample Received, 1=Processing, 2=Quality Check, 3=Complete
    notes: "Sample quality good. Running automated analysis.",
  },
  {
    id: "LAB-4423",
    patient: "Maria Santos",
    test: "Lipid Panel",
    startTime: "09:40 AM",
    technician: "Tech. Rachel Kim",
    stage: 1,
    notes: "Fasting sample confirmed. Processing in progress.",
  },
  {
    id: "LAB-4425",
    patient: "Carlos Rivera",
    test: "Liver Function Tests",
    startTime: "10:10 AM",
    technician: "Tech. Samuel Brooks",
    stage: 1,
    notes: "Urgent — expediting processing.",
  },
  {
    id: "LAB-4430",
    patient: "Diana Collins",
    test: "Vitamin D Level",
    startTime: "11:20 AM",
    technician: "Tech. Rachel Kim",
    stage: 2,
    notes: "Analysis complete. Awaiting quality check sign-off.",
  },
];

const stages = ["Sample Received", "Processing", "Quality Check", "Complete"];

export function LabTestProcessing() {
  return (
    <div>
      <PageHeader title="Test Processing" subtitle="Active tests currently being processed in the lab" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {activeTests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-[#0F172A]">{test.test}</h4>
                </div>
                <p className="text-sm text-[#64748B]">{test.id} · {test.patient}</p>
              </div>
              <Badge variant="active" dot>In Progress</Badge>
            </div>

            <div className="p-5 space-y-4">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Start Time</p>
                  <p className="font-medium text-[#0F172A] flex items-center gap-1.5"><Clock size={13} className="text-[#0EA5E9]" />{test.startTime}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] mb-0.5">Technician</p>
                  <p className="font-medium text-[#0F172A]">{test.technician}</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div>
                <p className="text-xs text-[#64748B] mb-2.5">Processing Stage</p>
                <div className="flex items-center">
                  {stages.map((stage, idx) => (
                    <div key={stage} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            idx < test.stage
                              ? "bg-[#10B981] border-[#10B981] text-white"
                              : idx === test.stage
                              ? "bg-[#0EA5E9] border-[#0EA5E9] text-white"
                              : "bg-white border-[#E2E8F0] text-[#94A3B8]"
                          }`}
                        >
                          {idx < test.stage ? <CheckCircle size={14} /> : idx + 1}
                        </div>
                        <p className="text-[10px] text-center mt-1.5 leading-tight" style={{ color: idx <= test.stage ? "#0F172A" : "#94A3B8" }}>
                          {stage}
                        </p>
                      </div>
                      {idx < stages.length - 1 && (
                        <div
                          className="h-0.5 flex-1 mb-4"
                          style={{ background: idx < test.stage ? "#10B981" : "#E2E8F0" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs text-[#64748B] mb-1.5">Processing Notes</p>
                <textarea
                  defaultValue={test.notes}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 h-9 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:bg-[#162d4a]">
                  Update Status
                </button>
                <button className="flex-1 h-9 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] flex items-center justify-center gap-1.5">
                  <CheckCircle size={14} />Mark Complete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
