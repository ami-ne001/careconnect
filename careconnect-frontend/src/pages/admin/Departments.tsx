import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { adminApi } from '@/api';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { Department, DepartmentCreateRequest, DepartmentUpdateRequest } from '@/types';
import { getApiErrorMessage } from '@/utils/apiError';

type DeptForm = { name: string; description: string };

const emptyDeptForm: DeptForm = { name: '', description: '' };

export function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DeptForm>(emptyDeptForm);
  const [formErrors, setFormErrors] = useState<Partial<DeptForm>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const { data } = await adminApi.getDepartments();
      setDepartments(data);
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Failed to load departments.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const openCreate = () => {
    setDialogMode('create');
    setEditingId(null);
    setForm(emptyDeptForm);
    setFormErrors({});
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (dept: Department) => {
    setDialogMode('edit');
    setEditingId(dept.id);
    setForm({ name: dept.name, description: dept.description ?? '' });
    setFormErrors({});
    setFormError(null);
    setDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const next: Partial<DeptForm> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setFormLoading(true);
    setFormError(null);
    const body: DepartmentCreateRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    };
    try {
      if (dialogMode === 'create') {
        await adminApi.createDepartment(body);
      } else if (editingId != null) {
        await adminApi.updateDepartment(editingId, body as DepartmentUpdateRequest);
      }
      setDialogOpen(false);
      await loadDepartments();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save department.'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteDepartment(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      await loadDepartments();
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Failed to delete department.'));
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <Box className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <Box>
          <Typography variant="h5" className="!font-semibold !text-care-primary !mb-1">
            Departments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize hospital units and assign staff to departments.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New department
        </Button>
      </Box>

      {listError && (
        <Alert severity="error" className="mb-4" onClose={() => setListError(null)}>
          {listError}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={0} className="rounded-xl border border-slate-200">
        {loading ? (
          <Box className="flex justify-center py-12">
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow className="bg-slate-50">
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" className="!py-8 text-slate-500">
                    No departments yet.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow key={dept.id} hover>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.description ?? '—'}</TableCell>
                    <TableCell>{new Date(dept.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(dept)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setDeleteTarget(dept);
                            setDeleteOpen(true);
                          }}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={dialogOpen} onClose={formLoading ? undefined : () => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? 'Create department' : 'Edit department'}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 pt-2">
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              if (formErrors.name) setFormErrors((err) => ({ ...err, name: undefined }));
            }}
            error={Boolean(formErrors.name)}
            helperText={formErrors.name}
            fullWidth
            disabled={formLoading}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            multiline
            minRows={2}
            fullWidth
            disabled={formLoading}
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setDialogOpen(false)} disabled={formLoading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={formLoading}>
            {formLoading ? 'Saving…' : dialogMode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete department"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? Users assigned to this department may need to be updated first.`
            : ''
        }
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteLoading}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
