"use client";

import { useEffect, useState } from "react";
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
import { useToast } from "../../lib/context/ToastContext";
import { resendOtp, verifyOtp } from "../../lib/api/authApi";

// Define the schema for OTP verification
const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must be numeric")
    .transform((val) => parseInt(val, 10)), // Optional: Transform to number
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = searchParams.get("email") || "user@example.com";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  const { mutate: verifyMutation, isPending: verifyLoading } = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data: any) => {
      toastSuccess("OTP verified successfully!");
      if (data?.user?.role === "admin") {
        router.push("/dashboard"); // Redirect to admin dashboard if user is admin
      } else {
        router.push(
          `/auth/confirm-password?email=${encodeURIComponent(data.email)}`
        );
      }
    },
    onError: (err: any) => {
      toastError(err.response.data.error || "Verification failed!");
    },
  });

  const { mutate: resendMutation, isPending: resendLoading } = useMutation({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      toastSuccess("OTP resent successfully!");
      setResendCooldown(30);
    },
    onError: (err: any) => {
      toastError(err.response.data.error || "Failed to resend OTP!");
    },
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onVerifySubmit = (data: VerifyOtpFormData) => {
    verifyMutation({ email, otp: data.otp });
  };

  const onResendSubmit = () => {
    resendMutation({ email });
  };

  const loading = verifyLoading || resendLoading;

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
            Verify OTP
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Enter the 6-digit OTP sent to{" "}
            <Typography component="span" fontWeight="medium" color="primary">
              {email}
            </Typography>
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" onSubmit={handleSubmit(onVerifySubmit)}>
            <TextField
              label="Enter OTP"
              fullWidth
              type="number"
              variant="outlined"
              {...register("otp")}
              error={!!errors.otp}
              helperText={errors.otp?.message}
              inputProps={{ maxLength: 6 }}
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
              {verifyLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Verify OTP"
              )}
            </Button>
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={onResendSubmit}
            disabled={loading || resendCooldown > 0}
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
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            {resendLoading && (
              <CircularProgress size={24} color="inherit" sx={{ ml: 1 }} />
            )}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Didn’t receive an OTP? Check your spam folder or resend.
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}
