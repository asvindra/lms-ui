"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/context/ToastContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getStudents,
  deleteStudent,
  getConfiguredShifts,
} from "@/lib/api/adminApi";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Table from "../Table/Table";

export default function StudentList() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  // Fetch students
  const {
    data: studentsData,
    isLoading: studentsLoading,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
    enabled: true,
  });

  // Fetch configured shifts
  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: ["configuredShifts"],
    queryFn: getConfiguredShifts,
    enabled: true,
  });

  // Delete student mutation
  const { mutate: deleteStudentMutation, isPending: deleting } = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      toastSuccess("Student deleted successfully!");
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      refetchStudents();
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to delete student");
    },
  });

  const handleEdit = (studentId: string) => {
    router.push(`/configure/students/add-student?edit=${studentId}`);
  };

  const handleDelete = (id: string) => {
    setStudentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleAddStudent = () => {
    router.push("/configure/students/add-student");
  };

  // Create a map of shift_id to shift_number
  const shiftMap = new Map(
    shiftsData?.shifts.map((shift: any) => [shift.id, shift.shift_number]) || []
  );

  // Define table columns
  const columns = [
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
    { key: "mobile_no" as const, label: "Mobile No" },
    { key: "aadhar_no" as const, label: "Aadhar No" },
    { key: "address" as const, label: "Address" },
    { key: "father_name" as const, label: "Father's Name" },
    { key: "joining_date" as const, label: "Joining Date" },
    { key: "gender" as const, label: "Gender" },
    { key: "payment_mode" as const, label: "Payment Mode" },
    {
      key: "payment_done" as const,
      label: "Payment Status",
      render: (value: boolean) => (value ? "Paid" : "Pending"),
    },
    {
      key: "shifts" as const,
      label: "Shifts",
      render: (shifts: any[]) =>
        shifts
          .map((shift) => shiftMap.get(shift.shift_id) || shift.shift_id)
          .join(", "),
    },
    {
      key: "shifts" as const,
      label: "Monthly Fee",
      render: (shifts: any[]) =>
        shifts.length > 0 ? `$${shifts[0].monthly_fee}` : "N/A",
    },
    {
      key: "seat" as const,
      label: "Seat Number",
      render: (value: any) =>
        value !== null ? value?.seat_number : "Not Assigned",
    },
    {
      key: "id" as const,
      label: "Actions",
      render: (_: string, row: any) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => handleEdit(row.id)} disabled={deleting}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.id)} disabled={deleting}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", p: 3 }}>
      <Paper
        elevation={6}
        sx={{
          maxWidth: 1200,
          width: "100%",
          p: 4,
          mx: "auto",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="primary">
            Student List
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddStudent}
          >
            Add Student
          </Button>
        </Box>

        {studentsLoading || shiftsLoading ? (
          <CircularProgress sx={{ display: "block", mx: "auto" }} />
        ) : !studentsData?.students || studentsData.students.length === 0 ? (
          <Typography>No students found.</Typography>
        ) : (
          <Table
            data={studentsData.students}
            columns={columns}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete Student</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this student? This action cannot
              be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                studentToDelete && deleteStudentMutation(studentToDelete)
              }
              color="error"
              disabled={deleting}
            >
              {deleting ? <CircularProgress size={24} /> : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
