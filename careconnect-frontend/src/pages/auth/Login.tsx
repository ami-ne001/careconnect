import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import axios from 'axios';
import { useAuth } from '@/store/useAuth';
import { getHomePathForRole } from '@/routes/roleRoutes';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const role = await login(email.trim(), password);
      navigate(getHomePathForRole(role), { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        setApiError('Cannot reach the server. Start api-gateway (8088) and auth-service (8081).');
      } else if (axios.isAxiosError(error) && error.response?.status === 403) {
        setApiError('Access denied. Clear site data for localhost:5173 and try again.');
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        setApiError('Invalid email or password');
      } else {
        setApiError('Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] to-[#0c4a6e] p-4">
      <Paper elevation={8} className="w-full max-w-md rounded-2xl p-8">
        <Box className="flex flex-col items-center mb-6">
          <LocalHospitalOutlinedIcon className="!text-5xl !text-care-accent mb-2" />
          <Typography variant="h5" className="!font-bold !text-care-primary">
            CareConnect
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Hospital Management System
          </Typography>
        </Box>

        {apiError && (
          <Alert severity="error" className="mb-4" onClose={() => setApiError(null)}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            fullWidth
            autoComplete="email"
            disabled={isLoading}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
            fullWidth
            autoComplete="current-password"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            className="!mt-2 !py-3 !normal-case !font-semibold"
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
          </Button>
        </form>

        <Box className="mt-4 text-center">
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
