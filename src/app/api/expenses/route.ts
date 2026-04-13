import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({ expenses });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.date || !body.amount || !body.category) {
    return NextResponse.json({ error: "Date, amount, and category are required" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      date: new Date(body.date + "T12:00:00"),
      amount: parseFloat(body.amount),
      category: body.category,
      description: body.description || null,
      vendor: body.vendor || null,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json({ expense });
}
