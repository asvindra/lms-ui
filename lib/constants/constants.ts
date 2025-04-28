export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/verify",
  "/auth/forgot-password",
  "/auth/confirm-password",
];

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/requests",
  "/profile",
  "/settings",
  "/analytics",
  "/subscriptions",
  "/payments",
  "/students",
  "/plans",
  "/payments/success",
  "/payments/cancel",
  "/master/plans",
  "/past/students",
  "/settings/shifts",
  "/configure/shifts",
  "/configure/shifts-configured",
  "/configure/seats",
  "/configure/students/add-student",
  "/configure/students/student-list",
];

export const STUDENT_ROUTES = [
  "/student",
  "/student/profile",
  "/student/requests",
];
