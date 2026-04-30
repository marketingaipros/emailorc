import { prisma } from "@/src/lib/prisma";import { NextResponse } from "next/server";
export async function GET(_: Request, { params }: { params: { id: string } }) { return NextResponse.json(await prisma.campaign.findUnique({ where: { id: params.id }, include: { rows: { include: { strategies:true, drafts:true, qaOutputs:true } } } })); }
