export const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/verify",
  "/auth/forgot-password",
  "/auth/confirm-password",
];

// Admin-specific protected routes
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/analytics",
  "/students",
  "/settings/shifts",
  "/configure/shifts",
  "/configure/shifts-configured",
  "/configure/seats",
  "/configure/students/add-student",
  "/configure/students/student-list",
];

// Student-specific protected routes
export const STUDENT_ROUTES = [
  "/student-home",
  "/student-dashboard",
  "/courses",
  "/assignments",
  "/grades",
];
