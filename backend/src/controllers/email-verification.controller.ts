import type { RequestHandler } from "express";
import { verificationTokenSchema } from "../lib/validation/auth.validation.js";
import { AuthServiceError, verifyResidentEmail } from "../services/auth.service.js";

export const emailVerificationPageController: RequestHandler = (req, res) => {
  const parsed = verificationTokenSchema.safeParse({ token: req.query.token });
  if (!parsed.success) {
    res.status(400).type("html").send(messagePage(
      "Verification link is incomplete",
      "Open the full verification link from your email, or request a new verification email from the sign-in page.",
    ));
    return;
  }

  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-store");
  res.type("html").send(documentPage(
    "Verify your email",
    `<div class="mark" aria-hidden="true">CR</div>
     <p class="eyebrow">ACCOUNT VERIFICATION</p>
     <h1>Verify your email</h1>
     <p class="intro">Confirm that you can access this email address to finish setting up your resident account.</p>
     <div class="note"><strong>What happens next?</strong><p>After verification, you can sign in with your email and password as usual.</p></div>
     <form method="post" action="/api/auth/verify-email/confirm">
       <input type="hidden" name="token" value="${escapeHtml(parsed.data.token)}">
       <button type="submit">Verify email</button>
     </form>
     <p class="quiet">If you didn’t create this account, close this page. Nothing changes unless you verify.</p>`,
  ));
};

export const verifyEmailController: RequestHandler = async (req, res, next) => {
  const parsed = verificationTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).type("html").send(messagePage(
      "We couldn’t verify this email",
      "The verification link is incomplete. Open the full link from your email and try again.",
    ));
    return;
  }

  try {
    await verifyResidentEmail(parsed.data.token);
    res.setHeader("Cache-Control", "no-store");
    res.type("html").send(documentPage(
      "Email verified",
      `<div class="mark success" aria-hidden="true">✓</div>
       <p class="eyebrow">VERIFICATION COMPLETE</p>
       <h1>Your email is verified</h1>
       <p class="intro">Your resident account is ready. Sign in with the email and password you used to register.</p>
       <p class="quiet">You only need to verify this email once.</p>`,
    ));
  } catch (error) {
    if (error instanceof AuthServiceError) {
      res.status(error.statusCode).type("html").send(messagePage(
        "This verification link can’t be used",
        `${escapeHtml(error.message)} You can request a new verification email from the sign-in page.`,
      ));
      return;
    }
    next(error);
  }
};

function messagePage(title: string, message: string) {
  return documentPage(title, `<p class="eyebrow">ACCOUNT VERIFICATION</p><h1>${escapeHtml(title)}</h1><p class="intro">${message}</p>`);
}

function documentPage(title: string, content: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f4f7f5"><title>${escapeHtml(title)} · Cordova Reservation Portal</title>
<style>
:root{color-scheme:light;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17251e;background:#f4f7f5}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 50% 0%,#e5f3eb 0,#f4f7f5 52rem)}.page{width:min(100% - 32px,560px);margin:0 auto;padding:54px 0 30px}.brand{display:flex;align-items:center;gap:11px;margin:0 0 28px 4px;color:#30453a;font-size:14px;font-weight:700}.brand-mark{display:grid;width:38px;height:38px;place-items:center;border-radius:12px;background:#167548;color:#fff;font-size:12px;font-weight:800}.card{border:1px solid #e2eae5;border-radius:22px;background:#fff;padding:clamp(26px,6vw,42px);box-shadow:0 20px 60px rgba(31,60,43,.09)}.mark{display:grid;width:52px;height:52px;place-items:center;margin-bottom:25px;border-radius:16px;background:#e9f5ed;color:#167548;font-size:16px;font-weight:800}.mark.success{background:#167548;color:#fff;font-size:26px}.eyebrow{margin:0 0 10px;color:#167548;font-size:11px;font-weight:800;letter-spacing:.13em}h1{margin:0;color:#17251e;font-size:clamp(27px,6vw,35px);line-height:1.15;letter-spacing:-.04em}.intro{margin:15px 0 24px;color:#53645a;font-size:16px;line-height:1.65}.note{margin:0 0 22px;padding:16px 18px;border-left:3px solid #7cba91;border-radius:0 12px 12px 0;background:#f1f8f3;color:#32483a;font-size:14px;line-height:1.6}.note strong{display:block;margin-bottom:4px;color:#203c2b}.note p{margin:0}button{width:100%;min-height:52px;border:0;border-radius:12px;background:#167548;color:#fff;font:inherit;font-size:15px;font-weight:750;cursor:pointer}button:hover{background:#105f3a}button:focus-visible{outline:3px solid #90cda4;outline-offset:3px}.quiet{margin:17px 0 0;color:#718078;font-size:12px;line-height:1.6;text-align:center}.footer{margin:22px 0 0;color:#87948c;font-size:12px;text-align:center}@media(max-width:480px){.page{padding-top:28px}.brand{margin-bottom:18px}.card{border-radius:18px}}
</style></head><body><main class="page"><header class="brand"><span class="brand-mark" aria-hidden="true">CR</span><span>Cordova Reservation Portal</span></header><section class="card">${content}</section><p class="footer">Secure account verification · Cordova Reservation Portal</p></main></body></html>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}
