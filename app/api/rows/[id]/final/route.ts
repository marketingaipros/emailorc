import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ ok: true, message: "Implemented placeholder endpoint." }); }
export async function PATCH() { return NextResponse.json({ ok: true }); }
export async function GET() { return NextResponse.json({ ok: true }); }
