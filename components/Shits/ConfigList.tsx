"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/context/ToastContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getConfiguredShifts,
  updateShifts, // Renamed from updateShifts for clarity
  deleteShifts,
  deleteShiftById,
} from "@/lib/api/adminApi";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Table from "../Table/Table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schema for updating a shift and discounts
const updateShiftSchema = (numShifts: number) =>
  z.object({
    shiftNumber: z.number().min(1).max(numShifts),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)"
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)"
      ),
    fees: z.number().min(0, "Fees cannot be negative"),
    discountAllShifts: z.number().min(0).max(100).optional(),
    ...(numShifts >= 2 && {
      discountSingle: z.number().min(0).max(100).optional(),
    }),
    ...(numShifts >= 3 && {
      discountDouble: z.number().min(0).max(100).optional(),
    }),
    ...(numShifts === 4 && {
      discountTriple: z.number().min(0).max(100).optional(),
    }),
  });

type UpdateShiftFormData = z.infer<ReturnType<typeof updateShiftSchema>>;

export default function ShiftsConfigured() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);
  const [editShift, setEditShift] = useState<any | null>(null);

  // Fetch configured shifts
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["configuredShifts"],
    queryFn: getConfiguredShifts,
  });

  // Mutation to delete all shifts
  const { mutate: deleteShiftsMutation, isPending: isDeletingAll } =
    useMutation({
      mutationFn: deleteShifts,
      onSuccess: () => {
        toastSuccess("All shifts deleted successfully!");
        refetch();
        setDeleteDialogOpen(false);
      },
      onError: (err: any) => {
        toastError(err.message || "Failed to delete all shifts");
      },
    });

  // Mutation to delete a single shift
  const { mutate: deleteShiftMutation, isPending: isDeletingSingle } =
    useMutation({
      mutationFn: (shiftNumber: number) => deleteShiftById(shiftNumber),
      onSuccess: () => {
        toastSuccess(`Shift ${shiftToDelete} deleted successfully!`);
        refetch();
        setShiftToDelete(null);
      },
      onError: (err: any) => {
        toastError(err.message || "Failed to delete shift");
        setShiftToDelete(null);
      },
    });

  // Mutation to update a shift
  const { mutate: updateShiftMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateShifts,
    onSuccess: () => {
      toastSuccess("Shift updated successfully!");
      refetch();
      setEditShift(null);
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to update shift");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateShiftFormData>({
    resolver: zodResolver(updateShiftSchema(data?.shifts.length || 1)),
  });

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message || "Failed to fetch configured shifts");
    }
  }, [error]);

  const handleOpenDeleteAllDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setShiftToDelete(null);
  };

  const handleDeleteSingle = (shiftNumber: number) => {
    setShiftToDelete(shiftNumber);
    deleteShiftMutation(shiftNumber);
  };

  const handleEditShift = (shift: any) => {
    setEditShift(shift);
    setValue("shiftNumber", shift.shift_number);
    setValue("startTime", shift.start_time);
    setValue("endTime", shift.end_time);
    setValue("fees", shift.fees);
    data?.discounts.forEach((discount: any) => {
      if (discount.min_shifts === data.shifts.length) {
        setValue("discountAllShifts", discount.discount_percentage);
      } else if (discount.min_shifts === 1) {
        setValue("discountSingle", discount.discount_percentage);
      } else if (discount.min_shifts === 2) {
        setValue("discountDouble", discount.discount_percentage);
      } else if (discount.min_shifts === 3) {
        setValue("discountTriple", discount.discount_percentage);
      }
    });
  };

  const onUpdateSubmit = (formData: UpdateShiftFormData) => {
    updateShiftMutation({
      shiftNumber: formData.shiftNumber,
      startTime: formData.startTime,
      endTime: formData.endTime,
      fees: formData.fees,
      discounts: {
        ...(formData.discountAllShifts !== undefined && {
          discountAllShifts: formData.discountAllShifts,
        }),
        ...(data?.shifts.length >= 2 &&
          formData.discountSingle !== undefined && {
            discountSingle: formData.discountSingle,
          }),
        ...(data?.shifts.length >= 3 &&
          formData.discountDouble !== undefined && {
            discountDouble: formData.discountDouble,
          }),
        ...(data?.shifts.length === 4 &&
          formData.discountTriple !== undefined && {
            discountTriple: formData.discountTriple,
          }),
      },
    });
  };

  const isDeleting = isDeletingAll || isDeletingSingle;

  // Define columns for shifts table
  const shiftColumns = [
    { key: "shift_number" as const, label: "Shift Number" },
    { key: "start_time" as const, label: "Start Time" },
    { key: "end_time" as const, label: "End Time" },
    {
      key: "fees" as const,
      label: "Fees",
      render: (value: number) => `$${value}`,
    },
    {
      key: "actions" as const,
      label: "Actions",
      render: (_: any, row: any) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleEditShift(row)}
            disabled={isDeleting || isUpdating}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteSingle(row.shift_number)}
            disabled={isDeleting || isUpdating}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  // Define columns for discounts table
  const discountColumns = [
    {
      key: "min_shifts" as const,
      label: "Minimum Shifts",
      render: (value: number) =>
        value === data?.shifts.length ? `All (${value})` : value,
    },
    {
      key: "discount_percentage" as const,
      label: "Discount Percentage",
      render: (value: number) => `${value}%`,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "grey.100",
        p: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{ maxWidth: 800, width: "100%", p: 4, borderRadius: 2 }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Configured Shifts
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : errorMessage ? (
          <Alert severity="error">{errorMessage}</Alert>
        ) : (
          <>
            {/* Shifts Table */}
            <Typography variant="h6" gutterBottom>
              Shifts
            </Typography>
            <Table
              data={
                data?.shifts.map((shift: any) => ({
                  ...shift,
                  actions: null, // Placeholder for the render function
                })) || []
              }
              columns={shiftColumns}
              rowsPerPageOptions={[5, 10, 25]}
            />

            {/* Discounts Table */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Discounts
            </Typography>
            <Table
              data={data?.discounts || []}
              columns={discountColumns}
              rowsPerPageOptions={[5, 10, 25]}
            />

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 4,
              }}
            >
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenDeleteAllDialog}
                disabled={isDeleting || isUpdating || !data?.shifts.length}
              >
                {isDeletingAll ? (
                  <CircularProgress size={24} />
                ) : (
                  "Delete All Shifts"
                )}
              </Button>
            </Box>

            {/* Delete All Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
              <DialogTitle>Confirm Delete All Shifts</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to delete all configured shifts? This
                  action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDialog} color="secondary">
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteShiftsMutation()}
                  color="error"
                  disabled={isDeleting}
                >
                  {isDeletingAll ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Delete All"
                  )}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Update Shift Dialog */}
            <Dialog open={!!editShift} onClose={() => setEditShift(null)}>
              <DialogTitle>Update Shift {editShift?.shift_number}</DialogTitle>
              <DialogContent>
                <Box component="form" onSubmit={handleSubmit(onUpdateSubmit)}>
                  <TextField
                    label="Shift Number"
                    type="number"
                    fullWidth
                    {...register("shiftNumber", { valueAsNumber: true })}
                    error={!!errors.shiftNumber}
                    helperText={errors.shiftNumber?.message}
                    sx={{ mb: 2, mt: 2 }}
                    disabled
                  />
                  <TextField
                    label="Start Time (HH:MM, 24-hour)"
                    fullWidth
                    {...register("startTime")}
                    error={!!errors.startTime}
                    helperText={errors.startTime?.message}
                    sx={{ mb: 2 }}
                    disabled={isUpdating}
                  />
                  <TextField
                    label="End Time (HH:MM, 24-hour)"
                    fullWidth
                    {...register("endTime")}
                    error={!!errors.endTime}
                    helperText={errors.endTime?.message}
                    sx={{ mb: 2 }}
                    disabled={isUpdating}
                  />
                  <TextField
                    label="Fees"
                    type="number"
                    fullWidth
                    {...register("fees", { valueAsNumber: true })}
                    error={!!errors.fees}
                    helperText={errors.fees?.message}
                    sx={{ mb: 2 }}
                    disabled={isUpdating}
                  />
                  <Typography variant="subtitle1" gutterBottom>
                    Update Discounts
                  </Typography>
                  <TextField
                    label={`All (${data?.shifts.length}) (%)`}
                    type="number"
                    fullWidth
                    {...register("discountAllShifts", { valueAsNumber: true })}
                    error={!!errors.discountAllShifts}
                    helperText={errors.discountAllShifts?.message}
                    sx={{ mb: 2 }}
                    disabled={isUpdating}
                    inputProps={{ min: 0, max: 100 }}
                  />
                  {data?.shifts.length >= 2 && (
                    <TextField
                      label="Single Selection (%)"
                      type="number"
                      fullWidth
                      {...register("discountSingle", { valueAsNumber: true })}
                      error={!!errors.discountSingle}
                      helperText={errors.discountSingle?.message}
                      sx={{ mb: 2 }}
                      disabled={isUpdating}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  )}
                  {data?.shifts.length >= 3 && (
                    <TextField
                      label="Double Selection (%)"
                      type="number"
                      fullWidth
                      {...register("discountDouble", { valueAsNumber: true })}
                      error={!!errors.discountDouble}
                      helperText={errors.discountDouble?.message}
                      sx={{ mb: 2 }}
                      disabled={isUpdating}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  )}
                  {data?.shifts.length === 4 && (
                    <TextField
                      label="Triple Selection (%)"
                      type="number"
                      fullWidth
                      {...register("discountTriple", { valueAsNumber: true })}
                      error={!!errors.discountTriple}
                      helperText={errors.discountTriple?.message}
                      sx={{ mb: 2 }}
                      disabled={isUpdating}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setEditShift(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit(onUpdateSubmit)}
                  disabled={isUpdating}
                >
                  {isUpdating ? <CircularProgress size={24} /> : "Update"}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Paper>
    </Box>
  );
}
