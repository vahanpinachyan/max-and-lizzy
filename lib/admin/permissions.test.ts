import { describe, it, expect, vi, beforeEach } from "vitest";

const { getAdminSession } = vi.hoisted(() => ({ getAdminSession: vi.fn() }));
vi.mock("@/lib/admin/auth", () => ({ getAdminSession }));

const REDIRECT_MARKER = "__REDIRECT__";
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`${REDIRECT_MARKER}:${path}`);
  }),
}));

const { requireAdminSession, requireManagerAction, requireManagerSession } = await import("./permissions");

const manager = { id: "1", email: "m@x.com", passwordHash: "h", name: "Manager", role: "manager", createdAt: new Date() };
const cashier = { id: "2", email: "c@x.com", passwordHash: "h", name: "Cashier", role: "cashier", createdAt: new Date() };

beforeEach(() => {
  getAdminSession.mockReset();
});

describe("requireAdminSession", () => {
  it("throws when there's no session", async () => {
    getAdminSession.mockResolvedValue(null);
    await expect(requireAdminSession()).rejects.toThrow(/not authenticated/i);
  });

  it("returns the admin when there's a valid session", async () => {
    getAdminSession.mockResolvedValue(manager);
    await expect(requireAdminSession()).resolves.toBe(manager);
  });
});

describe("requireManagerAction", () => {
  it("throws when there's no session", async () => {
    getAdminSession.mockResolvedValue(null);
    await expect(requireManagerAction()).rejects.toThrow(/not authenticated/i);
  });

  // The actual permission boundary this guards: a cashier account (orders +
  // customers only) must never be able to invoke a manager-only Server
  // Action (products, promo codes, staff) just because they're logged in.
  it("throws for a cashier — cashiers cannot perform manager-only actions", async () => {
    getAdminSession.mockResolvedValue(cashier);
    await expect(requireManagerAction()).rejects.toThrow(/requires a manager account/i);
  });

  it("succeeds for a manager", async () => {
    getAdminSession.mockResolvedValue(manager);
    await expect(requireManagerAction()).resolves.toBe(manager);
  });
});

describe("requireManagerSession", () => {
  it("redirects to /admin/login when there's no session", async () => {
    getAdminSession.mockResolvedValue(null);
    await expect(requireManagerSession()).rejects.toThrow(`${REDIRECT_MARKER}:/admin/login`);
  });

  it("redirects a cashier to /admin/orders rather than showing the manager-only page", async () => {
    getAdminSession.mockResolvedValue(cashier);
    await expect(requireManagerSession()).rejects.toThrow(`${REDIRECT_MARKER}:/admin/orders`);
  });

  it("returns the admin for a manager without redirecting", async () => {
    getAdminSession.mockResolvedValue(manager);
    await expect(requireManagerSession()).resolves.toBe(manager);
  });
});
