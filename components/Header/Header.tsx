"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useEffect } from "react";

interface HeaderProps {
  profileImage?: string | null;
  role?: string | null;
  isSubscribed: boolean;
}

export default function Header({
  profileImage,
  role,
  isSubscribed,
}: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    console.log("Initiating logout");
    // Clear all localStorage
    localStorage.clear();
    // Explicitly remove specific items
    localStorage.removeItem("token");
    localStorage.removeItem("isSubscribed");
    localStorage.removeItem("profileImage");
    // Clear token cookie
    document.cookie = "token=; path=/; max-age=0";
    // Force full page reload to login
    console.log("Redirecting to /auth/login");
    window.location.href = "/auth/login";
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "linear-gradient(45deg, #1976d2 0%, #42a5f5 100%)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: "bold", letterSpacing: 1 }}
        >
          {role === "student" ? "Student Dashboard" : "Admin Dashboard"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            color="inherit"
            startIcon={
              profileImage ? (
                <Avatar
                  src={profileImage}
                  alt="Profile"
                  sx={{ width: 24, height: 24 }}
                />
              ) : (
                <AccountCircleIcon />
              )
            }
            onClick={() =>
              router.push(role === "student" ? "/student" : "/profile")
            }
            sx={{ textTransform: "none", px: 2 }}
          >
            {role === "student" ? "Home" : "Profile"}
          </Button>
          <Button
            color="inherit"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogout}
            sx={{ textTransform: "none", px: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
