"use client";

import { Button, Typography, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function HomeClient() {
  const router = useRouter();

  return (
    <Box p={4}>
      <Typography variant="h1" color="primary.main">
        Library Management System
      </Typography>
      <Typography variant="body1">Welcome to your library!</Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={() => router.push('/dashboard')}
      >
        Get Started
      </Button>
    </Box>
  );
}