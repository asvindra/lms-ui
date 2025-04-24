"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../../lib/context/ToastContext";
import { configureShifts, getConfiguredShifts } from "../../lib/api/adminApi";

// Schema for initial shift config
const shiftConfigSchema = z
  .object({
    numShifts: z.number().min(1).max(4, "Maximum 4 shifts allowed"),
    hoursPerShift: z
      .number()
      .min(1)
      .max(24, "Hours per shift cannot exceed 24"),
    startTime: z
      .string()
      .regex(
        /^(0[6-9]|1[0-1]):00 (AM)$/,
        "Start time must be between 6:00 AM and 11:00 AM"
      ),
  })
  .refine((data) => !(data.numShifts === 4 && data.hoursPerShift > 6), {
    message: "Hours per shift cannot exceed 6 when selecting 4 shifts",
    path: ["hoursPerShift"],
  });

// Schema for fees and discounts (dynamic based on numShifts)
const feesAndDiscountsSchema = (numShifts: number) =>
  z.object({
    fees: z
      .array(z.number().min(0, "Fees cannot be negative"))
      .length(numShifts),
    provideDiscounts: z.boolean(),
    discountAllShifts: z.number().min(0).max(100).optional(), // "All (X)"
    ...(numShifts >= 2 && {
      discountSingle: z.number().min(0).max(100).optional(),
    }), // Single selection
    ...(numShifts >= 3 && {
      discountDouble: z.number().min(0).max(100).optional(),
    }), // Double selection
    ...(numShifts === 4 && {
      discountTriple: z.number().min(0).max(100).optional(),
    }), // Triple selection
  });

type ShiftConfigFormData = z.infer<typeof shiftConfigSchema>;
type FeesAndDiscountsFormData = z.infer<
  ReturnType<typeof feesAndDiscountsSchema>
>;

