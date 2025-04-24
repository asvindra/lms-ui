// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Button,
} from "@mui/material";
import { useStudents } from "../lib/context/StudentContext";

interface Student {
  id: string;
  name: string;
  batch: string;
  feesPaid: number;
  totalFees: number; // Added for due calculation
  status: "active" | "left"; // Added for students who left
}

export default function DashboardPage() {
  const { students } = useStudents(); // Assuming shared context
  const [selectedList, setSelectedList] = useState<Student[] | null>(null);
  const [modalTitle, setModalTitle] = useState("");

  // Sample data if context is empty (replace with actual data)
  const defaultStudents: Student[] = students.length
    ? students
    : [
        {
          id: "1",
          name: "John Doe",
          batch: "9:00 AM - 11:00 AM",
          feesPaid: 5000,
          totalFees: 6000,
          status: "active",
        },
        {
          id: "2",
          name: "Jane Smith",
          batch: "2:00 PM - 4:00 PM",
          feesPaid: 3000,
          totalFees: 6000,
          status: "active",
        },
        {
          id: "3",
          name: "Alex Johnson",
          batch: "9:00 AM - 11:00 AM",
          feesPaid: 4500,
          totalFees: 6000,
          status: "left",
        },
        {
          id: "4",
          name: "Emily Davis",
          batch: "2:00 PM - 4:00 PM",
          feesPaid: 2000,
          totalFees: 6000,
          status: "active",
        },
      ];

  const activeStudents = students.filter((s) => s.status === "active");
  const totalStudents = activeStudents.length;
  const totalCollection = activeStudents.reduce(
    (sum, s) => sum + s.feesPaid,
    0
  );
  const totalDue = activeStudents.reduce(
    (sum, s) => sum + (s.totalFees - s.feesPaid),
    0
  );
  const studentsWhoLeft = students.filter((s) => s.status === "left").length;

  const handleCardClick = (list: Student[], title: string) => {
    setSelectedList(list);
    setModalTitle(title);
  };

  const handleCloseModal = () => {
    setSelectedList(null);
    setModalTitle("");
  };

  return (
    <div
    // sx={{
    //   minHeight: "calc(100vh - 64px)",
    //   display: "flex",
    //   flexDirection: "column",
    //   maxWidth: "1200px",
    //   py: 2,
    // }}
    >
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Paper
        elevation={1}
        sx={{
          flexGrow: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Grid container spacing={3}>
          {/* Total Students */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}
              onClick={() => handleCardClick(activeStudents, "Total Students")}
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Total Students
                </Typography>
                <Typography variant="h4">{totalStudents}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Collection Fee */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}
              onClick={() =>
                handleCardClick(activeStudents, "Students with Fees Collected")
              }
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Total Collection
                </Typography>
                <Typography variant="h4">₹{totalCollection}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Due */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}
              onClick={() =>
                handleCardClick(
                  activeStudents.filter((s) => s.totalFees > s.feesPaid),
                  "Students with Fees Due"
                )
              }
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Total Due
                </Typography>
                <Typography variant="h4">₹{totalDue}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Students Who Left */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}
              onClick={() =>
                handleCardClick(
                  defaultStudents.filter((s) => s.status === "left"),
                  "Students Who Left"
                )
              }
            >
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Students Left
                </Typography>
                <Typography variant="h4">{studentsWhoLeft}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Student List Modal */}
      <Modal
        open={!!selectedList}
        onClose={handleCloseModal}
        aria-labelledby="student-list-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 600 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {selectedList && (
            <>
              <Typography id="student-list-modal" variant="h6" gutterBottom>
                {modalTitle}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Batch</TableCell>
                      <TableCell align="right">Fees Paid</TableCell>
                      <TableCell align="right">Fees Due</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedList.length > 0 ? (
                      selectedList.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.batch}</TableCell>
                          <TableCell align="right">
                            ₹{student.feesPaid}
                          </TableCell>
                          <TableCell align="right">
                            ₹{student.totalFees - student.feesPaid}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No students in this category.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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
    </div>
  );
}
