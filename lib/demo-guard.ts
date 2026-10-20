export function canUseDemoApi(){return process.env.NODE_ENV !== "production" && process.env.DEMO_API_ENABLED === "true";}
