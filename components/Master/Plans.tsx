"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

import { toast } from "react-toastify";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from "@/lib/hooks/usePlans";

export default function MasterAdminPlansPage() {
  const { data: plans = [], isLoading, error } = usePlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    amount: "",
    billing_cycle: "monthly",
    interval_count: "1",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const planData = {
        name: form.name,
        description: form.description,
        amount: parseFloat(form.amount) * 100, // Convert ₹ to paise
        billing_cycle: form.billing_cycle as "monthly" | "yearly" | "lifetime",
        interval_count: parseInt(form.interval_count),
      };
      if (isEditing) {
        await updatePlan.mutateAsync({ id: form.id, plan: planData });
        toast.success("Plan updated");
      } else {
        await createPlan.mutateAsync(planData);
        toast.success("Plan created");
      }
      setForm({
        id: "",
        name: "",
        description: "",
        amount: "",
        billing_cycle: "monthly",
        interval_count: "1",
      });
      setIsEditing(false);
    } catch (err) {
      // Error handled by mutation onError
    }
  };

  const handleEdit = (plan: any) => {
    setForm({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      amount: (plan.amount / 100).toString(),
      billing_cycle: plan.billing_cycle,
      interval_count: plan.interval_count.toString(),
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlan.mutateAsync(id);
      toast.success("Plan deleted");
    } catch (err) {
      // Error handled by mutation onError
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography>Error loading plans</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Subscription Plans
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          fullWidth
          margin="normal"
          multiline
        />
        <TextField
          label="Amount (INR)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          type="number"
          fullWidth
          margin="normal"
          required
        />
        <TextField
          select
          label="Billing Cycle"
          value={form.billing_cycle}
          onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
          fullWidth
          margin="normal"
          required
        >
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="yearly">Yearly</MenuItem>
          <MenuItem value="lifetime">Lifetime</MenuItem>
        </TextField>
        <TextField
          label="Interval Count"
          value={form.interval_count}
          onChange={(e) => setForm({ ...form, interval_count: e.target.value })}
          type="number"
          fullWidth
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={createPlan.isPending || updatePlan.isPending}
        >
          {isEditing ? "Update Plan" : "Create Plan"}
        </Button>
        {isEditing && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setForm({
                id: "",
                name: "",
                description: "",
                amount: "",
                billing_cycle: "monthly",
                interval_count: "1",
              });
              setIsEditing(false);
            }}
            sx={{ mt: 2, ml: 2 }}
          >
            Cancel
          </Button>
        )}
      </form>
      <Table sx={{ mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Amount (₹)</TableCell>
            <TableCell>Billing Cycle</TableCell>
            <TableCell>Interval</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plans.map((plan: any) => (
            <TableRow key={plan.id}>
              <TableCell>{plan.name}</TableCell>
              <TableCell>{plan.description}</TableCell>
              <TableCell>₹{plan.amount / 100}</TableCell>
              <TableCell>{plan.billing_cycle}</TableCell>
              <TableCell>{plan.interval_count}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => handleEdit(plan)}
                  disabled={deletePlan.isPending}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(plan.id)}
                  disabled={deletePlan.isPending}
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
