import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/permissions";
import { prisma } from "@/lib/db";

// Polled by components/admin/NewOrderWatcher.tsx to detect orders placed
// since the admin panel was last rendered/refreshed. Deliberately just the
// one timestamp rather than a full order list — the watcher only needs to
// know "is there something newer," not what it is.
export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const latest = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return NextResponse.json({ latestCreatedAt: latest?.createdAt.toISOString() ?? null });
}
