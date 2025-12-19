// lib/auth/auth.api.ts
import api, { Payload } from "../api";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import type { LoginResponse } from "./auth.types";

type OptionalConfig = AxiosRequestConfig;

export const AuthAPI = {
  login(payload: Payload, config?: OptionalConfig): Promise<AxiosResponse<LoginResponse>> {
    return api.post("/auth/web/login", payload, config);
  },

  confirmLogin(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/web/confirm-login", payload, config);
  },

  register(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/web/register", payload, config);
  },

  confirmRegistration(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/web/confirm-registration", payload, config);
  },

  resendOtp(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/web/resend-otp", payload, config);
  },

  forgot(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/web/forgot", payload, config);
  },

  reset(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/web/reset", payload, config);
  },

  logout(config?: OptionalConfig) {
    return api.post("/auth/web/logout", undefined, config);
  },

  verify(config?: OptionalConfig) {
    return api.get("/auth/web/verify", config);
  },

  refresh(config?: OptionalConfig) {
    return api.post("/auth/refresh", undefined, config);
  },

  toggle2FA(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/web/2fa/toggle", payload, config);
  },

  requestBiometric(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/web/request-biometric", payload, config);
  },

  verifyBiometric(payload: Payload, config?: OptionalConfig) {
    return api.post("/auth/web/verify-biometric", payload, config);
  },
};
