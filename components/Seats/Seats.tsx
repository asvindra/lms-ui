"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/context/ToastContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  configureSeats,
  getSeatConfig,
  allocateSeat,
  deallocateSeat,
  deleteSeat,
  getStudents,
} from "@/lib/api/adminApi";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Fade,
  Grid,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schema for seat configuration
const seatConfigSchema = z.object({
  numSeats: z
    .number()
    .min(1, "Number of seats must be at least 1")
    .max(100, "Number of seats cannot exceed 100"),
});

type SeatConfigFormData = z.infer<typeof seatConfigSchema>;

interface Seat {
  id: string;
  seat_number: number;
  reserved_by?: string; // Student ID
  student_shift_numbers: number[]; // Shifts assigned to the student
}

export default function ConfigureSeats() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allocateStudentId, setAllocateStudentId] = useState<string>("");
  const [addSeatsDialogOpen, setAddSeatsDialogOpen] = useState(false); // New state for add seats dialog

  // Fetch seat configuration
  const {
    data: seatData,
    isLoading: seatsLoading,
    error: seatsError,
    refetch,
  } = useQuery({
    queryKey: ["seatConfig"],
    queryFn: getSeatConfig,
  });

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  // Form setup for configuring seats
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SeatConfigFormData>({
    resolver: zodResolver(seatConfigSchema),
    defaultValues: { numSeats: 1 }, // Changed default to 1 for adding seats
  });

  // Mutations
  const { mutate: configureSeatsMutation, isPending: isConfiguring } =
    useMutation({
      mutationFn: configureSeats,
      onSuccess: () => {
        toastSuccess("Seats added successfully!");
        refetch();
        setAddSeatsDialogOpen(false);
        reset();
      },
      onError: (err: any) => {
        toastError(err.response?.data?.error || "Failed to configure seats");
      },
    });

  const { mutate: allocateSeatMutation, isPending: isAllocating } = useMutation(
    {
      mutationFn: ({
        seatId,
        studentId,
      }: {
        seatId: string;
        studentId: string;
      }) => allocateSeat({ seatId, studentId }),
      onSuccess: () => {
        toastSuccess("Seat allocated successfully!");
        refetch();
        setDialogOpen(false);
        setSelectedSeat(null);
        setAllocateStudentId("");
      },
      onError: (err: any) => {
        toastError(err.response?.data?.error || "Failed to allocate seat");
      },
    }
  );

  const { mutate: deallocateSeatMutation, isPending: isDeallocating } =
    useMutation({
      mutationFn: ({ studentId }: { studentId: string }) =>
        deallocateSeat({ studentId }),
      onSuccess: () => {
        toastSuccess("Seat deallocated successfully!");
        refetch();
        setDialogOpen(false);
        setSelectedSeat(null);
      },
      onError: (err: any) => {
        toastError(err.response?.data?.error || "Failed to deallocate seat");
      },
    });

  const { mutate: deleteSeatMutation, isPending: isDeleting } = useMutation({
    mutationFn: ({ seatId }: { seatId: string }) => deleteSeat(seatId),
    onSuccess: () => {
      toastSuccess("Seat deleted successfully!");
      refetch();
      setDialogOpen(false);
      setSelectedSeat(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.error || "Failed to delete seat");
    },
  });

  useEffect(() => {
    if (seatsError) {
      toastError(seatsError.message || "Failed to fetch seat configuration");
    }
  }, [seatsError, toastError]);

  const onConfigureSubmit = (data: SeatConfigFormData) => {
    configureSeatsMutation(data);
  };

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSeat(null);
    setAllocateStudentId("");
  };

  const handleAddSeatsDialogClose = () => {
    setAddSeatsDialogOpen(false);
    reset();
  };

  const handleAllocateSeat = () => {
    if (selectedSeat && allocateStudentId) {
      allocateSeatMutation({
        seatId: selectedSeat.id,
        studentId: allocateStudentId,
      });
    }
  };

  const handleDeallocateSeat = () => {
    if (selectedSeat && selectedSeat.reserved_by) {
      deallocateSeatMutation({ studentId: selectedSeat.reserved_by });
    }
  };

  const handleDeleteSeat = () => {
    if (selectedSeat) {
      deleteSeatMutation({ seatId: selectedSeat.id });
    }
  };

  const isPending =
    isConfiguring || isAllocating || isDeallocating || isDeleting;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "grey.100",
        p: 3,
        background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
      }}
    >
      <Fade in={true} timeout={600}>
        <Paper
          elevation={10}
          sx={{
            maxWidth: 800,
            width: "100%",
            p: 4,
            borderRadius: 3,
            background: "white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              gutterBottom
              sx={{ textAlign: "center" }}
            >
              Seat Configuration
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setAddSeatsDialogOpen(true)}
              disabled={isPending}
            >
              Add Seats
            </Button>
          </Box>
          <Divider sx={{ mb: 3, bgcolor: "grey.300" }} />

          {seatsLoading || studentsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : seatsError ? (
            <Alert severity="error">
              {seatsError.message || "Failed to load seats"}
            </Alert>
          ) : (
            <>
              {/* Seat Management Grid */}
              {seatData && seatData.seats.length > 0 ? (
                <Grid container spacing={2} justifyContent="center">
                  {seatData.seats.map((seat: Seat) => {
                    const student = studentsData?.students.find(
                      (s: any) => s.id === seat.reserved_by
                    );
                    return (
                      <Grid item key={seat.id}>
                        <Tooltip
                          title={
                            seat.reserved_by
                              ? `Reserved by ${
                                  student?.name || seat.reserved_by
                                }, Shifts: ${
                                  seat.student_shift_numbers.join(", ") ||
                                  "None"
                                }`
                              : "Available"
                          }
                          arrow
                          placement="top"
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              cursor: "pointer",
                              p: 1,
                              borderRadius: 2,
                              bgcolor: seat.reserved_by
                                ? "grey.300"
                                : "primary.light",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                bgcolor: seat.reserved_by
                                  ? "grey.400"
                                  : "primary.main",
                                transform: "scale(1.1)",
                              },
                            }}
                            onClick={() => handleSeatClick(seat)}
                          >
                            <EventSeatIcon
                              sx={{
                                fontSize: 40,
                                color: seat.reserved_by ? "grey.700" : "white",
                              }}
                            />
                            <Typography
                              variant="caption"
                              color={seat.reserved_by ? "grey.700" : "white"}
                            >
                              Seat {seat.seat_number}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography>
                  No seats configured yet. Add seats to begin.
                </Typography>
              )}

              {/* Dialog for seat actions */}
              <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>
                  Seat {selectedSeat?.seat_number} Details
                </DialogTitle>
                <DialogContent>
                  {selectedSeat?.reserved_by ? (
                    <Typography>
                      Reserved by{" "}
                      {studentsData?.students.find(
                        (s: any) => s.id === selectedSeat.reserved_by
                      )?.name || selectedSeat.reserved_by}
                      , Shifts:{" "}
                      {selectedSeat.student_shift_numbers.join(", ") || "None"}
                    </Typography>
                  ) : (
                    <>
                      <Typography>This seat is available.</Typography>
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Student</InputLabel>
                        <Select
                          value={allocateStudentId}
                          onChange={(e) => setAllocateStudentId(e.target.value)}
                          label="Student"
                        >
                          <MenuItem value="">Select Student</MenuItem>
                          {studentsData?.students
                            .filter((s: any) => !s.seat_id)
                            .map((student: any) => (
                              <MenuItem key={student.id} value={student.id}>
                                {student.name} ({student.email})
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleCloseDialog}
                    color="secondary"
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  {selectedSeat?.reserved_by ? (
                    <Button
                      onClick={handleDeallocateSeat}
                      color="warning"
                      disabled={isPending}
                      startIcon={<EditIcon />}
                    >
                      {isDeallocating ? (
                        <CircularProgress size={20} />
                      ) : (
                        "Deallocate"
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAllocateSeat}
                      color="primary"
                      disabled={isPending || !allocateStudentId}
                      startIcon={<EditIcon />}
                    >
                      {isAllocating ? (
                        <CircularProgress size={20} />
                      ) : (
                        "Allocate"
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={handleDeleteSeat}
                    color="error"
                    disabled={
                      isPending || (selectedSeat?.reserved_by ? true : false)
                    }
                    startIcon={<DeleteIcon />}
                  >
                    {isDeleting ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Delete Seat"
                    )}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Dialog for adding seats */}
              <Dialog
                open={addSeatsDialogOpen}
                onClose={handleAddSeatsDialogClose}
              >
                <DialogTitle>Add New Seats</DialogTitle>
                <DialogContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Specify the number of additional seats to add (1-100).
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={handleSubmit(onConfigureSubmit)}
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      label="Number of Seats"
                      type="number"
                      fullWidth
                      {...register("numSeats", { valueAsNumber: true })}
                      error={!!errors.numSeats}
                      helperText={errors.numSeats?.message}
                      disabled={isPending}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventSeatIcon color="action" />
                          </InputAdornment>
                        ),
                        inputProps: { min: 1, max: 100 },
                      }}
                      sx={{
                        mb: 3,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          "&:hover fieldset": { borderColor: "primary.main" },
                        },
                      }}
                    />
                    <DialogActions>
                      <Button
                        onClick={handleAddSeatsDialogClose}
                        color="secondary"
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isPending}
                        sx={{ borderRadius: "20px", px: 3 }}
                      >
                        {isConfiguring ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Add Seats"
                        )}
                      </Button>
                    </DialogActions>
                  </Box>
                </DialogContent>
              </Dialog>
            </>
          )}
        </Paper>
      </Fade>
    </Box>
  );
}
