import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid2 as Grid,
  Typography,
} from '@mui/material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { adminApi } from '@/api';
import type { AdminUser, UserRole } from '@/types';
import { ROLE_LABEL } from '@/routes/roleRoutes';
import { getApiErrorMessage } from '@/utils/apiError';

const ROLES: UserRole[] = [
  'ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'PATIENT',
  'LAB_TECHNICIAN',
];

export function Dashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, deptRes] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getDepartments(),
        ]);
        if (!cancelled) {
          setUsers(usersRes.data);
          setDepartmentCount(deptRes.data.length);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to load dashboard data.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const usersByRole = useMemo(() => {
    const counts: Record<UserRole, number> = {
      ADMIN: 0,
      DOCTOR: 0,
      NURSE: 0,
      RECEPTIONIST: 0,
      PATIENT: 0,
      LAB_TECHNICIAN: 0,
    };
    for (const user of users) {
      counts[user.role] = (counts[user.role] ?? 0) + 1;
    }
    return counts;
  }, [users]);

  if (loading) {
    return (
      <Box className="flex justify-center py-16">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" className="!font-semibold !text-care-primary !mb-1">
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-6">
        Overview of users and departments in CareConnect.
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Grid container spacing={3} className="mb-6">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Total users"
            value={users.length}
            icon={<PeopleOutlinedIcon className="!text-4xl opacity-80" />}
            color="from-[#1e3a5f] to-[#2d4a6f]"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Departments"
            value={departmentCount}
            icon={<BusinessOutlinedIcon className="!text-4xl opacity-80" />}
            color="from-[#0c4a6e] to-[#0ea5e9]"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Active users"
            value={users.filter((u) => u.isActive).length}
            icon={<PeopleOutlinedIcon className="!text-4xl opacity-80" />}
            color="from-[#155e75] to-[#0891b2]"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" className="!font-semibold !text-care-primary !mb-3">
        Users by role
      </Typography>
      <Grid container spacing={2}>
        {ROLES.map((role) => (
          <Grid key={role} size={{ xs: 6, sm: 4, md: 2 }}>
            <Card elevation={0} className="rounded-xl border border-slate-200">
              <CardContent className="!py-4 !px-4 text-center">
                <Typography variant="h5" className="!font-bold !text-care-primary">
                  {usersByRole[role]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ROLE_LABEL[role]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card
      elevation={0}
      className={`rounded-xl bg-gradient-to-br ${color} text-white overflow-hidden`}
    >
      <CardContent className="flex items-center justify-between !py-6">
        <Box>
          <Typography variant="body2" className="opacity-90 mb-1">
            {title}
          </Typography>
          <Typography variant="h3" className="!font-bold">
            {value}
          </Typography>
        </Box>
        {icon}
      </CardContent>
    </Card>
  );
}
