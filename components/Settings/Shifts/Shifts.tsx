// app/shifts/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

interface Shift {
  id: string;
  startTime: string; // e.g., "06:00 AM"
  endTime: string; // e.g., "10:00 AM"
  fees: number;
}

interface Discount {
  minShifts: number; // Minimum shifts to qualify for discount
  discountPercentage: number;
}

export default function Shifts() {
  const [numShifts, setNumShifts] = useState<number | "">("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [editShiftId, setEditShiftId] = useState<string | null>(null);
  const [newFees, setNewFees] = useState<number | "">("");
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [discountOption, setDiscountOption] = useState<string>("none");
  const [discountPercentage, setDiscountPercentage] = useState<number | "">("");

  // Generate shifts based on number of shifts
  const generateShifts = () => {
    if (!numShifts || numShifts < 1) {
      alert("Please enter a valid number of shifts.");
      return;
    }

    const totalHours = 24;
    const shiftDuration = totalHours / numShifts;
    const newShifts: Shift[] = [];
    let startHour = 6; // Start at 6 AM

    for (let i = 0; i < numShifts; i++) {
      const startMinutes = startHour * 60;
      const endMinutes = startMinutes + shiftDuration * 60;

      // Adjust last shift if decimal
      const isLastShift = i === numShifts - 1;
      const adjustedEndMinutes = isLastShift ? 24 * 60 : endMinutes;

      const startTime = formatTime(startMinutes);
      const endTime = formatTime(adjustedEndMinutes);

      newShifts.push({
        id: Date.now().toString() + i,
        startTime,
        endTime,
        fees: 0, // Default fees, configurable later
      });

      startHour += shiftDuration;
    }

    setShifts(newShifts);
    setNumShifts(""); // Reset input
  };

  // Format minutes to time string (e.g., "06:00 AM")
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = Math.round(minutes % 60);
    const period = hours < 12 ? "AM" : "PM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")} ${period}`;
  };

  // Edit shift fees
  const editShiftFees = (shift: Shift) => {
    setEditShiftId(shift.id);
    setNewFees(shift.fees);
  };

  const saveShiftFees = (id: string) => {
    if (newFees === "" || newFees < 0) {
      alert("Please enter a valid fee amount.");
      return;
    }
    setShifts(
      shifts.map((shift) =>
        shift.id === id ? { ...shift, fees: Number(newFees) } : shift
      )
    );
    setEditShiftId(null);
    setNewFees("");
  };

  const deleteShift = (id: string) => {
    setShifts(shifts.filter((shift) => shift.id !== id));
  };

  // Handle discount configuration
  const configureDiscount = () => {
    if (
      discountOption === "none" ||
      discountPercentage === "" ||
      discountPercentage < 0
    ) {
      alert("Please select a discount option and enter a valid percentage.");
      return;
    }

    const minShifts = parseInt(discountOption, 10);
    if (minShifts > shifts.length) {
      alert("Minimum shifts for discount cannot exceed total shifts.");
      return;
    }

    setDiscounts([
      ...discounts,
      { minShifts, discountPercentage: Number(discountPercentage) },
    ]);
    setDiscountOption("none");
    setDiscountPercentage("");
  };

  const deleteDiscount = (minShifts: number) => {
    setDiscounts(discounts.filter((d) => d.minShifts !== minShifts));
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
        Shifts Configuration
      </Typography>
      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Shift Input */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Number of Shifts"
            type="number"
            value={numShifts}
            onChange={(e) =>
              setNumShifts(e.target.value === "" ? "" : Number(e.target.value))
            }
            inputProps={{ min: 1 }}
            sx={{ maxWidth: "200px" }}
          />
          <Button variant="contained" onClick={generateShifts}>
            Generate Shifts
          </Button>
        </Box>

        {/* Shifts Table */}
        {shifts.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Configure Shift Fees
            </Typography>
            <Box
              sx={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 350px)",
                mb: 3,
              }}
            >
              <Table>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>{`${shift.startTime} - ${shift.endTime}`}</TableCell>
                      <TableCell align="right">
                        {editShiftId === shift.id ? (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                              type="number"
                              value={newFees}
                              onChange={(e) =>
                                setNewFees(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                              size="small"
                              sx={{ width: "100px" }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => saveShiftFees(shift.id)}
                            >
                              Save
                            </Button>
                          </Box>
                        ) : (
                          `₹${shift.fees}`
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => editShiftFees(shift)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => deleteShift(shift.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* Discount Configuration */}
            <Typography variant="h6" gutterBottom>
              Configure Discounts
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl sx={{ minWidth: "200px" }}>
                <InputLabel>Minimum Shifts for Discount</InputLabel>
                <Select
                  value={discountOption}
                  onChange={(e) => setDiscountOption(e.target.value)}
                  label="Minimum Shifts for Discount"
                >
                  <MenuItem value="none">None</MenuItem>
                  {shifts.length >= 2 && (
                    <MenuItem value="2">2 Shifts</MenuItem>
                  )}
                  {shifts.length >= 3 && (
                    <MenuItem value="3">3 Shifts</MenuItem>
                  )}
                  {shifts.length > 3 && (
                    <MenuItem value={shifts.length.toString()}>
                      All Shifts
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <TextField
                label="Discount Percentage"
                type="number"
                value={discountPercentage}
                onChange={(e) =>
                  setDiscountPercentage(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                inputProps={{ min: 0, max: 100 }}
                sx={{ maxWidth: "150px" }}
              />
              <Button variant="contained" onClick={configureDiscount}>
                Add Discount
              </Button>
            </Box>

            {/* Discounts Table */}
            {discounts.length > 0 && (
              <Box sx={{ overflowY: "auto", maxHeight: "200px" }}>
                <Table>
                  <TableBody>
                    {discounts.map((discount) => (
                      <TableRow key={discount.minShifts}>
                        <TableCell>{`Min ${discount.minShifts} Shifts`}</TableCell>
                        <TableCell align="right">{`${discount.discountPercentage}%`}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => deleteDiscount(discount.minShifts)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
