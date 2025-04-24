"use client";

import { useRouter, useSearchParams } from "next/navigation";

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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { confirmPassword } from "../../lib/api/authApi";
import { useToast } from "../../lib/context/ToastContext";

// Define the schema for password reset
const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Error shows under confirmPassword field
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ConfirmPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();

  const email = searchParams.get("email") || "user@example.com";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutate: resetPasswordMutation, isPending: loading } = useMutation({
    mutationFn: confirmPassword,
    onSuccess: (data) => {
      toastSuccess("Password reset successfully!");
      router.push("/auth/login"); // Redirect to login after success
    },
    onError: (err: Error) => {
      toastError(err.message || "Failed to reset password!");
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation({ email, password: data.password });
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
            Reset Password
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Set a new password for{" "}
            <Typography component="span" fontWeight="medium" color="primary">
              {email}
            </Typography>
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              variant="outlined"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
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
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              variant="outlined"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
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
                "Reset Password"
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
            Password must be at least 6 characters long.
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}
