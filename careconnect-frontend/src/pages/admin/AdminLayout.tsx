import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import { logout } from '@/routes/logout';
import { useAuth } from '@/store/useAuth';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: DashboardOutlinedIcon },
  { label: 'Users', path: '/admin/users', icon: PeopleOutlinedIcon },
  { label: 'Departments', path: '/admin/departments', icon: BusinessOutlinedIcon },
  { label: 'Operating Rooms', path: '/admin/operating-rooms', icon: MeetingRoomOutlinedIcon },
] as const;

export function AdminLayout() {
  const navigate = useNavigate();
  const { firstName, lastName } = useAuth();
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Admin';

  return (
    <Box className="flex min-h-screen bg-[#f4f7fb]">
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box className="flex items-center gap-2 px-4 py-5 border-b border-slate-200">
          <LocalHospitalOutlinedIcon className="!text-care-accent" />
          <Box>
            <Typography variant="subtitle1" className="!font-bold !text-care-primary leading-tight">
              CareConnect
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin panel
            </Typography>
          </Box>
        </Box>
        <List className="py-2">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <ListItem key={path} disablePadding className="px-2">
              <NavLink to={path} className="no-underline w-full block">
                {({ isActive }) => (
                  <ListItemButton
                    selected={isActive}
                    className="!rounded-lg"
                    sx={
                      isActive
                        ? {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '& .MuiListItemIcon-root': { color: 'inherit' },
                            '&.Mui-selected': {
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                            },
                          }
                        : undefined
                    }
                  >
                    <ListItemIcon className="!min-w-[40px]">
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14 }} />
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" className="flex flex-1 flex-col min-w-0">
        <AppBar
          position="static"
          elevation={0}
          color="inherit"
          className="!bg-white border-b border-slate-200"
        >
          <Toolbar className="flex justify-between gap-4">
            <Typography variant="h6" className="!font-semibold !text-care-primary">
              Administration
            </Typography>
            <Box className="flex items-center gap-3">
              <Typography variant="body2" color="text.secondary" className="hidden sm:block">
                Signed in as{' '}
                <span className="font-medium text-slate-800">{displayName}</span>
              </Typography>
              <Button
                size="small"
                color="inherit"
                startIcon={<LogoutOutlinedIcon />}
                onClick={() => logout(navigate)}
                className="!normal-case !text-slate-600"
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box className="flex-1 p-6 overflow-auto">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
