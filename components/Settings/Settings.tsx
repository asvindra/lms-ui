// app/settings/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Grid,
} from "@mui/material";
import { Add, Delete, Edit, EventSeat } from "@mui/icons-material";
import { useStudents } from "@/lib/context/StudentContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsPage() {
  const { students, addStudent, deleteStudent } = useStudents();
  const [tabValue, setTabValue] = useState(0); // Fixed: Complete declaration

  // State for batch timing
  const [batchTiming, setBatchTiming] = useState<string[]>([
    "9:00 AM - 11:00 AM",
  ]);
  const [newTiming, setNewTiming] = useState("");
  const [editTimingIndex, setEditTimingIndex] = useState<number | null>(null);

  // State for seats
  const [seatsInput, setSeatsInput] = useState<number>(30);
  const [seats, setSeats] = useState<number>(30);
  const [occupiedSeats, setOccupiedSeats] = useState<number>(0);

  // State for students
  const [newStudent, setNewStudent] = useState("");

  // State for fee structure
  const [feeStructure, setFeeStructure] = useState<
    { category: string; amount: number }[]
  >([{ category: "Tuition", amount: 5000 }]);
  const [newFeeCategory, setNewFeeCategory] = useState("");
  const [newFeeAmount, setNewFeeAmount] = useState("");
  const [editFeeIndex, setEditFeeIndex] = useState<number | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Batch Timing Handlers
  const addOrUpdateBatchTiming = () => {
    if (newTiming) {
      if (editTimingIndex !== null) {
        const updatedTiming = [...batchTiming];
        updatedTiming[editTimingIndex] = newTiming;
        setBatchTiming(updatedTiming);
        setEditTimingIndex(null);
      } else {
        setBatchTiming([...batchTiming, newTiming]);
      }
      setNewTiming("");
    }
  };

  const editBatchTiming = (index: number) => {
    setNewTiming(batchTiming[index]);
    setEditTimingIndex(index);
  };

  const deleteBatchTiming = (index: number) => {
    setBatchTiming(batchTiming.filter((_, i) => i !== index));
  };

  // Seats Handlers
  const configureSeats = () => {
    if (seatsInput >= students.length) {
      setSeats(seatsInput);
      setOccupiedSeats(students.length);
    } else {
      alert("Total seats cannot be less than the number of students!");
    }
  };

  // Students Handlers
  const handleAddStudent = () => {
    if (newStudent && students.length < seats) {
      addStudent({
        name: newStudent,
        batch: batchTiming[0] || "Default Batch",
        feesPaid: 0,
        totalFees:
          feeStructure.reduce((sum, fee) => sum + fee.amount, 0) || 6000,
        status: "active",
      });
      setOccupiedSeats(students.length + 1);
      setNewStudent("");
    } else if (students.length >= seats) {
      alert("No available seats! Increase total seats in the Seats tab.");
    }
  };

  const handleDeleteStudent = (id: string) => {
    deleteStudent(id);
    setOccupiedSeats(students.length - 1);
  };

  // Fee Structure Handlers
  const addOrUpdateFee = () => {
    if (newFeeCategory && newFeeAmount) {
      if (editFeeIndex !== null) {
        const updatedFees = [...feeStructure];
        updatedFees[editFeeIndex] = {
          category: newFeeCategory,
          amount: Number(newFeeAmount),
        };
        setFeeStructure(updatedFees);
        setEditFeeIndex(null);
      } else {
        setFeeStructure([
          ...feeStructure,
          { category: newFeeCategory, amount: Number(newFeeAmount) },
        ]);
      }
      setNewFeeCategory("");
      setNewFeeAmount("");
    }
  };

  const editFee = (index: number) => {
    setNewFeeCategory(feeStructure[index].category);
    setNewFeeAmount(feeStructure[index].amount.toString());
    setEditFeeIndex(index);
  };

  const deleteFee = (index: number) => {
    setFeeStructure(feeStructure.filter((_, i) => i !== index));
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
        Settings
      </Typography>
      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Batch Timing" />
          <Tab label="Seats" />
          <Tab label="Add Students" />
          <Tab label="Fee Structure" />
        </Tabs>

        {/* Batch Timing Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Configure Batch Timing
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Batch Timing"
              value={newTiming}
              onChange={(e) => setNewTiming(e.target.value)}
              placeholder="e.g., 2:00 PM - 4:00 PM"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={addOrUpdateBatchTiming}
              startIcon={editTimingIndex !== null ? <Edit /> : <Add />}
            >
              {editTimingIndex !== null ? "Update" : "Add"}
            </Button>
          </Box>
          <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
            <Table>
              <TableBody>
                {batchTiming.map((timing, index) => (
                  <TableRow key={index}>
                    <TableCell>{timing}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => editBatchTiming(index)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => deleteBatchTiming(index)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </TabPanel>

        {/* Seats Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Configure Seats
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Total Seats"
              type="number"
              value={seatsInput}
              onChange={(e) => setSeatsInput(Number(e.target.value))}
              fullWidth
              sx={{ maxWidth: "200px" }}
              inputProps={{ min: students.length }}
            />
            <Button variant="contained" onClick={configureSeats}>
              Configure
            </Button>
          </Box>
          <Typography variant="subtitle1" gutterBottom>
            Available: {seats - occupiedSeats} / {seats}
          </Typography>
          <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
            <Grid container spacing={1} sx={{ maxWidth: "600px" }}>
              {Array.from({ length: seats }, (_, index) => (
                <Grid item key={index}>
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <EventSeat
                      sx={{
                        fontSize: 40,
                        color:
                          index < occupiedSeats ? "grey.500" : "primary.main",
                        opacity: index < occupiedSeats ? 0.5 : 1,
                        transition: "all 0.3s ease",
                        "&:hover": { transform: "scale(1.1)" },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: index < occupiedSeats ? "grey.900" : "white",
                        fontWeight: "bold",
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Add Students Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Add Students
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Student Name"
              value={newStudent}
              onChange={(e) => setNewStudent(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleAddStudent}
              startIcon={<Add />}
            >
              Add
            </Button>
          </Box>
          <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
            <Table>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No students added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </TabPanel>

        {/* Fee Structure Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Configure Fee Structure
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Fee Category"
              value={newFeeCategory}
              onChange={(e) => setNewFeeCategory(e.target.value)}
              fullWidth
            />
            <TextField
              label="Amount"
              type="number"
              value={newFeeAmount}
              onChange={(e) => setNewFeeAmount(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={addOrUpdateFee}
              startIcon={editFeeIndex !== null ? <Edit /> : <Add />}
            >
              {editFeeIndex !== null ? "Update" : "Add"}
            </Button>
          </Box>
          <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
            <Table>
              <TableBody>
                {feeStructure.map((fee, index) => (
                  <TableRow key={index}>
                    <TableCell>{fee.category}</TableCell>
                    <TableCell align="right">₹{fee.amount}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => editFee(index)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => deleteFee(index)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}
