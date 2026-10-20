export const ROLES = ["member", "admin", "owner"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Titolare",
  admin: "Amministratore",
  member: "Collaboratore",
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/** True when `role` grants at least the privileges of `required`. Unknown roles grant nothing. */
export function hasRole(role: string, required: Role): boolean {
  if (!isRole(role)) return false;
  return ROLES.indexOf(role) >= ROLES.indexOf(required);
}
