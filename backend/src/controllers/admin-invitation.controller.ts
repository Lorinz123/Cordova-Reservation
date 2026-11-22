import type { NextFunction, RequestHandler, Response } from "express";
import {
  createAdminInvitationSchema,
  invitationTokenSchema,
} from "../lib/validation/admin-invitation.validation.js";
import {
  acceptBarangayAdminInvitation,
  AdminInvitationError,
  inviteBarangayAdmin,
  previewAdminInvitation,
} from "../services/admin-invitation.service.js";

export const createAdminInvitationController: RequestHandler = async (req, res, next) => {
  const parsed = createAdminInvitationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid barangay admin invitation data.",
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const auth = res.locals.auth as { userId: string };
    const invitation = await inviteBarangayAdmin({ ...parsed.data, invitedBy: auth.userId });
    res.status(201).json({ message: "Invitation email sent.", data: invitation });
  } catch (error) {
    if (error instanceof AdminInvitationError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const confirmAdminInvitationPageController: RequestHandler = async (req, res, next) => {
  const parsed = invitationTokenSchema.safeParse({ token: req.query.token });
  if (!parsed.success) {
    res.status(400).type("html").send(renderMessagePage(
      "Invitation link is incomplete",
      "Open the full invitation link from your email. If it still doesn’t work, ask the super admin to send a new invitation.",
    ));
    return;
  }

  try {
    const invitation = await previewAdminInvitation(parsed.data.token);
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
    res.type("html").send(renderDocument(
      "Review your invitation",
      `<div class="icon-wrap" aria-hidden="true"><span>CR</span></div>
       <p class="eyebrow">BARANGAY ADMIN INVITATION</p>
       <h1>Review your invitation</h1>
       <p class="intro">You’ve been invited to help manage equipment reservations for your community.</p>
       <dl class="details">
         <div class="detail-row"><dt>Invited person</dt><dd>${escapeHtml(invitation.fullName)}</dd></div>
         <div class="detail-row"><dt>Barangay</dt><dd>${escapeHtml(invitation.barangayName)}</dd></div>
       </dl>
       <div class="notice"><strong>What accepting means</strong><p>Your existing portal account will become a Barangay Admin account for this barangay. This invitation can be accepted once and expires in 24 hours.</p></div>
       <form method="post" action="/api/admin-invitations/accept">
         <input type="hidden" name="token" value="${escapeHtml(parsed.data.token)}">
         <button type="submit">Accept invitation</button>
       </form>
       <p class="quiet">If you weren’t expecting this invitation, close this page. Your account won’t change unless you accept.</p>`,
    ));
  } catch (error) {
    sendInvitationError(error, res, next);
  }
};

export const acceptAdminInvitationController: RequestHandler = async (req, res, next) => {
  const parsed = invitationTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).type("html").send(renderMessagePage(
      "We couldn’t confirm this invitation",
      "The link is incomplete. Return to the invitation email and open the full link again.",
    ));
    return;
  }

  try {
    const accepted = await acceptBarangayAdminInvitation(parsed.data.token);
    res.setHeader("Cache-Control", "no-store");
    res.type("html").send(renderDocument(
      "Invitation accepted",
      `<div class="icon-wrap success" aria-hidden="true"><span>✓</span></div>
       <p class="eyebrow">INVITATION CONFIRMED</p>
       <h1>You’re now a Barangay Admin</h1>
       <p class="intro">Your account is ready to help manage reservations for your community.</p>
       <dl class="details">
         <div class="detail-row"><dt>Account</dt><dd>${escapeHtml(accepted.fullName)}</dd></div>
         <div class="detail-row"><dt>Barangay</dt><dd>${escapeHtml(accepted.barangayName)}</dd></div>
         <div class="detail-row"><dt>Role</dt><dd>Barangay Admin</dd></div>
       </dl>
       <div class="notice"><strong>Next step</strong><p>Sign in to the reservation portal with your existing account. If you’re already signed in, sign out and sign back in to refresh your access.</p></div>
       <p class="quiet">You can close this page now.</p>`,
    ));
  } catch (error) {
    sendInvitationError(error, res, next);
  }
};

