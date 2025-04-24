"use client";

import { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../lib/context/ToastContext";
import { getAdminProfile, updateAdminProfile } from "../../lib/api/adminApi";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    businessName: "",
    email: "",
    profileImage: "",
    mobileNo: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { success: toastSuccess, error: toastError } = useToast(); // Use your ToastContext
  const queryClient = useQueryClient();

  // Fetch profile using useQuery
  const {
    data: adminData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: getAdminProfile,
  });

  // Update profile using useMutation
  const mutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: (updatedAdmin) => {
      // Update the query cache
      queryClient.setQueryData(["adminProfile"], updatedAdmin);
      setImageFile(null);
      setEditMode(false);
      toastSuccess("Profile updated successfully!"); // Show success toast
      refetch(); // Refresh the data
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to update profile"); // Show error toast
    },
  });

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
    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("businessName", user.businessName);
    formData.append("mobileNo", user.mobileNo);
    if (imageFile) {
      formData.append("profilePhoto", imageFile);
    }

    mutation.mutate(formData); // Trigger the mutation
  };

  useEffect(() => {
    if (isError) {
      toastError("Failed to get profile details");
    } else {
      if (adminData) {
        console.log("admin", adminData);
        const { admin } = adminData;
        setUser({
          name: admin.name || "",
          businessName: admin.business_name || "",
          email: admin.email || "",
          profileImage: admin.profile_photo || "",
          mobileNo: admin.mobile_no || "",
        });
      }
    }
  }, [isError, adminData, isLoading]);
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
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
                      disabled={mutation.isPending}
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
                      disabled={mutation.isPending}
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
                      {mutation.isPending ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Save"
                      )}
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
