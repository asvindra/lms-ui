const BASE_AUTH = "/auth";
export const LOGIN = `${BASE_AUTH}/login`;
export const SIGNUP = `${BASE_AUTH}/signup`;
export const FORGOT_PASSWORD = `${BASE_AUTH}/forgot-password`;
export const VERIFICATION = `${BASE_AUTH}/verify`;
export const CONFIRM = `${BASE_AUTH}/confirm-password`;

//admin
const BASE_ADMIN = "/admin";
export const CONFIGURE_SHIFTS = `${BASE_ADMIN}/configure-shifts`;
export const SHIFTS_CONFIGURED = `${BASE_ADMIN}/shifts-configured`;

export const UPDATE_SHIFTS = `${BASE_ADMIN}/update-shifts`;
export const DELETE_SHIFTS = `${BASE_ADMIN}/delete-shifts`;
export const DELETE_SHIFTS_BY_ID = `${BASE_ADMIN}/delete-shift`;

//config seats
export const CONFIGURE_SEATS = `${BASE_ADMIN}/configure-seats`;
export const CONFIG_SEAT = `${BASE_ADMIN}/seat-config`;
export const UPDATE_SEAT = `${BASE_ADMIN}/update-seat`;
export const DELETE_SEAT = `${BASE_ADMIN}/delete-seat`;

//Student
const BASE_STUDENT = `${BASE_ADMIN}/student`;
export const GET_STUDENTS = `${BASE_STUDENT}/get-students`;
export const ADD_STUDENT = `${BASE_STUDENT}/add-student`;
export const UPDATE_STUDENT = `${BASE_STUDENT}/update-student`;
export const DELETE_STUDENT = `${BASE_STUDENT}/delete-student`;

//seat allocation
const BASE_SEAT = `${BASE_ADMIN}/seat`;
export const GET_AVAILABLE_SEATS = `${BASE_SEAT}/get-available-seats`;
export const ALLOCATE_SEAT = `${BASE_SEAT}/allocate-seat`;
export const DEALLOCATE_SEAT = `${BASE_SEAT}/deallocate-seat`;

//Admin profile
const BASE_ADMIN_PROFILE = `${BASE_ADMIN}/profile`;
export const GET_ADMIN_PROFILE = `${BASE_ADMIN_PROFILE}/details`;
export const UPDATE_ADMIN_PROFILE = `${BASE_ADMIN_PROFILE}/update-profile`;
