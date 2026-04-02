const nodemailer = require("nodemailer");

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function fmt(n) {
  return n.toLocaleString("da-DK") + " kr";
}

async function sendConfirmationEmail(order) {
  try {
    const transporter = createTransporter();

    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8f0e9;color:#1a2a1c;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8f0e9;text-align:center;color:#6b7f6e;">${item.qty}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8f0e9;text-align:right;color:#c46a23;font-weight:700;">${fmt(item.priceNum * item.qty)}</td>
      </tr>
    `).join("");

    const html = `
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f3;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f3;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#192A1C;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#f4f9f5;letter-spacing:0.02em;">Lones Farver</h1>
              <p style="margin:6px 0 0;font-size:12px;letter-spacing:0.18em;color:rgba(244,249,245,0.55);text-transform:uppercase;">Ordrebekræftelse</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;font-size:14px;color:#6b7f6e;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Ordre #${order.orderNumber}</p>
              <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#1a2a1c;">Tak for din bestilling, ${order.customer.name.split(" ")[0]}!</h2>
              <p style="margin:0 0 28px;font-size:15px;color:#4a5c4e;line-height:1.7;">Din bestilling er bekræftet og klar til afsendelse, så snart betaling er modtaget via MobilePay.</p>

              <!-- Order items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8f0e9;border-radius:6px;overflow:hidden;margin-bottom:24px;">
                <thead>
                  <tr style="background:#e8f0e9;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;letter-spacing:0.14em;color:#2e5535;text-transform:uppercase;font-weight:700;">Produkt</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;letter-spacing:0.14em;color:#2e5535;text-transform:uppercase;font-weight:700;">Antal</th>
                    <th style="padding:10px 12px;text-align:right;font-size:11px;letter-spacing:0.14em;color:#2e5535;text-transform:uppercase;font-weight:700;">Pris</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:10px 12px;text-align:right;font-size:13px;color:#6b7f6e;">Forsendelse:</td>
                    <td style="padding:10px 12px;text-align:right;font-size:13px;color:#1a2a1c;">${order.shipping === 0 ? "Gratis" : fmt(order.shipping)}</td>
                  </tr>
                  <tr style="background:#f4f6f3;">
                    <td colspan="2" style="padding:12px;text-align:right;font-size:15px;font-weight:700;color:#1a2a1c;">Total:</td>
                    <td style="padding:12px;text-align:right;font-size:17px;font-weight:700;color:#305c38;">${fmt(order.total)}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- MobilePay box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2fb;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#2d3a6b;">Betal via MobilePay</p>
                    <p style="margin:0;font-size:14px;color:#4a5490;">Send <strong>${fmt(order.total)}</strong> til <strong>#89440</strong> og skriv: <strong>${order.customer.name}</strong></p>
                  </td>
                </tr>
              </table>

              <!-- Delivery address -->
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;color:#6b7f6e;text-transform:uppercase;font-weight:700;">Leveringsadresse</p>
              <p style="margin:0 0 28px;font-size:14px;color:#4a5c4e;line-height:1.7;">
                ${order.customer.name}<br>
                ${order.customer.address}<br>
                ${order.customer.zip} ${order.customer.city}<br>
                ${order.customer.phone}
                ${order.customer.note ? "<br><em>" + order.customer.note + "</em>" : ""}
              </p>

              <p style="margin:0;font-size:14px;color:#6b7f6e;line-height:1.7;">Spørgsmål? Kontakt Lone på <a href="mailto:kontakt@lonesfarver.dk" style="color:#305c38;">kontakt@lonesfarver.dk</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f6f3;padding:20px 40px;text-align:center;border-top:1px solid #e8f0e9;">
              <p style="margin:0;font-size:11px;color:#9aaa9c;letter-spacing:0.06em;">© 2026 Lones Farver</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: order.customer.email,
      subject: `Ordrebekræftelse #${order.orderNumber} – Lones Farver`,
      html,
    });

    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendConfirmationEmail };
