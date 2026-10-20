import "dotenv/config";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { OrgContext } from "@/lib/session";

// Runs against the database in DATABASE_URL (the dev/test database, never production).
const run = process.env.DATABASE_URL ? describe : describe.skip;

run("tenant isolation", async () => {
  const { db } = await import("@/lib/db");
  const reviews = await import("@/lib/services/reviews");
  const locations = await import("@/lib/services/locations");
  const tag = randomUUID().slice(0, 8);
  const ctx = (orgId: string, userId: string): OrgContext => ({
    user: { id: userId, name: "Test", email: `${userId}@test.local` },
    organization: { id: orgId, name: orgId, slug: orgId },
    role: "owner",
  });
  let a: OrgContext, b: OrgContext, reviewA: string, locationA: string;

  beforeAll(async () => {
    for (const name of ["a", "b"]) {
      await db.user.create({ data: { id: `u-${name}-${tag}`, name, email: `${name}-${tag}@test.local`, emailVerified: true } });
      await db.organization.create({ data: { id: `o-${name}-${tag}`, name, slug: `o-${name}-${tag}` } });
      await db.member.create({ data: { id: `m-${name}-${tag}`, organizationId: `o-${name}-${tag}`, userId: `u-${name}-${tag}`, role: "owner" } });
    }
    a = ctx(`o-a-${tag}`, `u-a-${tag}`);
    b = ctx(`o-b-${tag}`, `u-b-${tag}`);
    const loc = await db.location.create({ data: { organizationId: a.organization.id, name: "Sede A" } });
    locationA = loc.id;
    const r = await db.review.create({
      data: { organizationId: a.organization.id, locationId: loc.id, source: "MOCK", externalId: "r1", authorName: "Cliente", rating: 2, comment: "Lento", reviewedAt: new Date() },
    });
    reviewA = r.id;
  });

  afterAll(async () => {
    await db.organization.deleteMany({ where: { id: { in: [a.organization.id, b.organization.id] } } });
    await db.user.deleteMany({ where: { id: { in: [a.user.id, b.user.id] } } });
  });

  it("owner sees their own review", async () => {
    expect(await reviews.getReview(a, reviewA)).not.toBeNull();
    expect((await reviews.listReviews(a, { status: "tutte", sort: "recenti" })).map((r) => r.id)).toContain(reviewA);
  });

  it("another tenant cannot read it", async () => {
    expect(await reviews.getReview(b, reviewA)).toBeNull();
    expect(await reviews.listReviews(b, { status: "tutte", sort: "recenti" })).toHaveLength(0);
    expect((await reviews.reviewStats(b)).total).toBe(0);
  });

  it("another tenant cannot modify it", async () => {
    await expect(reviews.saveDraft(b, reviewA, "testo")).rejects.toThrow();
    await expect(reviews.setStatus(b, reviewA, "IGNORED")).rejects.toThrow();
    await expect(reviews.generateDraft(b, reviewA, {})).rejects.toThrow();
    await expect(reviews.publishReply(b, reviewA, "testo")).rejects.toThrow();
    await expect(locations.updateLocation(b, locationA, { name: "Hack" })).rejects.toThrow();
    const after = await db.review.findUniqueOrThrow({ where: { id: reviewA } });
    expect(after.status).toBe("NEW");
    expect(after.replyText).toBeNull();
    expect((await db.location.findUniqueOrThrow({ where: { id: locationA } })).name).toBe("Sede A");
  });

  it("a collaborator cannot publish", async () => {
    await expect(reviews.publishReply({ ...a, role: "member" }, reviewA, "testo")).rejects.toThrow(/permessi/);
  });
});
