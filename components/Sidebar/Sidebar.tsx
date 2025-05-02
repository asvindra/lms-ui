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
  Collapse,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { PaymentOutlined, PlaceOutlined } from "@mui/icons-material";

interface SidebarProps {
  role: string | null; // "admin" or "student"
  isMaster: boolean;
  isSubscribed: boolean;
}

const Sidebar = ({ role, isMaster, isSubscribed }: SidebarProps) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const fullWidth = 240;
  const collapsedWidth = 80;

  useEffect(() => {}, [isSubscribed]);

  const adminMenuItems = [
    ...(isSubscribed
      ? [
          { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
          {
            text: "Configuration",
            icon: <SettingsIcon />,
            subItems: [
              {
                text: "Shifts",
                path: "/configure/shifts",
                icon: <ScheduleIcon />,
              },
              {
                text: "Configured Shifts",
                path: "/configure/shifts-configured",
                icon: <ScheduleIcon />,
              },
              {
                text: "Seats",
                path: "/configure/seats",
                icon: <EventSeatIcon />,
              },
              {
                text: "Add Student",
                path: "/configure/students/add-student",
                icon: <GroupIcon />,
              },
              {
                text: "Student List",
                path: "/configure/students/student-list",
                icon: <GroupIcon />,
              },
            ],
          },
          { text: "Payments", path: "/payments", icon: <PaymentOutlined /> },
          {
            text: "Past Students",
            path: "/past/students",
            icon: <GroupIcon />,
          },
          { text: "Settings", path: "/settings", icon: <SettingsIcon /> },
        ]
      : []),
    { text: "Profile", path: "/profile", icon: <PersonIcon /> },
    { text: "Plans", path: "/plans", icon: <PlaceOutlined /> },
    ...(isMaster && isSubscribed
      ? [
          {
            text: "Configure Plans",
            path: "/master/plans",
            icon: <PlaceOutlined />,
          },
        ]
      : []),
    {
      text: "Subscription",
      path: "/dashboard/subscription",
      icon: <SettingsIcon />,
    },
  ];

  const studentMenuItems = [
    { text: "Home", path: "/student", icon: <DashboardIcon /> },
    { text: "Profile", path: "/student/profile", icon: <PersonIcon /> },
    { text: "Requests", path: "/student/requests", icon: <SettingsIcon /> },
  ];

  const menuItems = role === "student" ? studentMenuItems : adminMenuItems;

  const handleToggle = () => {
    setCollapsed(!collapsed);
    console.log(
      `[Sidebar] Toggled to ${!collapsed ? "collapsed" : "expanded"}`
    );
  };

  const handleConfigToggle = () => {
    if (!collapsed) {
      setConfigOpen(!configOpen);
    }
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
          {menuItems.map((item: any) => (
            <Box key={item.text}>
              <ListItem
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
                  onClick={() =>
                    item.subItems
                      ? handleConfigToggle()
                      : router.push(item.path!)
                  }
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
                  {!collapsed &&
                    item.subItems &&
                    (configOpen ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>
              {item.subItems && (
                <Collapse
                  in={configOpen && !collapsed}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem: any) => (
                      <ListItem
                        key={subItem.text}
                        disablePadding
                        sx={{
                          pl: 4,
                          "&:hover": {
                            backgroundColor: "#1976d2",
                            "& .MuiListItemIcon-root, & .MuiListItemText-primary":
                              {
                                color: "#fff",
                              },
                          },
                        }}
                      >
                        <ListItemButton
                          onClick={() => router.push(subItem.path)}
                          sx={{
                            py: 1,
                            justifyContent: "flex-start",
                          }}
                        >
                          <ListItemIcon sx={{ color: "#1976d2", minWidth: 56 }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.text}
                            sx={{ color: "#424242" }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
        <Divider />
      </motion.div>
      <IconButton
        onClick={handleToggle}
        sx={{
          position: "fixed",
          top: "80px",
          left: collapsed ? "60px" : "220px",
          zIndex: 1200,
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
