import { Resend } from "resend";

// Server-only — never imported from client components
// Lazy initialisation so build doesn't fail without env vars
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const CONTACT_TO = "dave@darbury.com";
export const CONTACT_FROM = "noreply@darbury.com";
