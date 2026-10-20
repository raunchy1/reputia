import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailDeliveryAvailable } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "ok" | "down" = "ok";
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    database = "down";
  }
  const status = database === "ok" ? "ok" : "degraded";
  return NextResponse.json(
    { status, service: "reputia", database, email: emailDeliveryAvailable ? "ok" : "not_configured" },
    { status: database === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
