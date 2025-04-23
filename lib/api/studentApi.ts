import {
  GET_PROFILE,
  SUBSCRIPTION_DETAILS,
  UPDATE_PROFILE,
  UPDATE_STUDENT,
} from "../constants/endpoints";
import apiClient from "./apiClient";

export const getSubscriptionDetails = () =>
  apiClient.get<any>(SUBSCRIPTION_DETAILS).then((res) => {
    return res.data;
  });

export const getStudentProfile = () =>
  apiClient.get<any>(GET_PROFILE).then((res: any) => {
    return res.data;
  });

export const updateStudentProfile = (formData: any) =>
  apiClient
    .put<any>(UPDATE_PROFILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res: any) => {
      return res.data;
    });
