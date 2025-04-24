"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../lib/api/authApi";
import { useRouter } from "next/navigation";
import { useToast } from "../../lib/context/ToastContext";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectAfterLogin?: string; // Optional prop with default value in function signature
}

export default function LoginForm({
  redirectAfterLogin = "/dashboard",
}: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema, {}, { mode: "async" }),
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const { mutate: loginMutation, isPending: loading } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSuccess(data.message);
      toastSuccess("Login successful!");
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/; max-age=604800;`;
      }
      router.push(redirectAfterLogin);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response.data.error || "An error occurred during login.";
      console.log("eee", errorMessage);
      setError(errorMessage);
      toastError(errorMessage);
    },
  });

  useEffect(() => {
    if (error && (emailValue || passwordValue)) {
      setError(null);
    }
  }, [emailValue, passwordValue, error]);

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    setSuccess(null);
    loginMutation(data);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          maxWidth: 900,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          m: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "block" },
            background: "linear-gradient(45deg, #005bc6 0%, #4d87e0 100%)",
            p: 4,
            color: "white",
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Log in to access your dashboard!
          </Typography>
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ flex: 1, p: 4 }}
        >
          <Typography variant="h4" gutterBottom align="center">
            Log In
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              variant="outlined"
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Log In"}
            </Button>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ mt: 2, textAlign: "center" }}>
                Don’t have an account?{" "}
                <Button
                  href="/auth/signup"
                  color="primary"
                  sx={{ textTransform: "none" }}
                >
                  Sign Up
                </Button>
              </Typography>
              <div>
                <Button
                  href="/auth/forgot-password"
                  color="secondary"
                  sx={{ textTransform: "none" }}
                >
                  Forgot Password?
                </Button>
              </div>
            </Box>
          </>
        </Box>
      </Paper>
    </Box>
  );
}
