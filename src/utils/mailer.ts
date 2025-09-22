import nodemailer, { Transporter } from 'nodemailer';

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{ filename: string; path?: string; content?: any; contentType?: string }>
};

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  // Support both SMTP_PASSWORD and SMTP_PASS
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  // If SMTP_SECURE not provided, infer from port (465 => true)
  const secure = process.env.SMTP_SECURE !== undefined
    ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
    : port === 465;
  const service = process.env.SMTP_SERVICE; // optional e.g. 'gmail'

  if ((!service && (!host || !port)) || !user || !pass) {
    throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_PORT (or SMTP_SERVICE), SMTP_USER, SMTP_PASSWORD/SMTP_PASS.');
  }

  const baseOptions: any = service ? { service } : { host, port, secure };

  cachedTransporter = nodemailer.createTransport({
    ...baseOptions,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  return cachedTransporter;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER as string;

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    cc: options.cc,
    bcc: options.bcc,
    attachments: options.attachments,
  });
}

export function verifyEmailTransport(): Promise<void> {
  const transporter = getTransporter();
  return transporter.verify();
}


