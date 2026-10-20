"use server";
import { redirect } from "next/navigation";
import { runAction, type ActionState } from "@/lib/actions";
import { createCheckout, createPortal } from "@/lib/billing/service";
import { requireOrg } from "@/lib/session";

export async function checkoutAction(): Promise<ActionState> {
  let url = "";
  const result = await runAction(async () => {
    url = await createCheckout(await requireOrg("owner"));
  });
  if (url) redirect(url);
  return result;
}

export async function portalAction(): Promise<ActionState> {
  let url = "";
  const result = await runAction(async () => {
    url = await createPortal(await requireOrg("owner"));
  });
  if (url) redirect(url);
  return result;
}
