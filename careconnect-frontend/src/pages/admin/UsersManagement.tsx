import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { adminApi } from '@/api';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { UserFormDialog } from '@/components/admin/UserFormDialog';
import { ROLE_LABEL } from '@/routes/roleRoutes';
import type {
  AdminUser,
  Department,
  UserCreateRequest,
  UserRole,
  UserUpdateRequest,
} from '@/types';
import { getApiErrorMessage } from '@/utils/apiError';

const ALL_ROLES_FILTER = '' as const;
const ROLE_OPTIONS: UserRole[] = [
  'ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'PATIENT',
  'LAB_TECHNICIAN',
];

export function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | typeof ALL_ROLES_FILTER>(
    ALL_ROLES_FILTER,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const loadUsers = useCallback(async (role?: UserRole) => {
    setLoading(true);
    setListError(null);
    try {
      const { data } = await adminApi.getUsers(role);
      setUsers(data);
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const { data } = await adminApi.getDepartments();
      setDepartments(data);
    } catch {
      /* departments optional for list; form will show empty select */
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    loadUsers(roleFilter || undefined);
  }, [roleFilter, loadUsers]);

  const openCreate = () => {
    setFormMode('create');
    setSelectedUser(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setFormMode('edit');
    setSelectedUser(user);
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (
    body: UserCreateRequest | UserUpdateRequest,
    mode: 'create' | 'edit',
  ) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (mode === 'create') {
        await adminApi.createUser(body as UserCreateRequest);
      } else if (selectedUser) {
        await adminApi.updateUser(selectedUser.id, body as UserUpdateRequest);
      }
      setFormOpen(false);
      await loadUsers(roleFilter || undefined);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save user.'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivateLoading(true);
    try {
      await adminApi.deactivateUser(deactivateTarget.id);
      setDeactivateOpen(false);
      setDeactivateTarget(null);
      await loadUsers(roleFilter || undefined);
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Failed to deactivate user.'));
      setDeactivateOpen(false);
    } finally {
      setDeactivateLoading(false);
    }
  };

  return (
    <Box>
      <Box className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <Box>
          <Typography variant="h5" className="!font-semibold !text-care-primary !mb-1">
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, edit, and deactivate staff accounts.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New user
        </Button>
      </Box>

      <Box className="flex flex-wrap items-center gap-4 mb-4">
        <FormControl size="small" className="min-w-[180px]">
          <InputLabel>Filter by role</InputLabel>
          <Select
            label="Filter by role"
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as UserRole | typeof ALL_ROLES_FILTER)
            }
          >
            <MenuItem value={ALL_ROLES_FILTER}>All roles</MenuItem>
            {ROLE_OPTIONS.map((r) => (
              <MenuItem key={r} value={r}>
                {ROLE_LABEL[r]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="!py-8 text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{ROLE_LABEL[user.role]}</TableCell>
                    <TableCell>{user.departmentName ?? '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={user.isActive ? 'success' : 'default'}
                        variant={user.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(user)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user.isActive && (
                        <Tooltip title="Deactivate">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => {
                              setDeactivateTarget(user);
                              setDeactivateOpen(true);
                            }}
                          >
                            <PersonOffOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <UserFormDialog
        open={formOpen}
        mode={formMode}
        user={selectedUser}
        departments={departments}
        loading={formLoading}
        apiError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deactivateOpen}
        title="Deactivate user"
        message={
          deactivateTarget
            ? `Deactivate ${deactivateTarget.firstName} ${deactivateTarget.lastName}? They will no longer be able to sign in.`
            : ''
        }
        confirmLabel="Deactivate"
        confirmColor="warning"
        loading={deactivateLoading}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
      />
    </Box>
  );
}
