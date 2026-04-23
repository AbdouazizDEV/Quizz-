import nodemailer, { type Transporter } from 'nodemailer';

import { getEnv } from './env.js';

let cached: Transporter | null = null;

function hasSmtpConfig(): boolean {
  const env = getEnv();
  return Boolean(
    env.SMTP_HOST?.trim() &&
      env.SMTP_PORT &&
      env.SMTP_USER?.trim() &&
      env.SMTP_PASS?.trim() &&
      env.SMTP_FROM?.trim(),
  );
}

function getTransporter(): Transporter {
  if (cached) return cached;
  const env = getEnv();
  cached = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: Boolean(env.SMTP_SECURE),
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  return cached;
}

function otpTemplate(code: string): { subject: string; text: string; html: string } {
  const subject = 'Quizz+ · Code OTP de réinitialisation';
  const text =
    `Bonjour,\n\n` +
    `Votre code OTP Quizz+ est: ${code}\n\n` +
    `Ce code expire dans 10 minutes.\n` +
    `Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.\n\n` +
    `— Equipe Quizz+`;
  const html = `
    <div style="background:#f6f8ff;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e9edff;">
        <tr>
          <td style="background:linear-gradient(90deg,#4f46e5,#6d28d9);padding:18px 24px;color:#ffffff;">
            <div style="font-size:20px;font-weight:800;letter-spacing:.3px;">Quizz+</div>
            <div style="font-size:13px;opacity:.92;margin-top:2px;">Réinitialisation du mot de passe</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;color:#1f2937;">
            <p style="margin:0 0 10px;font-size:15px;">Bonjour,</p>
            <p style="margin:0 0 14px;font-size:15px;line-height:1.5;">
              Utilisez ce code OTP pour continuer la réinitialisation :
            </p>
            <div style="display:inline-block;padding:12px 18px;background:#eef2ff;border:1px dashed #6366f1;border-radius:12px;">
              <span style="font-size:32px;letter-spacing:10px;font-weight:800;color:#4338ca;">${code}</span>
            </div>
            <p style="margin:14px 0 0;font-size:13px;color:#6b7280;">
              Ce code expire dans <strong>10 minutes</strong>.
            </p>
            <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
              Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 24px;background:#f9fafb;border-top:1px solid #eef2f7;font-size:12px;color:#6b7280;">
            — Equipe Quizz+
          </td>
        </tr>
      </table>
      <div style="max-width:560px;margin:10px auto 0;color:#94a3b8;font-size:11px;text-align:center;">
        Message automatique, merci de ne pas répondre à cet e-mail.
      </div>
    </div>
  `;
  return { subject, text, html };
}

export async function sendPasswordResetOtpEmail(toEmail: string, code: string): Promise<void> {
  if (!hasSmtpConfig()) {
    throw new Error('SMTP non configuré (SMTP_HOST/PORT/USER/PASS/FROM).');
  }
  const env = getEnv();
  const message = otpTemplate(code);
  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to: toEmail,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}

