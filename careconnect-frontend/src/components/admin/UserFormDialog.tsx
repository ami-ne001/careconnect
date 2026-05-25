import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { AdminUser, Department, Gender, UserCreateRequest, UserRole, UserUpdateRequest } from '@/types';
import { ROLE_LABEL } from '@/routes/roleRoutes';

const ROLES: UserRole[] = [
  'ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'PATIENT',
  'LAB_TECHNICIAN',
];

export type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole | '';
  departmentId: string;
  phone: string;
  gender: Gender | '';
  dateOfBirth: string;
  address: string;
};

const emptyForm: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: '',
  departmentId: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  address: '',
};

function userToForm(user: AdminUser): UserFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    role: user.role,
    departmentId: user.departmentId != null ? String(user.departmentId) : '',
    phone: user.phone ?? '',
    gender: user.gender ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    address: user.address ?? '',
  };
}

interface UserFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  user?: AdminUser | null;
  departments: Department[];
  loading?: boolean;
  apiError?: string | null;
  onClose: () => void;
  onSubmit: (values: UserCreateRequest | UserUpdateRequest, mode: 'create' | 'edit') => void;
}

export function UserFormDialog({
  open,
  mode,
  user,
  departments,
  loading = false,
  apiError,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const [form, setForm] = useState<UserFormValues>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(mode === 'edit' && user ? userToForm(user) : emptyForm);
  }, [open, mode, user]);

  const set = (field: keyof UserFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof UserFormValues, string>> = {};
    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!form.role) next.role = 'Required';
    if (mode === 'create') {
      if (!form.email.trim()) next.email = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Invalid email';
      if (!form.password) next.password = 'Required';
      else if (form.password.length < 6) next.password = 'At least 6 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !form.role) return;

    const departmentId = form.departmentId ? Number(form.departmentId) : null;

    if (mode === 'create') {
      const body: UserCreateRequest = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        departmentId,
        phone: form.phone.trim() || undefined,
        gender: form.gender || null,
        dateOfBirth: form.dateOfBirth || null,
        address: form.address.trim() || undefined,
      };
      onSubmit(body, 'create');
    } else {
      const body: UserUpdateRequest = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: form.role,
        departmentId,
        phone: form.phone.trim() || undefined,
        gender: form.gender || null,
        dateOfBirth: form.dateOfBirth || null,
        address: form.address.trim() || undefined,
      };
      onSubmit(body, 'edit');
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Create user' : 'Edit user'}</DialogTitle>
      <DialogContent className="flex flex-col gap-3 pt-2">
        {apiError && <Alert severity="error">{apiError}</Alert>}
        <TextField
          label="First name"
          value={form.firstName}
          onChange={(e) => set('firstName', e.target.value)}
          error={Boolean(errors.firstName)}
          helperText={errors.firstName}
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Last name"
          value={form.lastName}
          onChange={(e) => set('lastName', e.target.value)}
          error={Boolean(errors.lastName)}
          helperText={errors.lastName}
          fullWidth
          disabled={loading}
        />
        {mode === 'create' && (
          <>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password}
              fullWidth
              disabled={loading}
            />
          </>
        )}
        <FormControl fullWidth error={Boolean(errors.role)} disabled={loading}>
          <InputLabel>Role</InputLabel>
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                {ROLE_LABEL[r]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth disabled={loading}>
          <InputLabel>Department</InputLabel>
          <Select
            label="Department"
            value={form.departmentId}
            onChange={(e) => set('departmentId', e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={String(d.id)}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Phone"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          fullWidth
          disabled={loading}
        />
        <FormControl fullWidth disabled={loading}>
          <InputLabel>Gender</InputLabel>
          <Select label="Gender" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
            <MenuItem value="">Not specified</MenuItem>
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Date of birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => set('dateOfBirth', e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Address"
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          multiline
          minRows={2}
          fullWidth
          disabled={loading}
        />
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
