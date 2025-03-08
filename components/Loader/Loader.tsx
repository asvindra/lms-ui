"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loader() {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.7)", // Light overlay, not fully blocking
        zIndex: 1000, // Below Sidebar (1199) and Header (1201), but above content
      }}
    >
      <CircularProgress
        size={50}
        thickness={5}
        sx={{ color: "#1976d2" }} // Matches your theme
      />
      <Typography
        variant="body1"
        sx={{ mt: 2, color: "#1976d2", fontWeight: "medium" }}
      >
        Loading...
      </Typography>
    </Box>
  );
}
