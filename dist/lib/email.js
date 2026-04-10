"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
async function sendVerificationEmail(to, code) {
    await resend.emails.send({
        from: FROM,
        to,
        subject: 'Código de verificação — AnestLink',
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Bem-vindo ao AnestLink</h2>
        <p>Use o código abaixo para verificar seu email:</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #4f46e5;
          padding: 24px;
          background: #f5f5ff;
          border-radius: 8px;
          text-align: center;
          margin: 24px 0;
        ">
          ${code}
        </div>
        <p style="color: #666;">Este código expira em 24 horas.</p>
        <p style="color: #666;">Se você não criou uma conta no AnestLink, ignore este email.</p>
      </div>
    `,
    });
}
async function sendPasswordResetEmail(to, code) {
    await resend.emails.send({
        from: FROM,
        to,
        subject: 'Redefinição de senha — AnestLink',
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Redefinição de senha</h2>
        <p>Use o código abaixo para redefinir sua senha:</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #4f46e5;
          padding: 24px;
          background: #f5f5ff;
          border-radius: 8px;
          text-align: center;
          margin: 24px 0;
        ">
          ${code}
        </div>
        <p style="color: #666;">Este código expira em 1 hora.</p>
        <p style="color: #666;">Se você não solicitou a redefinição, ignore este email.</p>
      </div>
    `,
    });
}
