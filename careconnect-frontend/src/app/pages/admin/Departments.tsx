import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { adminApi } from "@/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";
import type { Department, DepartmentCreateRequest, DepartmentUpdateRequest } from "@/types";

export function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getDepartments();
      setDepartments(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load departments."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const openCreate = () => {
    setFormMode("create");
    setEditingId(null);
    setName("");
    setDescription("");
    setFormOpen(true);
  };

  const openEdit = (dept: Department) => {
    setFormMode("edit");
    setEditingId(dept.id);
    setName(dept.name);
    setDescription(dept.description || "");
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Department name is required.");
      return;
    }

    setFormLoading(true);
    const body: DepartmentCreateRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    try {
      if (formMode === "create") {
        await adminApi.createDepartment(body);
        toast.success("Department created successfully!");
      } else if (editingId != null) {
        await adminApi.updateDepartment(editingId, body as DepartmentUpdateRequest);
        toast.success("Department updated successfully!");
      }
      setFormOpen(false);
      await loadDepartments();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save department."));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteDepartment(deleteTarget.id);
      toast.success(`Department "${deleteTarget.name}" deleted.`);
      setDeleteOpen(false);
      setDeleteTarget(null);
      await loadDepartments();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete department."));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage hospital departments and units"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
          >
            <Plus size={15} />Create Department
          </button>
        }
      />

      {/* Grid List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading departments...</span>
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          No departments set up yet. Click "Create Department" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl p-5 border border-[#E2E8F0] transition-all hover:shadow-md flex flex-col justify-between"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1E3A5F] flex items-center justify-center font-bold text-lg">
                    {dept.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(dept)}
                      className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                      title="Edit Department"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(dept);
                        setDeleteOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg border border-red-100 flex items-center justify-center text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-1">{dept.name}</h3>
                <p className="text-sm text-[#64748B] line-clamp-3 mb-4">{dept.description || "No description provided."}</p>
              </div>
              <div className="text-[11px] text-[#94A3B8] border-t border-[#F1F5F9] pt-3">
                Created: {new Date(dept.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create slide-over */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/35 backdrop-blur-xs" onClick={() => !formLoading && setFormOpen(false)} />
          <div className="w-96 bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">{formMode === "create" ? "Create Department" : "Edit Department"}</h3>
              <button disabled={formLoading} onClick={() => setFormOpen(false)} className="cursor-pointer">
                <Plus size={18} className="text-[#64748B] rotate-45" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Department Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cardiology"
                    className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter department specialty, services, etc..."
                    rows={4}
                    className="w-full p-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#E2E8F0] flex gap-3 bg-gray-50">
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={() => setFormOpen(false)}
                  className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => !deleteLoading && setDeleteOpen(false)} />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <ShieldAlert size={28} />
              <h3 className="text-lg font-bold text-[#0F172A]">Delete Department</h3>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Are you sure you want to delete the department <strong>"{deleteTarget.name}"</strong>?
              This action cannot be undone. Any active staff assigned to this department will no longer be linked to it.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={deleteLoading}
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleteLoading}
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  "Delete Department"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
