import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND = process.env.BACKEND_API_BASE || process.env.NEXT_PUBLIC_API_BASE;

export async function POST(req: Request, { params }: any) {
  const { type } = params;
  const body = await req.json();

  const mapping: any = {
    cashout: "/standard/v1/cashout/",
    collection: "/merchant/v1/payments/",
    disbursement: "/standard/v1/disbursements/",
    remittance: "/openapi/moneytransfer/v2/credit",
    vas: "/pay-code/v1/create/",
    enterprise: "/v1/enterprise-transactions/initiate"
  };

  const path = mapping[type] ?? `/standard/v1/${type}/`;

  try {
    const res = await axios.post(`${BACKEND}${path}`, body, { headers: { "Content-Type": "application/json" }});
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error(err?.response?.data ?? err.message);
    return NextResponse.json({ error: err?.response?.data ?? err?.message }, { status: err?.response?.status || 500 });
  }
}