function sendInvitationError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof AdminInvitationError) {
    res.status(error.statusCode).type("html").send(renderMessagePage(
      "This invitation can’t be used",
      `${escapeHtml(error.message)} If you still need access, ask the super admin to send a new invitation.`,
    ));
    return;
  }
  next(error);
}

function renderMessagePage(title: string, message: string) {
  return renderDocument(
    title,
    `<p class="eyebrow">INVITATION</p><h1>${escapeHtml(title)}</h1><p class="intro">${message}</p>`,
  );
}

function renderDocument(title: string, content: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f4f7f5">
  <title>${escapeHtml(title)} · Cordova Reservation Portal</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #17251e; background: #f4f7f5; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(ellipse at 50% 0%, #e5f3eb 0, #f4f7f5 52rem); }
    .page { width: min(100% - 32px, 600px); margin: 0 auto; padding: 54px 0 30px; }
    .brand { display: flex; align-items: center; gap: 11px; margin: 0 0 28px 4px; color: #30453a; font-size: 14px; letter-spacing: .01em; }
    .brand-mark { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 12px; background: #167548; color: white; font-size: 12px; font-weight: 800; letter-spacing: -.06em; }
    .brand-name { font-weight: 700; color: #17251e; }
    .card { overflow: hidden; border: 1px solid #e2eae5; border-radius: 22px; background: #fff; padding: clamp(26px, 6vw, 42px); box-shadow: 0 20px 60px rgba(31, 60, 43, .09); }
    .icon-wrap { display: grid; width: 52px; height: 52px; place-items: center; margin-bottom: 25px; border-radius: 16px; background: #e9f5ed; color: #167548; font-size: 16px; font-weight: 800; letter-spacing: -.06em; }
    .icon-wrap.success { background: #167548; color: #fff; font-size: 26px; }
    .eyebrow { margin: 0 0 10px; color: #167548; font-size: 11px; font-weight: 800; letter-spacing: .13em; }
    h1 { margin: 0; color: #17251e; font-size: clamp(27px, 6vw, 35px); line-height: 1.15; letter-spacing: -.04em; }
    .intro { margin: 15px 0 26px; color: #53645a; font-size: 16px; line-height: 1.65; }
    .details { margin: 0 0 20px; padding: 0; border: 1px solid #e8eeea; border-radius: 14px; background: #fbfcfb; }
    .detail-row { display: flex; justify-content: space-between; gap: 18px; padding: 16px 18px; }
    .detail-row + .detail-row { border-top: 1px solid #e8eeea; }
    dt { color: #65756b; font-size: 13px; }
    dd { margin: 0; color: #20342a; font-size: 14px; font-weight: 700; text-align: right; overflow-wrap: anywhere; }
    .notice { margin: 0 0 22px; padding: 16px 18px; border-left: 3px solid #7cba91; border-radius: 0 12px 12px 0; background: #f1f8f3; color: #32483a; font-size: 14px; line-height: 1.6; }
    .notice strong { display: block; margin-bottom: 4px; color: #203c2b; }
    .notice p { margin: 0; }
    form { margin: 0; }
    button { width: 100%; min-height: 52px; border: 0; border-radius: 12px; background: #167548; color: #fff; font: inherit; font-size: 15px; font-weight: 750; cursor: pointer; transition: background .15s ease, transform .15s ease; }
    button:hover { background: #105f3a; }
    button:active { transform: translateY(1px); }
    button:focus-visible { outline: 3px solid #90cda4; outline-offset: 3px; }
    .quiet { margin: 17px 0 0; color: #718078; font-size: 12px; line-height: 1.6; text-align: center; }
    .footer { margin: 22px 0 0; color: #87948c; font-size: 12px; text-align: center; }
    @media (max-width: 480px) { .page { padding-top: 28px; } .brand { margin-bottom: 18px; } .card { border-radius: 18px; } .detail-row { align-items: flex-start; flex-direction: column; gap: 5px; } dd { text-align: left; } }
    @media (prefers-reduced-motion: reduce) { button { transition: none; } }
  </style>
</head>
<body>
  <main class="page">
    <header class="brand"><span class="brand-mark" aria-hidden="true">CR</span><span class="brand-name">Cordova Reservation Portal</span></header>
    <section class="card">
      ${content}
    </section>
    <p class="footer">Secure role confirmation · Cordova Reservation Portal</p>
  </main>
</body>
</html>`;
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
