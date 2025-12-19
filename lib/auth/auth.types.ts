// lib/auth/auth.types.ts

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    // add other fields as returned by your backend
  };
}
