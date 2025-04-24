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
import { signup } from "../../lib/api/authApi";
import { useRouter } from "next/navigation";
import { useToast } from "../../lib/context/ToastContext";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema, {}, { mode: "async" }),
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const { mutate: signupMutation, isPending: loading } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      setSuccess(
        `${data.message} Please check your email to verify your account.`
      );
      toastSuccess("Signup successful! Please enter OTP to verify your email.");
      // if (typeof window !== "undefined") {
      //   localStorage.setItem("token", data.token);
      //   document.cookie = `token=${data.token}; path=/; max-age=604800;`;
      // }
      router.push(`/auth/verify?email=${encodeURIComponent(emailValue)}`);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.error || "An error occurred during signup.";
      console.log(errorMessage);
      setError(errorMessage);
      toastError(errorMessage);
    },
  });

  useEffect(() => {
    if (error && (emailValue || passwordValue)) {
      setError(null);
    }
  }, [emailValue, passwordValue, error]);

  const onSubmit = (data: SignupFormData) => {
    setError(null);
    setSuccess(null);
    signupMutation(data);
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
        {/* Left Side: Gradient Background */}
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "block" },
            background: "linear-gradient(45deg, #f4a261 0%, #f7c08a 100%)",
            p: 4,
            color: "white",
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            Join Us
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Create your account and get started!
          </Typography>
        </Box>

        {/* Right Side: Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ flex: 1, p: 4 }}
        >
          <Typography variant="h4" gutterBottom align="center">
            Sign Up
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
              {loading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>
            <Typography sx={{ mt: 2, textAlign: "center" }}>
              Already have an account?{" "}
              <Button
                href="/auth/login"
                color="primary"
                sx={{ textTransform: "none" }}
              >
                Log In
              </Button>
            </Typography>
          </>
        </Box>
      </Paper>
    </Box>
  );
}
