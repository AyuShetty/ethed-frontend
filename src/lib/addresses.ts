export const PM_ADDRESS = (process.env.NEXT_PUBLIC_PAYMENT_MANAGER_ADDRESS || "").trim();
export const TREASURY_ADDRESS = (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "").trim();
// Optional: x402 router if you want to call directly from FE (usually via PaymentManager)
export const X402_ADDRESS = (process.env.NEXT_PUBLIC_X402_ADDRESS || "").trim();