"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { Typography, Box, CircularProgress, Button } from '@mui/material';

export default function ConfirmPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid confirmation link');
      setLoading(false);
      return;
    }

    const confirmSignup = async () => {
      try {
        const response = await apiFetch(`/api/auth/confirm?token=${token}`, 'GET');
        setMessage(response.message);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    confirmSignup();
  }, [searchParams]);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Email Confirmation
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {message && (
            <Typography color="success.main" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => router.push('/auth/login')}
          >
            Go to Login
          </Button>
        </>
      )}
    </Box>
  );
}