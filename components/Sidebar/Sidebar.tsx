"use client";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Sidebar = () => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const fullWidth = 240;
  const collapsedWidth = 80;

  const menuItems = [
    { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { text: "Profile", path: "/profile", icon: <PersonIcon /> },
    {
      text: "Configuration",
      path: "/configure/shifts",
      icon: <SettingsIcon />,
    },
    { text: "Analytics", path: "/analytics", icon: <AnalyticsIcon /> },
  ];

  const handleToggle = () => {
    setCollapsed(!collapsed);
    console.log(
      `[Sidebar] Toggled to ${!collapsed ? "collapsed" : "expanded"}`
    );
  };

  return (
    <Box sx={{ position: "relative", height: "100vh" }}>
      <motion.div
        initial={{ width: collapsed ? collapsedWidth : fullWidth }}
        animate={{ width: collapsed ? collapsedWidth : fullWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          height: "100vh",
          position: "fixed",
          top: "64px",
          left: 0,
          background: "linear-gradient(180deg, #ffffff 0%, #e0e7ff 100%)",
          boxShadow: "3px 0 10px rgba(0, 0, 0, 0.1)",
          zIndex: 1199,
          overflowX: "hidden",
        }}
      >
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              disablePadding
              sx={{
                "&:hover": {
                  backgroundColor: "#1976d2",
                  "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                    color: "#fff",
                  },
                },
              }}
            >
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  py: 1.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
              >
                <ListItemIcon
                  sx={{ color: "#1976d2", minWidth: collapsed ? 0 : 56 }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    sx={{ color: "#424242", ml: 1 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </motion.div>
      <IconButton
        onClick={handleToggle}
        sx={{
          position: "fixed",
          top: "80px", // Below Header, slightly offset
          left: collapsed ? "60px" : "220px", // Adjusts with Sidebar width
          zIndex: 1200, // Above Sidebar, below Header
          color: "#1976d2",
          bgcolor: "#ffffff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            bgcolor: "#f5f5f5",
            color: "#1565c0",
          },
          transition: "left 0.3s ease",
        }}
      >
        {collapsed ? <ArrowForwardIosIcon /> : <ArrowBackIosIcon />}
      </IconButton>
    </Box>
  );
};

export default Sidebar;
