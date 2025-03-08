"use client";

import { useDashboard, usePayFee } from "@/lib/hooks/useAdmin";
import { useSendVerificationEmail, useVerifyStatus } from "@/lib/hooks/useAuth";
import { Button, Typography, Box } from "@mui/material";

const Dashboard = () => {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: statusData, isLoading: statusLoading } = useVerifyStatus();
  const { mutate: sendVerification, isPending: sendingVerification } =
    useSendVerificationEmail();
  const { mutate: payFee, isPending: payingFee } = usePayFee();

  if (dashboardLoading || statusLoading)
    return <Typography>Loading...</Typography>;

  const { verification_needed } = dashboardData || {};
  const { status } = statusData || {};

  const handleSendVerification = () => {
    sendVerification(undefined, {
      onSuccess: () => alert("Verification email sent! Check your inbox."),
      onError: (error) => alert(`Error: ${error.message}`),
    });
  };

  const handlePayFee = () => {
    payFee(undefined, {
      onSuccess: () => alert("Fee paid successfully!"),
      onError: (error) => alert(`Error: ${error.message}`),
    });
  };

  return (
    <Box p={3}>
      <Typography variant="h1">{dashboardData?.message}</Typography>
      {verification_needed && (
        <Box mt={2}>
          <Typography variant="body1">
            Please verify your email to proceed with payment and full access.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendVerification}
            disabled={sendingVerification}
            sx={{ mt: 1 }}
          >
            {sendingVerification ? "Sending..." : "Send Verification Email"}
          </Button>
        </Box>
      )}
      {status?.email_verified && !status.fee_paid && (
        <Box mt={2}>
          <Typography variant="body1">
            Email verified! Please pay the fee.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePayFee}
            disabled={payingFee}
            sx={{ mt: 1 }}
          >
            {payingFee ? "Processing..." : "Pay Fee"}
          </Button>
        </Box>
      )}
      {status?.email_verified &&
        status.fee_paid &&
        !status.approved_by_master && (
          <Typography mt={2} variant="body1">
            Fee paid. Awaiting Master Admin approval.
          </Typography>
        )}
      {status?.email_verified &&
        status.fee_paid &&
        status.approved_by_master && (
          <Typography mt={2} variant="body1">
            Welcome! You have full access to the dashboard.
          </Typography>
        )}
    </Box>
  );
};

export default Dashboard;
