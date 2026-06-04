import React, { useEffect, useState, useMemo } from "react";
import { Plus, TestTube, Search, ChevronDown, ChevronUp, X, Edit2 } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, LabTestTypeResponse, ReferenceRangeResponse } from "../../../api/lab.api";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../utils/apiError";

export function LabTestCatalog() {
  const [testTypes, setTestTypes] = useState<LabTestTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [referenceRanges, setReferenceRanges] = useState<Record<number, ReferenceRangeResponse[]>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showTestModal, setShowTestModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState<{ isOpen: boolean; testId: number | null }>({ isOpen: false, testId: null });

  // Forms
  const [testForm, setTestForm] = useState({ id: 0, name: "", category: "", sampleType: "", description: "" });
  const [rangeForm, setRangeForm] = useState({ component: "", unit: "", minValue: "", maxValue: "", gender: "All", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTestTypes();
  }, []);

  const loadTestTypes = async () => {
    try {
      setLoading(true);
      const res = await labApi.getAllTestTypes();
      setTestTypes(res.data);
    } catch (error) {
      console.error("Failed to load test types", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!referenceRanges[id]) {
        try {
          const res = await labApi.getReferenceRanges(id);
          setReferenceRanges(prev => ({ ...prev, [id]: res.data }));
        } catch (error) {
          console.error(`Failed to load reference ranges for ${id}`, error);
        }
      }
    }
  };

  const handleOpenTestModal = (test?: LabTestTypeResponse) => {
    if (test) {
      setTestForm({
        id: test.id,
        name: test.name,
        category: test.category || "",
        sampleType: test.sampleType || "",
        description: test.description || ""
      });
    } else {
      setTestForm({ id: 0, name: "", category: "", sampleType: "", description: "" });
    }
    setShowTestModal(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (testForm.id === 0) {
        await labApi.createTestType({
          name: testForm.name,
          category: testForm.category,
          sampleType: testForm.sampleType,
          description: testForm.description
        });
        toast.success("Test type added successfully");
      } else {
        await labApi.updateTestType(testForm.id, {
          name: testForm.name,
          category: testForm.category,
          sampleType: testForm.sampleType,
          description: testForm.description
        });
        toast.success("Test type updated successfully");
      }
      setShowTestModal(false);
      loadTestTypes();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save test type"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRangeModal = (testId: number) => {
    setRangeForm({ component: "", unit: "", minValue: "", maxValue: "", gender: "All", notes: "" });
    setShowRangeModal({ isOpen: true, testId });
  };

  const handleSaveRange = async (e: React.FormEvent) => {
    e.preventDefault();
    const testId = showRangeModal.testId;
    if (!testId) return;
    
    setSubmitting(true);
    try {
      await labApi.addReferenceRange(testId, {
        testTypeId: testId,
        component: rangeForm.component,
        unit: rangeForm.unit,
        minValue: Number(rangeForm.minValue),
        maxValue: Number(rangeForm.maxValue),
        gender: rangeForm.gender === "All" ? undefined : rangeForm.gender,
        notes: rangeForm.notes
      });
      toast.success("Reference range added successfully");
      setShowRangeModal({ isOpen: false, testId: null });
      // Reload reference ranges for this test
      const res = await labApi.getReferenceRanges(testId);
      setReferenceRanges(prev => ({ ...prev, [testId]: res.data }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add reference range"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTests = useMemo(() => {
    if (!searchQuery) return testTypes;
    const lowerQuery = searchQuery.toLowerCase();
    return testTypes.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) || 
      (t.category && t.category.toLowerCase().includes(lowerQuery)) ||
      (t.sampleType && t.sampleType.toLowerCase().includes(lowerQuery))
    );
  }, [testTypes, searchQuery]);

  return (
    <div>
      <PageHeader
        title="Test Catalog"
        subtitle="Manage available lab tests and reference ranges"
        actions={
          <button onClick={() => handleOpenTestModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a]">
            <Plus size={15} />Add New Test Type
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input 
              placeholder="Search test types..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]" 
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#64748B]">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="w-10"></th>
                  {["Test Name", "Category", "Sample Type", "Description", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test, i) => (
                  <React.Fragment key={test.id}>
                    <tr className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={() => toggleExpand(test.id)} className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-md hover:bg-[#E2E8F0] cursor-pointer">
                          {expandedId === test.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#0F172A] flex items-center gap-2">
                        <TestTube size={14} className="text-[#0EA5E9]" />
                        {test.name}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="inactive">{test.category || "Uncategorized"}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-[#64748B]">{test.sampleType || "N/A"}</td>
                      <td className="px-4 py-3.5 text-[#64748B] max-w-[250px] truncate">{test.description || "N/A"}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => handleOpenTestModal(test)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[#64748B] text-xs font-medium hover:bg-[#F8FAFC] cursor-pointer">
                          <Edit2 size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Reference Ranges Section */}
                    {expandedId === test.id && (
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <td colSpan={6} className="px-10 py-5">
                          <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-[#0F172A] text-sm flex items-center gap-2">
                                Reference Ranges
                                <Badge variant="inactive">{referenceRanges[test.id]?.length || 0}</Badge>
                              </h4>
                              <button onClick={() => handleOpenRangeModal(test.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#0EA5E9] text-xs font-medium hover:bg-[#DBEAFE] cursor-pointer">
                                <Plus size={13} />Add Range
                              </button>
                            </div>
                            
                            {(!referenceRanges[test.id] || referenceRanges[test.id].length === 0) ? (
                              <p className="text-xs text-[#64748B] italic">No reference ranges configured for this test.</p>
                            ) : (
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-[#64748B] border-b border-[#F1F5F9]">
                                    <th className="text-left font-medium py-2">Component</th>
                                    <th className="text-left font-medium py-2">Gender</th>
                                    <th className="text-left font-medium py-2">Normal Range</th>
                                    <th className="text-left font-medium py-2">Unit</th>
                                    <th className="text-left font-medium py-2">Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {referenceRanges[test.id].map(range => (
                                    <tr key={range.id} className="border-b border-[#F1F5F9] last:border-0">
                                      <td className="py-2 text-[#0F172A]">{range.component}</td>
                                      <td className="py-2 text-[#64748B]">{range.gender || "All"}</td>
                                      <td className="py-2 font-medium text-[#10B981]">
                                        {range.minValue} - {range.maxValue}
                                      </td>
                                      <td className="py-2 text-[#64748B]">{range.unit}</td>
                                      <td className="py-2 text-[#64748B] max-w-[150px] truncate">{range.notes || "-"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredTests.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">
                      {searchQuery ? "No matching tests found." : "No test types found in the catalog."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Test Type Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">{testForm.id === 0 ? "Add New Test Type" : "Edit Test Type"}</h3>
              <button onClick={() => setShowTestModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleSaveTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Test Name <span className="text-red-500">*</span></label>
                <input required value={testForm.name} onChange={e => setTestForm({...testForm, name: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Category</label>
                  <input value={testForm.category} onChange={e => setTestForm({...testForm, category: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="e.g. Hematology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Sample Type</label>
                  <input value={testForm.sampleType} onChange={e => setTestForm({...testForm, sampleType: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="e.g. Blood" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
                <textarea rows={3} value={testForm.description} onChange={e => setTestForm({...testForm, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTestModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reference Range Modal */}
      {showRangeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">Add Reference Range</h3>
              <button onClick={() => setShowRangeModal({ isOpen: false, testId: null })}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleSaveRange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Component <span className="text-red-500">*</span></label>
                <input required value={rangeForm.component} onChange={e => setRangeForm({...rangeForm, component: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="e.g. Hemoglobin" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Min Value <span className="text-red-500">*</span></label>
                  <input required type="number" step="any" value={rangeForm.minValue} onChange={e => setRangeForm({...rangeForm, minValue: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Max Value <span className="text-red-500">*</span></label>
                  <input required type="number" step="any" value={rangeForm.maxValue} onChange={e => setRangeForm({...rangeForm, maxValue: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Unit <span className="text-red-500">*</span></label>
                  <input required value={rangeForm.unit} onChange={e => setRangeForm({...rangeForm, unit: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="e.g. g/dL" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Gender</label>
                  <select value={rangeForm.gender} onChange={e => setRangeForm({...rangeForm, gender: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                    <option value="All">All</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Notes</label>
                <input value={rangeForm.notes} onChange={e => setRangeForm({...rangeForm, notes: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="Optional notes" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRangeModal({ isOpen: false, testId: null })} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
