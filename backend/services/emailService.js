import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('Email Service: Configured SMTP Mailer');
} else {
  console.log('Email Service: SMTP credentials not set. Running in mock logging mode.');
}

export async function sendEmail({ to, subject, html }) {
  const from = process.env.SMTP_FROM || 'noreply@mzcet.edu.in';
  
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(`Email Service: Sent to ${to}. MessageId: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Email Service: Error sending email:', error);
      return { error };
    }
  } else {
    console.log('\n========================================');
    console.log('            MOCK EMAIL SEND             ');
    console.log('========================================');
    console.log(`FROM   : ${from}`);
    console.log(`TO     : ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log('----------------------------------------');
    console.log(html.replace(/<[^>]*>/g, '\n').replace(/\n\s*\n/g, '\n').trim());
    console.log('========================================\n');
    return { mock: true };
  }
}
