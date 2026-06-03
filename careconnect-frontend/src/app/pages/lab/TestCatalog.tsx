import React, { useEffect, useState } from "react";
import { Plus, TestTube, Search, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { labApi, LabTestTypeResponse, ReferenceRangeResponse } from "../../../api/lab.api";

export function LabTestCatalog() {
  const [testTypes, setTestTypes] = useState<LabTestTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [referenceRanges, setReferenceRanges] = useState<Record<number, ReferenceRangeResponse[]>>({});

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

  return (
    <div>
      <PageHeader
        title="Test Catalog"
        subtitle="Manage available lab tests and reference ranges"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a]">
            <Plus size={15} />Add New Test Type
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input placeholder="Search test types..." className="w-full h-9 pl-8 pr-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]" />
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
                {testTypes.map((test, i) => (
                  <React.Fragment key={test.id}>
                    <tr className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#FAFBFC]" : ""}`}>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={() => toggleExpand(test.id)} className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-md hover:bg-[#E2E8F0]">
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
                        <button className="px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[#64748B] text-xs font-medium hover:bg-[#F8FAFC]">
                          Edit
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
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#0EA5E9] text-xs font-medium hover:bg-[#DBEAFE]">
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
                                    <th className="text-left font-medium py-2">Age Range</th>
                                    <th className="text-left font-medium py-2">Normal Range</th>
                                    <th className="text-left font-medium py-2">Unit</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {referenceRanges[test.id].map(range => (
                                    <tr key={range.id} className="border-b border-[#F1F5F9] last:border-0">
                                      <td className="py-2 text-[#0F172A]">{range.component}</td>
                                      <td className="py-2 text-[#64748B]">{range.gender || "All"}</td>
                                      <td className="py-2 text-[#64748B]">All</td>
                                      <td className="py-2 font-medium text-[#10B981]">
                                        {range.minValue} - {range.maxValue}
                                      </td>
                                      <td className="py-2 text-[#64748B]">{range.unit}</td>
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
                {testTypes.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">No test types found in the catalog.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
