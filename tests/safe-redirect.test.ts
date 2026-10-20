import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/safe-redirect";

describe("safeNext", () => {
  it("allows relative paths", () => expect(safeNext("/invito/abc")).toBe("/invito/abc"));
  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeNext("https://evil.example")).toBe("/app");
    expect(safeNext("//evil.example")).toBe("/app");
    expect(safeNext("/\\evil.example")).toBe("/app");
    expect(safeNext(null, "/onboarding")).toBe("/onboarding");
  });
});
