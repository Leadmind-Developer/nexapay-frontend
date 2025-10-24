// app/api/auth/route.ts
import { NextResponse } from "next/server";
import api from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, email, otp, mode } = body;

    if (!phone && !email) {
      return NextResponse.json({ success: false, message: "Phone or email required" }, { status: 400 });
    }

    const identifier = phone ? { phone } : { email };
    let endpoint = "";

    if (!otp) {
      // STEP 1 — Send OTP
      endpoint = mode === "register" ? "/auth/register" : "/auth/login";
    } else {
      // STEP 2 — Verify OTP
      endpoint = mode === "register" ? "/auth/verify-register-otp" : "/auth/verify-otp";
    }

    const payload = otp ? { ...identifier, otp } : identifier;
    const res = await api.post(endpoint, payload);

    console.log("✅ Backend response:", res.data);

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error("❌ Auth route error:", err.response?.data ?? err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message || "Server error";
    return NextResponse.json({ success: false, message }, { status });
  }
}
