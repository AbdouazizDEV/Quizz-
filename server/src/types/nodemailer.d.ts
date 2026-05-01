declare module 'nodemailer' {
  type MailPayload = {
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    html?: string;
  };

  export interface Transporter {
    sendMail(mail: MailPayload): Promise<unknown>;
  }

  type TransportConfig = {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: { user?: string; pass?: string };
  };

  function createTransport(config: TransportConfig): Transporter;

  const nodemailer: {
    createTransport: typeof createTransport;
  };

  export default nodemailer;
}
