import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() { return NextResponse.json(await prisma.campaign.findMany({ include: { rows: true } })); }
export async function POST(req: NextRequest) { const body = await req.json(); const c = await prisma.campaign.create({ data: { name: body.name, description: body.description, createdById: body.createdById } }); return NextResponse.json(c); }
