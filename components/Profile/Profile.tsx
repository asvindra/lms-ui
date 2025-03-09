"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    businessName: "",
    email: "",
    profileImage: "",
    mobileNo: "",
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const mockUser = {
          name: "John Doe",
          businessName: "Doe Enterprises",
          email: "john.doe@example.com",
          profileImage: "https://via.placeholder.com/150",
          mobileNo: "+1-555-123-4567",
        };
        setUser(mockUser);
      } catch (error) {
        console.error("[Profile] Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setUser({ ...user, profileImage: URL.createObjectURL(file) });
    }
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      console.log("[Profile] Updated user:", {
        name: user.name,
        businessName: user.businessName,
        profileImage: imageFile ? "File to upload" : user.profileImage,
        mobileNo: user.mobileNo,
      });
      setImageFile(null);
      setEditMode(false);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1200px",
        mx: "auto",
        py: 2,
      }}
    >
      <Card
        sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: "#1976d2",
              fontWeight: "bold",
              textAlign: "center",
              mb: 3,
            }}
          >
            Your Profile
          </Typography>

          <Grid container spacing={2} alignItems="center">
            {/* Profile Image */}
            <Grid item xs={12} sm={4} sx={{ textAlign: "center" }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={user.profileImage}
                  alt={user.name}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: "2px solid #1976d2",
                  }}
                />
                {editMode && (
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      bgcolor: "#1976d2",
                      color: "#fff",
                      "&:hover": { bgcolor: "#1565c0" },
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <PhotoCameraIcon />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />
                  </IconButton>
                )}
              </Box>
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    disabled={!editMode}
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": { borderColor: "#e0e7ff" },
                        "&:hover fieldset": { borderColor: "#1976d2" },
                        "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                      },
                      "& .MuiInputLabel-root": { color: "#424242" },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Business Name"
                    name="businessName"
                    value={user.businessName}
                    onChange={handleChange}
                    disabled={!editMode}
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": { borderColor: "#e0e7ff" },
                        "&:hover fieldset": { borderColor: "#1976d2" },
                        "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                      },
                      "& .MuiInputLabel-root": { color: "#424242" },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    value={user.email}
                    disabled
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": { borderColor: "#e0e7ff" },
                        "&:hover fieldset": { borderColor: "#1976d2" },
                      },
                      "& .MuiInputBase-input.Mui-disabled": {
                        color: "#424242",
                        WebkitTextFillColor: "#424242",
                      },
                      "& .MuiInputLabel-root": { color: "#424242" },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Mobile Number"
                    name="mobileNo"
                    value={user.mobileNo}
                    onChange={handleChange}
                    disabled={!editMode}
                    variant="outlined"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": { borderColor: "#e0e7ff" },
                        "&:hover fieldset": { borderColor: "#1976d2" },
                        "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                      },
                      "& .MuiInputLabel-root": { color: "#424242" },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Buttons */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                {!editMode ? (
                  <Button
                    variant="contained"
                    onClick={() => setEditMode(true)}
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#1565c0" },
                      textTransform: "none",
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => setEditMode(false)}
                      sx={{
                        color: "#1976d2",
                        borderColor: "#1976d2",
                        "&:hover": {
                          borderColor: "#1565c0",
                          bgcolor: "rgba(25, 118, 210, 0.04)",
                        },
                        textTransform: "none",
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      sx={{
                        bgcolor: "#1976d2",
                        "&:hover": { bgcolor: "#1565c0" },
                        textTransform: "none",
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      Save
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
