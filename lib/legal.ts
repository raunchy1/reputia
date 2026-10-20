// Company details for legal pages and the footer. Set them in the environment
// before going live; pages show a clear notice while they are missing.
export const LEGAL = {
  company: process.env.LEGAL_COMPANY_NAME ?? "",
  vat: process.env.LEGAL_VAT_NUMBER ?? "",
  address: process.env.LEGAL_ADDRESS ?? "",
  email: process.env.LEGAL_CONTACT_EMAIL ?? "",
  pec: process.env.LEGAL_PEC ?? "",
};

export const legalComplete = Boolean(LEGAL.company && LEGAL.vat && LEGAL.address && LEGAL.email);

/** Parent company shown in the footer ("Un prodotto …"). */
export const PRODUCT_OF = { name: process.env.PRODUCT_OF_NAME ?? "", url: process.env.PRODUCT_OF_URL ?? "" };

export const DEMO_BOOKING_URL = process.env.DEMO_BOOKING_URL ?? "";
