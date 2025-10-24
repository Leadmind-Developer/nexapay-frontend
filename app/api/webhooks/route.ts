import { NextResponse } from "next/server";

let logs: any[] = [];

export async function GET() {
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const entry = { id: logs.length + 1, created_at: new Date().toISOString(), ...body };
  logs.unshift(entry);
  console.log("[webhook] received", entry);
  return NextResponse.json({ ok: true });
}
