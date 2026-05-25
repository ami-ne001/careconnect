import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import axios from 'axios';
import { authApi } from '@/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const trimmed = email.trim();

    if (!trimmed) {
      setEmailError('Email is required');
      return false;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError('Enter a valid email address');
      return false;
    }

    setEmailError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    const trimmedEmail = email.trim();
    setIsLoading(true);

    try {
      await authApi.forgotPassword(trimmedEmail);
      setSubmittedEmail(trimmedEmail);
      setStep(2);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setApiError('No account found with this email address.');
      } else if (axios.isAxiosError(error) && !error.response) {
        setApiError('Cannot reach the server. Start api-gateway (8088) and auth-service (8081).');
      } else {
        setApiError('Unable to send reset link. Please try again later.');
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

        {step === 1 ? (
          <>
            <Typography variant="h6" className="!font-semibold !text-care-primary !mb-1">
              Forgot password
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-4">
              Enter your email and we will send you a link to reset your password.
            </Typography>

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
                  if (emailError) {
                    setEmailError(undefined);
                  }
                }}
                error={Boolean(emailError)}
                helperText={emailError}
                fullWidth
                autoComplete="email"
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                className="!mt-2 !py-3 !normal-case !font-semibold"
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send reset link'}
              </Button>
            </form>
          </>
        ) : (
          <Box className="flex flex-col items-center text-center py-2">
            <MarkEmailReadOutlinedIcon className="!text-5xl !text-care-accent mb-3" />
            <Typography variant="h6" className="!font-semibold !text-care-primary !mb-2">
              Check your email
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-1">
              We sent a password reset link to
            </Typography>
            <Typography variant="body2" className="!font-medium !mb-4">
              {submittedEmail}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Follow the link in the email to choose a new password. If you do not see it, check
              your spam folder.
            </Typography>
          </Box>
        )}

        <Box className="mt-6 text-center">
          <Link component={RouterLink} to="/login" variant="body2">
            Back to login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
