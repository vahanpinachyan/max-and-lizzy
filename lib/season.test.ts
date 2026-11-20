import { describe, expect, it } from "vitest";
import { CHRISTMAS_WINDOW, seasonForDate } from "@/lib/season";

// Yerevan is UTC+4, so 08:00 UTC is midday on the shop's own calendar day.
const shopNoon = (iso: string) => new Date(`${iso}T08:00:00Z`);

describe("seasonForDate", () => {
  it("is off through most of the year", () => {
    for (const date of ["2026-03-15", "2026-07-01", "2026-10-31", "2026-11-20"]) {
      expect(seasonForDate(shopNoon(date))).toBe("none");
    }
  });

  it("is off on the last day of November and on from 1 December", () => {
    expect(seasonForDate(shopNoon("2026-11-30"))).toBe("none");
    expect(seasonForDate(shopNoon("2026-12-01"))).toBe("christmas");
  });

  // The point of the window: New Year, not 25 December, is the gift-giving
  // peak in Armenia, so the dressing must still be up on the 31st.
  it("stays on across Christmas and New Year", () => {
    expect(seasonForDate(shopNoon("2026-12-25"))).toBe("christmas");
    expect(seasonForDate(shopNoon("2026-12-31"))).toBe("christmas");
    expect(seasonForDate(shopNoon("2027-01-01"))).toBe("christmas");
  });

  // Armenian Apostolic Christmas is the 6th, Russian Orthodox the 7th.
  it("stays on through 7 January and comes down on the 8th", () => {
    expect(seasonForDate(shopNoon("2027-01-06"))).toBe("christmas");
    expect(seasonForDate(shopNoon("2027-01-07"))).toBe("christmas");
    expect(seasonForDate(shopNoon("2027-01-08"))).toBe("none");
  });

  it("repeats in later years without an edit", () => {
    expect(seasonForDate(shopNoon("2031-12-14"))).toBe("christmas");
    expect(seasonForDate(shopNoon("2032-01-03"))).toBe("christmas");
    expect(seasonForDate(shopNoon("2032-06-14"))).toBe("none");
  });

  it("switches on the shop's calendar day, not UTC's", () => {
    // 2026-11-30 21:00 UTC is already 01:00 on 1 December in Yerevan.
    expect(seasonForDate(new Date("2026-11-30T21:00:00Z"))).toBe("christmas");
    // 2026-11-30 19:00 UTC is still 23:00 on 30 November.
    expect(seasonForDate(new Date("2026-11-30T19:00:00Z"))).toBe("none");
    // And the far end: 2027-01-07 21:00 UTC is 01:00 on the 8th — over.
    expect(seasonForDate(new Date("2027-01-07T21:00:00Z"))).toBe("none");
  });

  it("keeps the window straddling New Year, not running inside one year", () => {
    expect(CHRISTMAS_WINDOW.start.month).toBe(12);
    expect(CHRISTMAS_WINDOW.end.month).toBe(1);
  });
});
