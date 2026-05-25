import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { getHomePathForRole } from '@/routes/roleRoutes';
import { AUTH_STORAGE_KEYS } from '@/store/authStorage';
import { normalizeRole } from '@/utils/jwt';

export function UnauthorizedPage() {
  const role = normalizeRole(localStorage.getItem(AUTH_STORAGE_KEYS.role));
  const homePath = role ? getHomePathForRole(role) : '/login';

  return (
    <Box className="min-h-screen flex items-center justify-center bg-[#f4f7fb] p-4">
      <Paper elevation={0} className="max-w-md w-full rounded-xl border border-slate-200 p-8 text-center">
        <LockOutlinedIcon className="!text-5xl !text-slate-400 mb-4" />
        <Typography variant="h5" className="!font-bold !mb-2">
          Access denied
        </Typography>
        <Typography color="text.secondary" className="mb-6">
          You do not have permission to view this page.
        </Typography>
        <Button component={RouterLink} to={homePath} variant="contained" className="!normal-case">
          Go to my dashboard
        </Button>
      </Paper>
    </Box>
  );
}
