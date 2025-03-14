"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/context/ToastContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Fade,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/lib/api/authApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define the schema for forgot password form
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword({
  redirectAfterForgotPassword = "/auth/verify",
}) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate: forgotPasswordMutation, isPending: loading } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data: any) => {
      setSuccess(data.message);
      toastSuccess(data.message);
      router.push(
        `${redirectAfterForgotPassword}?email=${encodeURIComponent(data.email)}`
      );
    },
    onError: (err: any) => {
      const errorMessage =
        err.response.data.message || "Failed to send reset instructions";
      setError(errorMessage);
      toastError(errorMessage);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(null);
    console.log("da", data);

    forgotPasswordMutation(data); // Pass the form data (email)
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        p: 3,
      }}
    >
      <Fade in={true} timeout={500}>
        <Paper
          elevation={6}
          sx={{
            maxWidth: 400,
            width: "100%",
            p: 4,
            borderRadius: 2,
            bgcolor: "white",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Forgot Password
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email to receive OTP
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 2,
                borderRadius: 1,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send OTP"
              )}
            </Button>
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => router.push("/auth/login")}
            disabled={loading}
            sx={{
              py: 1,
              borderRadius: 1,
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            Back to Login
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Check your inbox or spam folder for the reset email.
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}
