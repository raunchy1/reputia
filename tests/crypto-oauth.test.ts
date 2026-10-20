import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret-123";
});

describe("token encryption", () => {
  it("round-trips and uses a fresh IV each time", async () => {
    const { encrypt, decrypt } = await import("@/lib/crypto");
    const a = encrypt("ya29.token");
    expect(a).not.toBe(encrypt("ya29.token"));
    expect(decrypt(a)).toBe("ya29.token");
  });
  it("rejects tampered ciphertext", async () => {
    const { encrypt, decrypt } = await import("@/lib/crypto");
    const buf = Buffer.from(encrypt("secret"), "base64");
    buf[buf.length - 1] ^= 1;
    expect(() => decrypt(buf.toString("base64"))).toThrow();
  });
});

describe("OAuth state", () => {
  it("verifies only with the matching nonce and untampered payload", async () => {
    const { signState, verifyState } = await import("@/lib/google/oauth");
    const { state, nonce } = signState("org1", "user1");
    expect(verifyState(state, nonce)).toEqual({ orgId: "org1", userId: "user1" });
    expect(verifyState(state, "other")).toBeNull();
    expect(verifyState(state, undefined)).toBeNull();
    expect(verifyState(state.replace("org1", "org2"), nonce)).toBeNull();
  });
});
