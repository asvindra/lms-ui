import { Typography, Box, Button } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        textAlign: "center",
        p: 3,
      }}
    >
      <Box>
        <Typography
          variant="h1"
          sx={{ fontSize: "6rem", fontWeight: 700, color: "error.main" }}
        >
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          The page you’re looking for doesn’t exist or you don’t have access to
          it.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/"
          sx={{ py: 1.5, px: 4 }}
        >
          Go to Home
        </Button>
      </Box>
    </Box>
  );
}
