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
  const [tabValue, setTabValue] = useState(0);

  // State for batch timing
  const [batchTiming, setBatchTiming] = useState<string[]>([
    "9:00 AM - 11:00 AM",
  ]);
  const [newTiming, setNewTiming] = useState("");
  const [editTimingIndex, setEditTimingIndex] = useState<number | null>(null);

  // State for seats
  const [seatsInput, setSeatsInput] = useState<number>(30); // Input for total seats
  const [seats, setSeats] = useState<number>(30); // Confirmed total seats
  const [occupiedSeats, setOccupiedSeats] = useState<number>(0); // Confirmed occupied seats

  // State for students
  const [students, setStudents] = useState<{ name: string; id: string }[]>([]);
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
      setSeats(seatsInput); // Update confirmed seats
      setOccupiedSeats(students.length); // Sync occupied seats with students
    } else {
      alert("Total seats cannot be less than the number of students!");
    }
  };

  // Students Handlers
  const addStudent = () => {
    if (newStudent) {
      if (students.length < seats) {
        const updatedStudents = [
          ...students,
          { name: newStudent, id: Date.now().toString() },
        ];
        setStudents(updatedStudents);
        setOccupiedSeats(updatedStudents.length); // Update occupied seats immediately for visualization
        setNewStudent("");
      } else {
        alert("No available seats! Increase total seats in the Seats tab.");
      }
    }
  };

  const deleteStudent = (id: string) => {
    const updatedStudents = students.filter((student) => student.id !== id);
    setStudents(updatedStudents);
    setOccupiedSeats(updatedStudents.length); // Update occupied seats immediately
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
    <Box sx={{ maxWidth: "1200px", mx: "auto", py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
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
        </TabPanel>

        {/* Seats Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Configure Seats
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
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
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
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
              onClick={addStudent}
              startIcon={<Add />}
            >
              Add
            </Button>
          </Box>
          <Table>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => deleteStudent(student.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        </TabPanel>
      </Paper>
    </Box>
  );
}
