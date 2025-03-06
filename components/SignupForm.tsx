"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, TextField, Typography, Box, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { apiFetch } from '../lib/api';
import { useRouter } from 'next/navigation';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiFetch('/api/auth/signup', 'POST', data);
      setSuccess(response.message); // "Signup successful. Please check your email to confirm."
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 400, mx: 'auto', p: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      {success ? (
        <Typography color="success.main" sx={{ mt: 2 }}>
          {success}
        </Typography>
      ) : (
        <>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Typography sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Button href="/auth/login" color="primary">
              Log In
            </Button>
          </Typography>
        </>
      )}
    </Box>
  );
}