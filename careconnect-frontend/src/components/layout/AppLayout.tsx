import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { logout } from '@/routes/logout';
import { ROLE_LABEL } from '@/routes/roleRoutes';
import { useAuth } from '@/store/useAuth';

export function AppLayout() {
  const navigate = useNavigate();
  const { firstName, lastName, role } = useAuth();

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <Box className="min-h-screen bg-[#f4f7fb]">
      <AppBar position="static" elevation={0} className="!bg-care-primary">
        <Toolbar className="flex justify-between gap-4">
          <Typography variant="h6" component="div" className="font-semibold tracking-tight">
            CareConnect
          </Typography>
          {role && (
            <Box className="flex items-center gap-3">
              <Typography variant="body2" className="hidden sm:block opacity-90">
                {firstName} {lastName} · {ROLE_LABEL[role]}
              </Typography>
              <Button
                color="inherit"
                size="small"
                startIcon={<LogoutOutlinedIcon />}
                onClick={handleLogout}
                className="!normal-case"
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" className="py-8">
        <Outlet />
      </Container>
    </Box>
  );
}
