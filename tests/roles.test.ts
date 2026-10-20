import { describe, expect, it } from "vitest";
import { hasRole } from "@/lib/roles";

describe("hasRole", () => {
  it("orders member < admin < owner", () => {
    expect(hasRole("owner", "admin")).toBe(true);
    expect(hasRole("admin", "admin")).toBe(true);
    expect(hasRole("member", "admin")).toBe(false);
    expect(hasRole("admin", "owner")).toBe(false);
  });
  it("grants nothing to unknown roles", () => {
    expect(hasRole("superuser", "member")).toBe(false);
    expect(hasRole("", "member")).toBe(false);
  });
});
