"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/context/ToastContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getConfiguredShifts,
  updateShifts,
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Table from "../Table/Table";

export default function ShiftsConfigured() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);

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

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message || "Failed to fetch configured shifts");
    }
  }, [error]);

  const handleUpdate = () => {
    router.push("/admin/configure-shifts");
  };

  const handleDeleteAll = () => {
    deleteShiftsMutation();
  };

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
        <IconButton
          color="error"
          onClick={() => handleDeleteSingle(row.shift_number)}
          disabled={isDeleting}
        >
          <DeleteIcon />
        </IconButton>
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
              {/* <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
                disabled={isDeleting}
              >
                Update Shifts
              </Button> */}
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenDeleteAllDialog}
                disabled={isDeleting || !data?.shifts.length}
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
                  onClick={handleDeleteAll}
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
          </>
        )}
      </Paper>
    </Box>
  );
}
