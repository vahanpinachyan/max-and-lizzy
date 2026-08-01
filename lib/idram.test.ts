import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { computeConfirmationChecksum, isIdramConfigured, idramRecAccount } from "./idram";

const FIELDS = {
  recAccount: "100000114",
  amount: "1000.00",
  billNo: "bill-1",
  payerAccount: "990000123",
  transId: "TESTTRANSID001",
  transDate: "28/07/2026",
};

describe("computeConfirmationChecksum", () => {
  const originalSecret = process.env.IDRAM_SECRET_KEY;

  beforeEach(() => {
    process.env.IDRAM_SECRET_KEY = "test-secret";
  });
  afterEach(() => {
    if (originalSecret === undefined) delete process.env.IDRAM_SECRET_KEY;
    else process.env.IDRAM_SECRET_KEY = originalSecret;
  });

  it("is deterministic for the same inputs and secret", () => {
    const a = computeConfirmationChecksum(FIELDS);
    const b = computeConfirmationChecksum(FIELDS);
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{32}$/); // MD5 hex digest
  });

  // This is the actual security property the checksum exists for: Idram's
  // callback is a public URL, so the only thing stopping someone from
  // POSTing a fabricated "payment confirmed" request with a bigger amount
  // or a different bill number is that they can't produce a matching
  // checksum without the secret key. If tampering with any single field
  // didn't change the checksum, that field would be spoofable.
  it.each(Object.keys(FIELDS) as (keyof typeof FIELDS)[])("changes when %s is tampered with", (field) => {
    const original = computeConfirmationChecksum(FIELDS);
    const tampered = computeConfirmationChecksum({ ...FIELDS, [field]: FIELDS[field] + "x" });
    expect(tampered).not.toBe(original);
  });

  it("changes when the secret key changes", () => {
    const a = computeConfirmationChecksum(FIELDS);
    process.env.IDRAM_SECRET_KEY = "a-different-secret";
    const b = computeConfirmationChecksum(FIELDS);
    expect(a).not.toBe(b);
  });

  it("throws instead of silently computing a wrong checksum when the secret is missing", () => {
    delete process.env.IDRAM_SECRET_KEY;
    expect(() => computeConfirmationChecksum(FIELDS)).toThrow(/IDRAM_SECRET_KEY/);
  });
});

describe("isIdramConfigured / idramRecAccount", () => {
  const originalAccount = process.env.IDRAM_REC_ACCOUNT;
  const originalSecret = process.env.IDRAM_SECRET_KEY;

  afterEach(() => {
    if (originalAccount === undefined) delete process.env.IDRAM_REC_ACCOUNT;
    else process.env.IDRAM_REC_ACCOUNT = originalAccount;
    if (originalSecret === undefined) delete process.env.IDRAM_SECRET_KEY;
    else process.env.IDRAM_SECRET_KEY = originalSecret;
  });

  it("is false unless both env vars are set", () => {
    delete process.env.IDRAM_REC_ACCOUNT;
    delete process.env.IDRAM_SECRET_KEY;
    expect(isIdramConfigured()).toBe(false);

    process.env.IDRAM_REC_ACCOUNT = "100000114";
    expect(isIdramConfigured()).toBe(false); // secret still missing

    process.env.IDRAM_SECRET_KEY = "test-secret";
    expect(isIdramConfigured()).toBe(true);
  });

  it("idramRecAccount throws a clear error instead of returning undefined when unset", () => {
    delete process.env.IDRAM_REC_ACCOUNT;
    expect(() => idramRecAccount()).toThrow(/IDRAM_REC_ACCOUNT/);
  });
});
