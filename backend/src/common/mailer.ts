import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

export const mailShell = (title: string, body: string) =>
  `<div style="background:#050505;color:#fff;padding:32px;font-family:Georgia,serif">
    <h2 style="color:#C99A45;letter-spacing:.2em">MIRZA WATCHES</h2>
    <h3>${title}</h3>
    <div style="font-family:Arial,sans-serif;color:#ddd">${body}</div>
  </div>`;

@Injectable()
export class Mailer {
  async send(to: string, subject: string, title: string, body: string) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.log(`[mail:dev] to=${to} | ${subject}`);
      return;
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: process.env.MAIL_FROM || 'MIRZA WATCHES <onboarding@resend.dev>',
      to,
      subject,
      html: mailShell(title, body),
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
