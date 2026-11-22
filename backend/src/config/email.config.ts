import "dotenv/config";
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_APP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

export async function sendBarangayAdminInvitationEmail(input: {
  to: string;
  fullName: string;
  barangayName: string;
  token: string;
}) {
  if (!smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
    throw new Error("Email delivery is not configured. Set the SMTP variables in .env.");
  }

  const backendUrl = (process.env.BACKEND_URL || "http://localhost:7000").replace(/\/$/, "");
  const confirmationUrl = `${backendUrl}/api/admin-invitations/confirm?token=${encodeURIComponent(input.token)}`;
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
    auth: { user: smtpUser, pass: smtpPassword },
  });

  const delivery = await transporter.sendMail({
    from: smtpFrom,
    to: input.to,
    subject: `Invitation to administer ${input.barangayName}`,
    text: `Hello ${input.fullName},\n\nYou have been invited to become the barangay admin for ${input.barangayName}. Confirm this invitation using this link (valid for 24 hours):\n${confirmationUrl}\n\nIf you did not expect this invitation, you can ignore this email.`,
    html: `<!doctype html><html><body><h1>Barangay admin invitation</h1><p>Hello ${escapeHtml(input.fullName)},</p><p>You have been invited to become the barangay admin for <strong>${escapeHtml(input.barangayName)}</strong>.</p><p><a href="${confirmationUrl}">Review and accept invitation</a></p><p>This link expires in 24 hours. If you did not expect this invitation, you can ignore this email.</p></body></html>`,
  });
  if (!delivery.accepted.length) {
    throw new Error("The email provider did not accept the invitation recipient.");
  }
}

export async function sendResidentVerificationEmail(input: {
  to: string;
  fullName: string;
  token: string;
}) {
  const transporter = createTransporter();
  const backendUrl = (process.env.BACKEND_URL || "http://localhost:7000").replace(/\/$/, "");
  const verificationUrl = `${backendUrl}/api/auth/verify-email/confirm?token=${encodeURIComponent(input.token)}`;

  const delivery = await transporter.sendMail({
    from: smtpFrom,
    to: input.to,
    subject: "Verify your email for Cordova Reservation Portal",
    text: `Hello ${input.fullName},\n\nVerify your email to finish setting up your resident account and sign in:\n${verificationUrl}\n\nThis link is valid for 24 hours. If you did not create this account, you can ignore this email.`,
    html: `<!doctype html><html><body><h1>Verify your email</h1><p>Hello ${escapeHtml(input.fullName)},</p><p>Verify your email to finish setting up your resident account and sign in.</p><p><a href="${verificationUrl}">Verify email</a></p><p>This link is valid for 24 hours. If you did not create this account, you can ignore this email.</p></body></html>`,
  });
  if (!delivery.accepted.length) {
    throw new Error("The email provider did not accept the verification recipient.");
  }
}

function createTransporter() {
  if (!smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
    throw new Error("Email delivery is not configured. Set the SMTP variables in .env.");
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465 || process.env.SMTP_SECURE === "true",
    auth: { user: smtpUser, pass: smtpPassword },
  });
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
