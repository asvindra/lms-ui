"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/lib/context/ToastContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  addStudent,
  updateStudent,
  getStudents,
  getConfiguredShifts,
  getAvailableSeats, // Add this import
} from "@/lib/api/adminApi";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";

// Schema for adding/updating a student
const studentSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  mobileNo: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  aadharNo: z.string().regex(/^[0-9]{12}$/, "Aadhar number must be 12 digits"),
  address: z.string().min(1, "Address is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  joiningDate: z.date().refine((date) => !isNaN(date.getTime()), {
    message: "Invalid date",
  }),
  gender: z.enum(["Male", "Female", "Other"]),
  paymentMode: z.enum(["Online", "Offline"]),
  paymentDone: z.boolean().optional(),
  shiftIds: z.array(z.string()).min(1, "Select at least one shift"),
  seatId: z.string().optional(), // Add seatId to schema
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function AddStudent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();
  const [editStudent, setEditStudent] = useState<any | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      paymentMode: "Offline",
      paymentDone: false,
      shiftIds: [],
      joiningDate: null,
      seatId: "",
    },
  });

  const paymentMode = watch("paymentMode");
  const shiftIds = watch("shiftIds");

  // Fetch configured shifts
  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: ["configuredShifts"],
    queryFn: getConfiguredShifts,
  });

  // Fetch available seats
  const { data: seatsData, isLoading: seatsLoading } = useQuery({
    queryKey: ["availableSeats"],
    queryFn: getAvailableSeats,
  });

  // Fetch students (only for edit mode)
  const {
    data: studentsData,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
    enabled: !!searchParams.get("edit"),
  });

  // Check for edit mode
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && studentsData?.students) {
      const studentToEdit = studentsData.students.find(
        (s: any) => s.id === editId
      );
      if (studentToEdit) {
        setEditStudent(studentToEdit);
        setValue("email", studentToEdit.email);
        setValue("name", studentToEdit.name);
        setValue("mobileNo", studentToEdit.mobile_no);
        setValue("aadharNo", studentToEdit.aadhar_no);
        setValue("address", studentToEdit.address);
        setValue("fatherName", studentToEdit.father_name);
        setValue("joiningDate", new Date(studentToEdit.joining_date));
        setValue("gender", studentToEdit.gender);
        setValue("paymentMode", studentToEdit.payment_mode);
        setValue("paymentDone", studentToEdit.payment_done);
        setValue(
          "shiftIds",
          studentToEdit.shifts.map((s: any) => s.shift_id)
        );
        setValue("seatId", studentToEdit.seat_id || ""); // Use seat_id from students table
      }
    }
  }, [searchParams, studentsData, setValue]);

  // Mutations
  const { mutate: addStudentMutation, isPending: adding } = useMutation({
    mutationFn: addStudent,
    onSuccess: () => {
      toastSuccess("Student added successfully!");
      reset();
      refetchStudents();
      router.push("/configure/students/student-list");
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to add student");
    },
  });

  const { mutate: updateStudentMutation, isPending: updating } = useMutation({
    mutationFn: updateStudent,
    onSuccess: () => {
      toastSuccess("Student updated successfully!");
      setEditStudent(null);
      reset();
      refetchStudents();
      router.push("/configure/students/student-list");
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to update student");
    },
  });

  // Handlers
  const onSubmit = (data: StudentFormData) => {
    const payload = {
      ...data,
      joiningDate: format(data.joiningDate, "yyyy-MM-dd"),
      paymentDone: data.paymentMode === "Offline" ? data.paymentDone : false,
      seatId: data.seatId || null, // Include seatId in payload
    };
    if (editStudent) {
      updateStudentMutation({ id: editStudent.id, ...payload });
    } else {
      addStudentMutation(payload);
    }
  };

  const calculateFee = (shiftIds: string[]) => {
    if (!shiftsData?.shifts) return 0;
    const selectedShifts = shiftsData.shifts.filter((shift: any) =>
      shiftIds.includes(shift.id)
    );
    const totalFee = selectedShifts.reduce(
      (sum: number, shift: any) => sum + shift.fees,
      0
    );
    const discount = shiftsData.discounts.find(
      (d: any) => d.min_shifts === shiftIds.length
    );
    return discount
      ? totalFee * (1 - discount.discount_percentage / 100)
      : totalFee;
  };

  const handleShiftChange = (shiftId: string, checked: boolean) => {
    const currentShifts = shiftIds || [];
    const newShifts = checked
      ? [...currentShifts, shiftId]
      : currentShifts.filter((id: string) => id !== shiftId);
    setValue("shiftIds", newShifts, { shouldValidate: true });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", p: 3 }}>
        <Paper
          elevation={6}
          sx={{
            maxWidth: 800,
            width: "100%",
            p: 4,
            mx: "auto",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            {editStudent ? "Update Student" : "Add Student"}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {shiftsLoading ||
          seatsLoading ||
          (searchParams.get("edit") && studentsLoading) ? (
            <CircularProgress />
          ) : searchParams.get("edit") && !editStudent && studentsData ? (
            <Typography>Student not found.</Typography>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label="Email"
                fullWidth
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Name"
                fullWidth
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Mobile Number"
                fullWidth
                {...register("mobileNo")}
                error={!!errors.mobileNo}
                helperText={errors.mobileNo?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Aadhar Number"
                fullWidth
                {...register("aadharNo")}
                error={!!errors.aadharNo}
                helperText={errors.aadharNo?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Address"
                fullWidth
                {...register("address")}
                error={!!errors.address}
                helperText={errors.address?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Father's Name"
                fullWidth
                {...register("fatherName")}
                error={!!errors.fatherName}
                helperText={errors.fatherName?.message}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Controller
                  name="joiningDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Joining Date"
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      slotProps={{
                        textField: {
                          error: !!errors.joiningDate,
                          helperText: errors.joiningDate?.message,
                        },
                      }}
                    />
                  )}
                />
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Gender</InputLabel>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Gender" error={!!errors.gender}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <Typography color="error" variant="caption">
                    {errors.gender.message}
                  </Typography>
                )}
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Mode</InputLabel>
                <Controller
                  name="paymentMode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Payment Mode"
                      error={!!errors.paymentMode}
                    >
                      <MenuItem value="Online">Online</MenuItem>
                      <MenuItem value="Offline">Offline</MenuItem>
                    </Select>
                  )}
                />
                {errors.paymentMode && (
                  <Typography color="error" variant="caption">
                    {errors.paymentMode.message}
                  </Typography>
                )}
              </FormControl>
              {paymentMode === "Offline" && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Controller
                    name="paymentDone"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={adding || updating}
                          />
                        }
                        label="Payment Done"
                      />
                    )}
                  />
                </FormControl>
              )}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Seat</InputLabel>
                <Controller
                  name="seatId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Seat" error={!!errors.seatId}>
                      <MenuItem value="">None</MenuItem>
                      {seatsData?.seats.map((seat: any) => (
                        <MenuItem key={seat.id} value={seat.id}>
                          Seat {seat.seat_number}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.seatId && (
                  <Typography color="error" variant="caption">
                    {errors.seatId.message}
                  </Typography>
                )}
              </FormControl>
              <Typography variant="subtitle1" gutterBottom>
                Select Shifts
              </Typography>
              <FormGroup sx={{ mb: 2 }}>
                {shiftsData?.shifts.map((shift: any) => (
                  <FormControlLabel
                    key={shift.id}
                    control={
                      <Checkbox
                        checked={shiftIds.includes(shift.id)}
                        onChange={(e) =>
                          handleShiftChange(shift.id, e.target.checked)
                        }
                        disabled={adding || updating}
                      />
                    }
                    label={`Shift ${shift.shift_number} (${shift.start_time} - ${shift.end_time}) - $${shift.fees}`}
                  />
                ))}
                {errors.shiftIds && (
                  <Typography color="error" variant="caption">
                    {errors.shiftIds.message}
                  </Typography>
                )}
              </FormGroup>
              <Typography variant="subtitle1" gutterBottom>
                Monthly Fee: ${calculateFee(shiftIds).toFixed(2)}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={adding || updating}
              >
                {adding || updating ? (
                  <CircularProgress size={24} />
                ) : editStudent ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
