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
  CircularProgress,
  MenuItem,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/lib/context/ToastContext";
import { getStudentProfile, updateStudentProfile } from "@/lib/api/studentApi";

export default function StudentProfilePage() {
  const [user, setUser] = useState({
    name: "",
    mobileNo: "",
    address: "",
    fatherName: "",
    gender: "",
    email: "",
    profileImage: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { success: toastSuccess, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const {
    data: studentData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfile,
  });

  const mutation = useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: (updatedStudent) => {
      queryClient.setQueryData(["studentProfile"], updatedStudent);
      setImageFile(null);
      setEditMode(false);
      toastSuccess("Profile updated successfully!");
      refetch();
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to update profile");
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
    formData.append("mobileNo", user.mobileNo);
    formData.append("address", user.address);
    formData.append("fatherName", user.fatherName);
    formData.append("email", user.email);
    formData.append("gender", user.gender);
    if (imageFile) {
      formData.append("profilePhoto", imageFile);
    }

    console.log("fomr", formData);

    mutation.mutate(formData);
  };

  useEffect(() => {
    if (isError) {
      console.error("Query error:", error);
      toastError(error?.message || "Failed to fetch student data");
    } else if (studentData?.student) {
      const { student } = studentData;
      setUser({
        name: student.name || "",
        mobileNo: student.mobile_no || "",
        address: student.address || "",
        fatherName: student.father_name || "",
        gender: student.gender || "",
        email: student.email || "",
        profileImage: student.profile_photo || "",
      });
    }
  }, [isError, error, studentData, toastError]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">
          Failed to load profile: {error?.message || "Unknown error"}
        </Typography>
        <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!studentData?.student) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">No profile data available</Typography>
        <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2 }}>
          Retry
        </Button>
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
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="address"
                    value={user.address}
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
                    label="Father's Name"
                    name="fatherName"
                    value={user.fatherName}
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
                    select
                    label="Gender"
                    name="gender"
                    value={user.gender}
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
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
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
