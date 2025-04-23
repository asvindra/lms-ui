"use client";

import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const fetchAdminRequests = async () => {
  const res = await fetch("/api/admin/requests", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
};

const updateRequestStatus = async ({
  requestId,
  status,
}: {
  requestId: string;
  status: "approved" | "rejected";
}) => {
  const res = await fetch("/api/admin/requests", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestId, status }),
  });
  if (!res.ok) throw new Error(`Failed to ${status} request`);
  return res.json();
};

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminRequests"],
    queryFn: fetchAdminRequests,
  });

  const mutation = useMutation({
    mutationFn: updateRequestStatus,
    onSuccess: (result, variables) => {
      toast.success(`Request ${variables.status} successfully`);
      queryClient.setQueryData(["adminRequests"], (old: any) => ({
        requests: old?.requests.map((req: any) =>
          req.id === variables.requestId ? result.request : req
        ),
      }));
    },
    onError: (err: any, variables) => {
      console.error("Update error:", err);
      toast.error(err.message || `Failed to ${variables.status} request`);
    },
  });

  //   if (isLoading) return <Typography>Loading...</Typography>;
  //   if (error) {
  //     toast.error("Failed to load requests");
  //     return <Typography>Error loading requests</Typography>;
  //   }

  const requests = data?.requests || [];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Requests
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((req: any) => (
            <TableRow key={req.id}>
              <TableCell>{req.students?.name || "Unknown"}</TableCell>
              <TableCell>
                {req.type === "seat_update" ? "Seat Update" : "Shift Update"}
              </TableCell>
              <TableCell>{req.details}</TableCell>
              <TableCell>{req.status}</TableCell>
              <TableCell>
                {new Date(req.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {req.status === "pending" && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() =>
                        mutation.mutate({
                          requestId: req.id,
                          status: "approved",
                        })
                      }
                      disabled={mutation.isPending}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() =>
                        mutation.mutate({
                          requestId: req.id,
                          status: "rejected",
                        })
                      }
                      disabled={mutation.isPending}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
