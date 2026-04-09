import nodemailer from "nodemailer";

function getEmailConfig() {
  const host = process.env.SMTP_HOST;
  const portValue = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !portValue || !user || !pass || !from) {
    throw new Error(
      "Configuração de email incompleta. Defina SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e SMTP_FROM.",
    );
  }

  const port = Number(portValue);

  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT inválido");
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from,
  };
}

export async function sendVerificationCodeEmail(email: string, code: string) {
  const config = getEmailConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Código de verificação do seu cadastro",
    text: `Seu código de verificação é: ${code}. Ele expira em 10 minutos.`,
    html: `<p>Seu código de verificação é: <strong>${code}</strong></p><p>Ele expira em 10 minutos.</p>`,
  });
}
