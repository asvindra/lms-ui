// app/students/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Modal,
  Button,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

interface Student {
  id: string;
  name: string;
  batch: string;
  feesPaid: number;
}

export default function Students() {
  // Sample student data (replace with your data source)
  const [students] = useState<Student[]>([
    { id: "1", name: "John Doe", batch: "9:00 AM - 11:00 AM", feesPaid: 5000 },
    { id: "2", name: "Jane Smith", batch: "2:00 PM - 4:00 PM", feesPaid: 3000 },
    {
      id: "3",
      name: "Alex Johnson",
      batch: "9:00 AM - 11:00 AM",
      feesPaid: 4500,
    },
    {
      id: "4",
      name: "Emily Davis",
      batch: "2:00 PM - 4:00 PM",
      feesPaid: 2000,
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [filterBatch, setFilterBatch] = useState<string>("All");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const batches = ["All", ...new Set(students.map((student) => student.batch))];

  const deleteStudent = (id: string) => {
    // Replace with your delete logic
    console.log(`Delete student with id: ${id}`);
  };

  const filteredStudents = students
    .filter((student) =>
      student.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      (student) => filterBatch === "All" || student.batch === filterBatch
    );

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1200px",
        py: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Student List
      </Typography>
      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: 2,
        }}
      >
        {/* Search and Filter Controls */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Search by Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Batch</InputLabel>
            <Select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              label="Filter by Batch"
            >
              {batches.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Student Table */}
        <TableContainer sx={{ flexGrow: 1, maxHeight: "calc(100vh - 250px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell align="right">Fees Paid</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Typography
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={() => handleStudentClick(student)}
                      >
                        {student.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{student.batch}</TableCell>
                    <TableCell align="right">₹{student.feesPaid}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => deleteStudent(student.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Student Details Modal */}
      <Modal
        open={!!selectedStudent}
        onClose={handleCloseModal}
        aria-labelledby="student-details-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {selectedStudent && (
            <>
              <Typography id="student-details-modal" variant="h6" gutterBottom>
                Student Details
              </Typography>
              <Typography>
                <strong>Name:</strong> {selectedStudent.name}
              </Typography>
              <Typography>
                <strong>Batch:</strong> {selectedStudent.batch}
              </Typography>
              <Typography>
                <strong>Fees Paid:</strong> ₹{selectedStudent.feesPaid}
              </Typography>
              <Button
                variant="contained"
                onClick={handleCloseModal}
                sx={{ mt: 2 }}
              >
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
