import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
} from "@mui/material";
import axios from "axios";
import { useToast } from "../../lib/context/ToastContext";

const PaymentCollectionPage = () => {
  const [paymentRequest, setPaymentRequest] = useState({
    amount: "",
    note: "",
  });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [loading, setLoading] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleInputChange = (e: any) => {
    setPaymentRequest({ ...paymentRequest, [e.target.name]: e.target.value });
  };

  const handleGeneratePaymentLink = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/payments/link", paymentRequest, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPaymentLink(response.data.paymentLink);
      toastSuccess("Payment link generated");
    } catch (err) {
      toastError("Failed to generate payment link");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQrCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/payments/qr",
        { amount: paymentRequest.amount },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setQrCodeUrl(response.data.qrCodeUrl);
      toastSuccess("QR code generated");
    } catch (err) {
      toastError("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 8 }}>
      <Grid container sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Collect Payments
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Generate Payment Link
                  </Typography>
                  <TextField
                    label="Amount (INR)"
                    name="amount"
                    type="number"
                    value={paymentRequest.amount}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                  <TextField
                    label="Note"
                    name="note"
                    value={paymentRequest.note}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleGeneratePaymentLink}
                    disabled={loading || !paymentRequest.amount}
                    fullWidth
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#1565c0" },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Generate Payment Link"
                    )}
                  </Button>
                  {paymentLink && (
                    <Box sx={{ mt: 2 }}>
                      <Typography sx={{ color: "#424242" }}>
                        Payment Link:{" "}
                        <a
                          href={paymentLink}
                          target="_blank"
                          style={{ color: "#1976d2" }}
                        >
                          {paymentLink}
                        </a>
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Generate UPI QR Code
                  </Typography>
                  <TextField
                    label="Amount (INR)"
                    name="amount"
                    type="number"
                    value={paymentRequest.amount}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleGenerateQrCode}
                    disabled={loading || !paymentRequest.amount}
                    fullWidth
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#1565c0" },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Generate QR Code"
                    )}
                  </Button>
                  {qrCodeUrl && (
                    <Box sx={{ mt: 2, textAlign: "center" }}>
                      <img
                        src={qrCodeUrl}
                        alt="UPI QR Code"
                        style={{ maxWidth: "200px" }}
                      />
                      <Typography sx={{ mt: 1, color: "#424242" }}>
                        Scan to pay
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentCollectionPage;
