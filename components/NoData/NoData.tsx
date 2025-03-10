// components/NoData.tsx
import { Box, Typography } from "@mui/material";

interface NoDataProps {
  message?: string; // Custom message
  variant?: "empty" | "search"; // Choose SVG style
}

export default function NoData({
  message = "No data available",
  variant = "empty",
}: NoDataProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "300px", // Increased for larger SVG
        bgcolor: "grey.100",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        color: "grey.600",
      }}
    >
      {variant === "empty" ? (
        <svg
          width="150"
          height="150"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 150H150V50H50V150Z"
            stroke="#9E9E9E"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <path
            d="M50 50L150 150"
            stroke="#9E9E9E"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M150 50L50 150"
            stroke="#9E9E9E"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect
            x="30"
            y="30"
            width="140"
            height="140"
            fill="none"
            stroke="#B0BEC5"
            strokeWidth="4"
          />
          <circle cx="100" cy="100" r="20" fill="#CFD8DC" />
        </svg>
      ) : (
        <svg
          width="150"
          height="150"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="60" fill="#CFD8DC" />
          <path
            d="M80 80L120 120"
            stroke="#9E9E9E"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M120 80L80 120"
            stroke="#9E9E9E"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M140 60C140 60 150 50 160 60"
            stroke="#B0BEC5"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M60 140C60 140 50 150 40 140"
            stroke="#B0BEC5"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      )}
      <Typography variant="h6" color="inherit" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
}