// Utility functions
const convertTo24Hour = (time12h: string): string => {
  const [time, period] = time12h.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const convertTo12Hour = (time24h: string): string => {
  const [hours, minutes] = time24h.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
};

export default function ConfigureShifts() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [generatedShifts, setGeneratedShifts] = useState<any[]>([]);
  const [step1Data, setStep1Data] = useState<ShiftConfigFormData | null>(null);

  const { data: existingShiftsData, isLoading: isCheckingShifts } = useQuery({
    queryKey: ["configuredShifts"],
    queryFn: getConfiguredShifts,
    onError: (err: any) => {
      if (err.message !== "No shifts configured") {
        toastError(err.message || "Failed to check existing shifts");
      }
    },
  });

  const {
    register: registerStep1,
    handleSubmit: handleStep1,
    control: controlStep1,
    watch: watchStep1,
    formState: { errors: errorsStep1 },
  } = useForm<ShiftConfigFormData>({
    resolver: zodResolver(shiftConfigSchema),
    defaultValues: { numShifts: 1, hoursPerShift: 6, startTime: "06:00 AM" },
  });

  const numShifts = watchStep1("numShifts");

  const {
    register: registerStep2,
    handleSubmit: handleStep2,
    watch: watchStep2,
    formState: { errors: errorsStep2 },
  } = useForm<FeesAndDiscountsFormData>({
    resolver: zodResolver(feesAndDiscountsSchema(numShifts)),
    defaultValues: { provideDiscounts: false },
  });

  const provideDiscounts = watchStep2("provideDiscounts");

  const { mutate: configureShiftsMutation, isPending: loading } = useMutation({
    mutationFn: configureShifts,
    onSuccess: () => {
      toastSuccess("Shifts configured successfully!");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      toastError(err.message || "Failed to configure shifts!");
    },
  });

  const steps = ["Shift Configuration", "Fees & Discounts"];

  const onStep1Submit = (data: ShiftConfigFormData) => {
    const startTime24h = convertTo24Hour(data.startTime);
    const shifts = Array.from({ length: data.numShifts }, (_, i) => {
      const startHour =
        (parseInt(startTime24h.split(":")[0]) + i * data.hoursPerShift) % 24;
      const endHour = (startHour + data.hoursPerShift) % 24;
      return {
        shift_number: i + 1,
        start_time: convertTo12Hour(
          `${startHour.toString().padStart(2, "0")}:${
            startTime24h.split(":")[1]
          }`
        ),
        end_time: convertTo12Hour(
          `${endHour.toString().padStart(2, "0")}:${startTime24h.split(":")[1]}`
        ),
      };
    });
    setGeneratedShifts(shifts);
    setStep1Data(data);
    setActiveStep(1);
  };

  const onStep2Submit = (data: FeesAndDiscountsFormData) => {
    if (!step1Data) return;
    const payload = {
      numShifts: generatedShifts.length,
      hoursPerShift: step1Data.hoursPerShift,
      startTime: convertTo24Hour(step1Data.startTime),
      fees: data.fees,
      discounts: data.provideDiscounts
        ? {
            ...(data.discountAllShifts !== undefined && {
              discountAllShifts: data.discountAllShifts,
            }),
            ...(numShifts >= 2 &&
              data.discountSingle !== undefined && {
                discountSingle: data.discountSingle,
              }),
            ...(numShifts >= 3 &&
              data.discountDouble !== undefined && {
                discountDouble: data.discountDouble,
              }),
            ...(numShifts === 4 &&
              data.discountTriple !== undefined && {
                discountTriple: data.discountTriple,
              }),
          }
        : undefined,
    };
    configureShiftsMutation(payload);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const startTimeOptions = [
    "06:00 AM",
    "07:00 AM",
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
  ];
  const shiftsAlreadyConfigured = existingShiftsData?.shifts?.length > 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "grey.100",
        p: 3,
      }}
    >
      <Fade in={true} timeout={500}>
        <Paper
          elevation={6}
          sx={{ maxWidth: 600, width: "100%", p: 4, borderRadius: 2 }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Configure Shifts
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {isCheckingShifts ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : shiftsAlreadyConfigured ? (
            <Alert severity="info">
              Shifts are already configured. To modify, delete existing shifts
              first or contact support.
            </Alert>
          ) : (
            <>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {activeStep === 0 ? (
                <Box component="form" onSubmit={handleStep1(onStep1Submit)}>
                  <Controller
                    name="numShifts"
                    control={controlStep1}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="num-shifts-label">
                          Number of Shifts
                        </InputLabel>
                        <Select
                          labelId="num-shifts-label"
                          id="num-shifts"
                          {...field}
                          error={!!fieldState.error}
                          disabled={loading}
                          label="Number of Shifts"
                        >
                          {[1, 2, 3, 4].map((n) => (
                            <MenuItem key={n} value={n}>
                              {n}
                            </MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && (
                          <Typography color="error" variant="caption">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                  <TextField
                    label="Hours per Shift"
                    type="number"
                    fullWidth
                    {...registerStep1("hoursPerShift", { valueAsNumber: true })}
                    error={!!errorsStep1.hoursPerShift}
                    helperText={
                      errorsStep1.hoursPerShift?.message ||
                      (numShifts === 4 ? "Max 6 hours for 4 shifts" : "")
                    }
                    sx={{ mb: 3 }}
                    disabled={loading}
                    inputProps={{ max: numShifts === 4 ? 6 : 24 }}
                  />
                  <Controller
                    name="startTime"
                    control={controlStep1}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="start-time-label">
                          Start Time
                        </InputLabel>
                        <Select
                          labelId="start-time-label"
                          id="start-time"
                          {...field}
                          error={!!fieldState.error}
                          disabled={loading}
                          label="Start Time"
                        >
                          {startTimeOptions.map((time) => (
                            <MenuItem key={time} value={time}>
                              {time}
                            </MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && (
                          <Typography color="error" variant="caption">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : "Next"}
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleStep2(onStep2Submit)}>
                  <Typography variant="h6" gutterBottom>
                    Configure Fees and Discounts
                  </Typography>
                  {generatedShifts.map((shift, index) => (
                    <TextField
                      key={shift.shift_number}
                      label={`Shift ${shift.shift_number} (${shift.start_time} - ${shift.end_time}) Fees`}
                      type="number"
                      fullWidth
                      {...registerStep2(`fees.${index}`, {
                        valueAsNumber: true,
                      })}
                      error={!!errorsStep2.fees?.[index]}
                      helperText={errorsStep2.fees?.[index]?.message}
                      sx={{ mb: 2 }}
                      disabled={loading}
                    />
                  ))}
                  <FormControlLabel
                    control={
                      <Checkbox {...registerStep2("provideDiscounts")} />
                    }
                    label="Provide Discounts"
                    sx={{ mb: 2 }}
                  />
                  {provideDiscounts && (
                    <>
                      <TextField
                        label={`All (${numShifts}) (%)`}
                        type="number"
                        fullWidth
                        {...registerStep2("discountAllShifts", {
                          valueAsNumber: true,
                        })}
                        error={!!errorsStep2.discountAllShifts}
                        helperText={errorsStep2.discountAllShifts?.message}
                        sx={{ mb: 2 }}
                        disabled={loading}
                        inputProps={{ min: 0, max: 100 }}
                      />
                      {numShifts >= 2 && (
                        <TextField
                          label="Single Selection (%)"
                          type="number"
                          fullWidth
                          {...registerStep2("discountSingle", {
                            valueAsNumber: true,
                          })}
                          error={!!errorsStep2.discountSingle}
                          helperText={errorsStep2.discountSingle?.message}
                          sx={{ mb: 2 }}
                          disabled={loading}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      )}
                      {numShifts >= 3 && (
                        <TextField
                          label="Double Selection (%)"
                          type="number"
                          fullWidth
                          {...registerStep2("discountDouble", {
                            valueAsNumber: true,
                          })}
                          error={!!errorsStep2.discountDouble}
                          helperText={errorsStep2.discountDouble?.message}
                          sx={{ mb: 2 }}
                          disabled={loading}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      )}
                      {numShifts === 4 && (
                        <TextField
                          label="Triple Selection (%)"
                          type="number"
                          fullWidth
                          {...registerStep2("discountTriple", {
                            valueAsNumber: true,
                          })}
                          error={!!errorsStep2.discountTriple}
                          helperText={errorsStep2.discountTriple?.message}
                          sx={{ mb: 2 }}
                          disabled={loading}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      )}
                    </>
                  )}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={handleBack}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Save Configuration"
                      )}
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Fade>
    </Box>
  );
}
