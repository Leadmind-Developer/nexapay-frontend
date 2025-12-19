// lib/auth/auth.types.ts
export interface LoginResponse {
  method?: "otp" | "password"; // add all possible login methods
  identifier?: string;         // used for OTP flow
  token?: string;              // if login returns token immediately
  refreshToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}
