// lib/auth/auth.api.ts
import api, { Payload } from "../api";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import type { LoginResponse } from "./auth.types";

type OptionalConfig = AxiosRequestConfig;

export const AuthAPI = {
  login(payload: Payload, config?: OptionalConfig): Promise<AxiosResponse<LoginResponse>> {
    return api.post("/auth/login", payload, config);
  },

  confirmLogin(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/confirm-login", payload, config);
  },

  register(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/register", payload, config);
  },

  confirmRegistration(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/confirm-registration", payload, config);
  },

  resendOtp(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/resend-otp", payload, config);
  },

  forgot(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/forgot", payload, config);
  },

  reset(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/reset", payload, config);
  },

  logout(config?: OptionalConfig) {
    return api.post("/auth/logout", undefined, config);
  },

  verify(config?: OptionalConfig) {
    return api.get("/auth/verify", config);
  },

  refresh(config?: OptionalConfig) {
    return api.post("/auth/refresh", undefined, config);
  },

  toggle2FA(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/2fa/toggle", payload, config);
  },

  requestBiometric(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/request-biometric", payload, config);
  },

  verifyBiometric(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/verify-biometric", payload, config);
  },
};
