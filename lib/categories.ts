import type { BusinessCategory } from "@/lib/generated/prisma/enums";

export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  RISTORANTE: "Ristorante",
  PIZZERIA: "Pizzeria",
  BAR: "Bar e caffetteria",
  HOTEL: "Hotel",
  BED_AND_BREAKFAST: "Bed & Breakfast",
  CASA_VACANZE: "Casa vacanze",
  PARRUCCHIERE: "Parrucchiere",
  BARBIERE: "Barbiere",
  CENTRO_ESTETICO: "Centro estetico",
  ALTRO: "Altra attività",
};
