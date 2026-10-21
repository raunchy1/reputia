import "server-only";
import { cookies } from "next/headers";

export const LOCATION_COOKIE = "reputia_sede";
export const SIDEBAR_COOKIE = "reputia_sidebar";

/**
 * The location the user is focused on, or null for "all locations". The cookie is
 * only a preference: the id is accepted only if it belongs to the caller's own list.
 */
export async function activeLocationId(ownLocationIds: string[]): Promise<string | null> {
  const value = (await cookies()).get(LOCATION_COOKIE)?.value;
  return value && ownLocationIds.includes(value) ? value : null;
}

export async function sidebarCollapsed(): Promise<boolean> {
  return (await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed";
}
