"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const fetchRequests = async () => {
  const res = await fetch("/api/student/request", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
};

const createRequest = async (data: {
  type: "seat_update" | "shift_update";
  details: string;
}) => {
  const res = await fetch("/api/student/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit request");
  return res.json();
};

export default function RequestsPage() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<"seat_update" | "shift_update">(
    "seat_update"
  );
  const [details, setDetails] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
  });

  const mutation = useMutation({
    mutationFn: createRequest,
    onSuccess: (result) => {
      toast.success("Request submitted successfully");
      queryClient.setQueryData(["requests"], (old: any) => ({
        requests: [result.request, ...(old?.requests || [])],
      }));
      setDetails("");
    },
    onError: (err: any) => {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to submit request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ type, details });
  };

  //   if (isLoading) return <Typography>Loading...</Typography>;
  //   if (error) {
  //     toast.error("Failed to load requests");
  //     return <Typography>Error loading requests</Typography>;
  //   }

  const requests = data?.requests || [];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Seat/Shift Requests
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          select
          label="Request Type"
          value={type}
          onChange={(e) =>
            setType(e.target.value as "seat_update" | "shift_update")
          }
          fullWidth
          margin="normal"
          SelectProps={{ native: true }}
        >
          <option value="seat_update">Seat Update</option>
          <option value="shift_update">Shift Update</option>
        </TextField>
        <TextField
          label="Details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <Button type="submit" variant="contained" disabled={mutation.isPending}>
          Submit Request
        </Button>
      </Box>
      <Typography variant="h6">Request History</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((req: any) => (
            <TableRow key={req.id}>
              <TableCell>
                {req.type === "seat_update" ? "Seat Update" : "Shift Update"}
              </TableCell>
              <TableCell>{req.details}</TableCell>
              <TableCell>{req.status}</TableCell>
              <TableCell>
                {new Date(req.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
