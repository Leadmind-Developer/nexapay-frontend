// lib/auth/auth.api.ts
import api, { Payload } from "../api";
import { AxiosResponse } from "axios";
import type { LoginResponse } from "./auth.types";

export const AuthAPI = {
  login(payload: Payload): Promise<AxiosResponse<LoginResponse>> {
    return api.post("/auth/login", payload);
  },

  confirmLogin(payload: Payload) {
    return api.post("/auth/confirm-login", payload);
  },

  register(payload: Payload) {
    return api.post("/auth/register", payload);
  },

  confirmRegistration(payload: Payload) {
    return api.post("/auth/confirm-registration", payload);
  },

  resendOtp(payload: Payload) {
    return api.post("/auth/resend-otp", payload);
  },

  forgot(payload: Payload) {
    return api.post("/auth/forgot", payload);
  },

  reset(payload: Payload) {
    return api.post("/auth/reset", payload);
  },

  logout() {
    return api.post("/auth/logout");
  },

  verify() {
    return api.get("/auth/verify");
  },

  refresh() {
    return api.post("/auth/refresh");
  },

  toggle2FA(payload: Payload) {
    return api.post("/auth/2fa/toggle", payload);
  },

  requestBiometric(payload: Payload) {
    return api.post("/auth/request-biometric", payload);
  },

  verifyBiometric(payload: Payload) {
    return api.post("/auth/verify-biometric", payload);
  },
};
