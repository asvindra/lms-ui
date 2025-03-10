"use client";

import { useState } from "react";
import {
  Modal as MUIModal,
  Box,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode; // Optional buttons
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  actions,
}: ModalProps) {
  return (
    <MUIModal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {title && <Typography variant="h6">{title}</Typography>}
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        {children}
        {actions && (
          <Box
            sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </MUIModal>
  );
}
