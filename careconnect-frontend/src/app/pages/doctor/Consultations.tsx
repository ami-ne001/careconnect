import { useState } from "react";
import { X, Plus } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

const queue = [
  { name: "Carlos Rivera", wait: "12 min", reason: "Diabetes Follow-up", age: 58 },
  { name: "Fatima Al-Zahrani", wait: "28 min", reason: "Cardiac Arrhythmia Check", age: 29 },
  { name: "Oliver Bennett", wait: "41 min", reason: "Chronic Back Pain", age: 52 },
];

const symptomOptions = ["Headache", "Fatigue", "Chest Pain", "Shortness of Breath", "Dizziness", "Nausea", "Fever", "Cough", "Back Pain", "Joint Pain"];

export function DoctorConsultations() {
  const [activePatient, setActivePatient] = useState(queue[0]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Fatigue", "Dizziness"]);
  const [bp, setBp] = useState("132/86");
  const [hr, setHr] = useState("74");
  const [temp, setTemp] = useState("36.9");
  const [o2, setO2] = useState("98");
  const [weight, setWeight] = useState("87");
  const [notes, setNotes] = useState("Patient presents with mild fatigue and occasional dizziness. Blood glucose this morning: 11.2 mmol/L. Medication compliance reported as good. Weight stable from last visit.");
  const [diagnosis, setDiagnosis] = useState("E11.9 — Type 2 Diabetes Mellitus without complications");

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  return (
    <div>
      <PageHeader title="Consultations" subtitle="Active consultation workspace" />
      <div className="flex gap-5" style={{ minHeight: 600 }}>
        {/* Patient Queue */}
        <div className="w-72 shrink-0 space-y-3">
          <h3 className="font-semibold text-[#0F172A] text-sm uppercase tracking-wider text-[#64748B]">Patient Queue</h3>
          {queue.map((p, i) => (
            <div
              key={i}
              onClick={() => setActivePatient(p)}
              className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${activePatient.name === p.name ? "border-[#0EA5E9] shadow-md" : "border-[#E2E8F0] hover:border-[#0EA5E9]/50"}`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">
                  {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{p.name}</p>
                  <p className="text-xs text-[#64748B]">Age {p.age}</p>
                </div>
              </div>
              <p className="text-xs text-[#64748B] mb-2">{p.reason}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#F59E0B] font-medium">⏱ Wait: {p.wait}</span>
                {activePatient.name === p.name ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#0EA5E9] text-white font-medium">Active</span>
                ) : (
                  <button className="text-xs px-2 py-0.5 rounded-full bg-[#1E3A5F] text-white font-medium">Start</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Consultation workspace */}
        <div className="flex-1 bg-white rounded-xl border border-[#E2E8F0] flex flex-col overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {/* Patient info bar */}
          <div className="px-5 py-3.5 bg-[#1E3A5F] text-white flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-sm font-bold">CR</div>
              <div>
                <p className="font-semibold text-sm">{activePatient.name}</p>
                <p className="text-white/60 text-xs">DOB: Sep 3, 1966 · Blood: O-</p>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-800 text-xs font-semibold">Penicillin</span>
              <span className="px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 text-xs font-semibold">NSAIDs</span>
            </div>
            <span className="ml-auto text-xs text-white/50">Consultation #{Math.floor(Math.random() * 9000) + 1000}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Vitals */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Vitals Entry</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: "BP (mmHg)", val: bp, set: setBp },
                  { label: "HR (bpm)", val: hr, set: setHr },
                  { label: "Temp (°C)", val: temp, set: setTemp },
                  { label: "O₂ (%)", val: o2, set: setO2 },
                  { label: "Weight (kg)", val: weight, set: setWeight },
                ].map((v) => (
                  <div key={v.label}>
                    <label className="block text-xs text-[#64748B] mb-1">{v.label}</label>
                    <input value={v.val} onChange={(e) => v.set(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Symptoms</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {symptomOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSymptoms.includes(s) ? "bg-[#0EA5E9] text-white" : "bg-[#F0F4F8] text-[#64748B] hover:bg-[#E2E8F0]"}`}
                  >
                    {selectedSymptoms.includes(s) && <span className="mr-1">✓</span>}
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Diagnosis (ICD-10)</h4>
              <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="Search ICD-10 code..." />
            </div>

            {/* Clinical Notes */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Clinical Notes</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="w-full px-3 py-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                placeholder="Enter clinical notes, observations, and plan..."
              />
            </div>
          </div>

          {/* Bottom actions */}
          <div className="px-5 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] hover:bg-[#F0F4F8]">🔬 Request Lab Test</button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] hover:bg-[#F0F4F8]">💊 Write Prescription</button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#EF4444] text-white text-sm font-semibold ml-auto hover:opacity-90">✓ Close Consultation</button>
          </div>
        </div>
      </div>
    </div>
  );
}
