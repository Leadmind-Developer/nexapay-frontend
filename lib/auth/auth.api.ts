import api, { Payload } from "../api";
import { AxiosResponse } from "axios";

// -------------------------------
// ✅ AUTH API
// -------------------------------
export const AuthAPI = {
  // Login with identifier + password
  login: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/login", payload),

  // Confirm login with OTP / 2FA
  confirmLogin: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/confirm-login", payload),

  // Register new user
  register: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/register", payload),

  // Confirm registration (OTP)
  confirmRegistration: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/confirm-registration", payload),

  // Resend OTP for login / registration / forgot password
  resendOtp: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/resend-otp", payload),

  // Request forgot password (send OTP/email)
  forgot: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/forgot", payload),

  // Reset password using OTP/token
  reset: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/reset", payload),

  // Logout user
  logout: <T>(): Promise<AxiosResponse<T>> =>
    api.post("/auth/logout"),

  // Verify current session
  verify: <T>(): Promise<AxiosResponse<T>> =>
    api.get("/auth/verify"),

  // Refresh session token
  refresh: <T>(): Promise<AxiosResponse<T>> =>
    api.post("/auth/refresh"),

  // Toggle 2FA
  toggle2FA: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/2fa/toggle", payload),

  // Request biometric setup
  requestBiometric: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/request-biometric", payload),

  // Verify biometric login
  verifyBiometric: <T>(payload: Payload): Promise<AxiosResponse<T>> =>
    api.post("/auth/verify-biometric", payload),
};

export type AuthPayload = Payload;
export default AuthAPI;
