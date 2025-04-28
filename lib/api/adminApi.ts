import {
  ADD_STUDENT,
  ALLOCATE_SEAT,
  CONFIGURE_SEATS,
  CONFIGURE_SHIFTS,
  CONFIG_SEAT,
  DEALLOCATE_SEAT,
  DELETE_PAST_STUDENT,
  DELETE_SEAT,
  DELETE_SHIFTS,
  DELETE_SHIFTS_BY_ID,
  DELETE_STUDENT,
  GET_ADMIN_PROFILE,
  GET_AVAILABLE_SEATS,
  GET_PAST_STUDENTS,
  GET_PLANS,
  GET_STUDENTS,
  GET_SUBSCRIPTION_STATUS,
  SHIFTS_CONFIGURED,
  UPDATE_ADMIN_PROFILE,
  UPDATE_SEAT,
  UPDATE_SHIFTS,
  UPDATE_STUDENT,
} from "../constants/endpoints";
import apiClient from "./apiClient";

interface ConfigureShiftsRequest {}
interface ConfigureShiftsResponse {}
interface ShiftsConfiguredResponse {
  discounts: [];
  shifts: [];
}
interface ShiftsConfiguredRequest {}
interface deleteShiftsRequest {}
interface UpdateShiftsRequest {}
interface DeleteShiftsResponse {}
interface updateShiftsResponse {}
interface ConfigSeatsRequest {}
interface ConfigSeatsResponse {}
interface AddStudentRequest {}
interface AddStudentResponse {}
interface UpdateStudentRequest {}
interface UpdateStudentResponse {}
interface DeleteStudentRequest {}
interface DeleteStudentResponse {}
interface GetStudentsResponse {}
interface GetStudentsRequest {}
export const configureShifts = (data: any) =>
  apiClient
    .post<ConfigureShiftsResponse>(CONFIGURE_SHIFTS, data)
    .then((res) => {
      return res.data;
    });

export const getConfiguredShifts = () =>
  apiClient.get<ShiftsConfiguredRequest>(SHIFTS_CONFIGURED).then((res: any) => {
    return res.data;
  });

export const deleteShifts = () =>
  apiClient.delete<DeleteShiftsResponse>(DELETE_SHIFTS).then((res) => {
    return res.data;
  });
export const deleteShiftById = (id: any) =>
  apiClient
    .delete<DeleteShiftsResponse>(`${DELETE_SHIFTS_BY_ID}/${id}`)
    .then((res) => {
      return res.data;
    });
export const updateShifts = (data: any) =>
  apiClient.put<UpdateShiftsRequest>(UPDATE_SHIFTS, data).then((res) => {
    return res.data;
  });
export const configureSeats = (data: any) =>
  apiClient.post<ConfigSeatsRequest>(CONFIGURE_SEATS, data).then((res: any) => {
    return res.data;
  });
export const getSeatConfig = (data: any) =>
  apiClient.get<ConfigSeatsRequest>(CONFIG_SEAT, data).then((res: any) => {
    return res.data;
  });

export const updateSeatConfig = (data: any) =>
  apiClient.post<ConfigSeatsRequest>(UPDATE_SEAT, data).then((res: any) => {
    return res.data;
  });
export const deleteSeat = (data: any) =>
  apiClient
    .delete<ConfigSeatsRequest>(`${DELETE_SEAT}/${data}`, data)
    .then((res: any) => {
      return res.data;
    });

export const addStudent = (data: any) =>
  apiClient.post<AddStudentRequest>(`${ADD_STUDENT}`, data).then((res: any) => {
    return res.data;
  });
export const updateStudent = (data: any) =>
  apiClient
    .put<UpdateStudentRequest>(`${UPDATE_STUDENT}`, data)
    .then((res: any) => {
      return res.data;
    });
export const deleteStudent = (data: any) =>
  apiClient
    .delete<DeleteStudentRequest>(`${DELETE_STUDENT}/${data}`, data)
    .then((res: any) => {
      return res.data;
    });
export const getStudents = () =>
  apiClient.get<GetStudentsRequest>(GET_STUDENTS).then((res: any) => {
    return res.data;
  });
export const deletePastStudent = (data: any) =>
  apiClient
    .delete<DeleteStudentRequest>(`${DELETE_PAST_STUDENT}/${data}`, data)
    .then((res: any) => {
      return res.data;
    });
export const getPastStudents = () =>
  apiClient.get<GetStudentsRequest>(GET_PAST_STUDENTS).then((res: any) => {
    return res.data;
  });

export const getAvailableSeats = (studentId?: string) =>
  apiClient
    .get<any>(GET_AVAILABLE_SEATS, { params: { studentId } })
    .then((res: any) => {
      return res.data;
    });
export const allocateSeat = (data: any) =>
  apiClient.post<any>(ALLOCATE_SEAT, data).then((res: any) => {
    return res.data;
  });

export const deallocateSeat = (data: any) =>
  apiClient.post<any>(DEALLOCATE_SEAT, data).then((res: any) => {
    return res.data;
  });

export const updateAdminProfile = (data: any) =>
  apiClient
    .post<any>(UPDATE_ADMIN_PROFILE, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res: any) => {
      return res.data;
    });

export const getAdminProfile = () =>
  apiClient.get<any>(GET_ADMIN_PROFILE).then((res: any) => {
    return res.data;
  });

export const getSubscriptionStatus = () =>
  apiClient.get<any>(GET_SUBSCRIPTION_STATUS).then((res: any) => {
    return res.data;
  });

export const getPlans = () =>
  apiClient.get<any>(GET_PLANS).then((res: any) => {
    return res.data;
  });
