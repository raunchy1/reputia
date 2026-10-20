import { describe, expect, it } from "vitest";
import { checkReply, replyTooLong } from "@/lib/ai/safety";

describe("checkReply", () => {
  it("passes a normal reply", () => {
    expect(checkReply("Gentile Luca, ci dispiace per l'attesa. La invitiamo a contattarci per approfondire.")).toEqual([]);
  });
  it("flags discounts, freebies and refunds", () => {
    expect(checkReply("La prossima volta le offriamo uno sconto del 10%")).toContain("compenso");
    expect(checkReply("Il dolce è in omaggio")).toContain("compenso");
    expect(checkReply("Provvederemo al rimborso")).toContain("rimborso");
  });
  it("flags admissions of liability", () => {
    expect(checkReply("È stata colpa nostra, ci scusiamo")).toContain("ammissione");
  });
  it("flags phone numbers and emails", () => {
    expect(checkReply("Ci chiami al 070 123 4567")).toContain("contatti");
    expect(checkReply("Scriva a info@trattoria.it")).toContain("contatti");
  });
});

describe("replyTooLong", () => {
  it("counts bytes, not characters", () => {
    expect(replyTooLong("a".repeat(4096))).toBe(false);
    expect(replyTooLong("è".repeat(2049))).toBe(true);
  });
});
