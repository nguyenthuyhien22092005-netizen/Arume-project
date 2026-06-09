const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// ─── Shared layout wrapper ─────────────────────────────────────────────────
const layout = (bodyHtml) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:48px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;background:#faf8f5;border:1px solid #e2d9cc;border-radius:2px;overflow:hidden;">

        <!-- TOP ORNAMENT -->
        <tr>
          <td style="background:#0f0d0b;padding:0;height:3px;font-size:0;line-height:0;">
            <div style="height:3px;background:linear-gradient(90deg,#0f0d0b 0%,#c9a96e 30%,#e8d5a3 50%,#c9a96e 70%,#0f0d0b 100%);"></div>
          </td>
        </tr>

        <!-- HEADER -->
        <tr>
          <td style="background:#0f0d0b;padding:40px 48px 32px;text-align:center;">
            <p style="margin:0 0 6px;color:#c9a96e;font-size:9px;letter-spacing:6px;text-transform:uppercase;font-family:'Georgia',serif;">— Fine Jewelry —</p>
            <h1 style="margin:0;color:#f5f0e8;font-size:34px;font-weight:400;letter-spacing:12px;text-transform:uppercase;font-family:'Georgia',serif;">ARUME</h1>
            <p style="margin:10px 0 0;color:#6b5f4e;font-size:8px;letter-spacing:4px;text-transform:uppercase;">Est. 2024 · Hà Nội</p>
          </td>
        </tr>

        <!-- GOLD DIVIDER -->
        <tr>
          <td style="background:#0f0d0b;padding:0 48px 36px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-top:1px solid #3a2e1e;width:40%;font-size:0;">&nbsp;</td>
                <td style="padding:0 16px;color:#c9a96e;font-size:14px;white-space:nowrap;">✦</td>
                <td style="border-top:1px solid #3a2e1e;width:40%;font-size:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        ${bodyHtml}

        <!-- FOOTER -->
        <tr>
          <td style="background:#0f0d0b;padding:32px 48px;text-align:center;border-top:1px solid #1e1a14;">
            <p style="margin:0 0 6px;color:#c9a96e;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Arume Fine Jewelry</p>
            <p style="margin:0 0 16px;color:#4a3f30;font-size:11px;letter-spacing:1px;">56 Đường Láng, Hà Nội &nbsp;·&nbsp; care@arume.com &nbsp;·&nbsp; +84 123 456 789</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-top:1px solid #2a2218;font-size:0;">&nbsp;</td>
              </tr>
            </table>
            <p style="margin:14px 0 0;color:#3a3025;font-size:10px;letter-spacing:1px;">© ${new Date().getFullYear()} Arume Fine Jewelry · Mọi quyền được bảo lưu</p>
            <p style="margin:4px 0 0;color:#2e2518;font-size:10px;font-style:italic;">Email được gửi tự động, vui lòng không phản hồi trực tiếp.</p>
          </td>
        </tr>

        <!-- BOTTOM ORNAMENT -->
        <tr>
          <td style="height:3px;padding:0;font-size:0;line-height:0;">
            <div style="height:3px;background:linear-gradient(90deg,#f0ede8 0%,#c9a96e 30%,#e8d5a3 50%,#c9a96e 70%,#f0ede8 100%);"></div>
          </td>
        </tr>

      </table>

      <!-- Sub-footer -->
      <p style="margin:20px 0 0;color:#a89880;font-size:10px;letter-spacing:1px;text-align:center;">Bạn nhận được email này vì đã tương tác với ARUME Fine Jewelry.</p>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Section helper ────────────────────────────────────────────────────────
const section = (html) => `
<tr><td style="padding:40px 48px;">${html}</td></tr>
<tr><td style="padding:0 48px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="border-top:1px solid #e2d9cc;font-size:0;">&nbsp;</td>
      <td style="padding:0 12px;color:#c9a96e;font-size:10px;white-space:nowrap;">✦</td>
      <td style="border-top:1px solid #e2d9cc;font-size:0;">&nbsp;</td>
    </tr>
  </table>
</td></tr>`;

const heading = (text) =>
  `<h2 style="margin:0 0 20px;color:#0f0d0b;font-size:22px;font-weight:400;letter-spacing:3px;text-transform:uppercase;font-family:'Georgia',serif;">${text}</h2>`;

const bodyText = (text) =>
  `<p style="margin:0 0 14px;color:#4a3f30;font-size:14px;line-height:1.9;letter-spacing:0.3px;">${text}</p>`;

const goldBox = (inner) =>
  `<div style="background:#fdf9f2;border:1px solid #c9a96e;border-radius:1px;padding:28px 32px;margin:24px 0;text-align:center;">${inner}</div>`;

const label = (text) =>
  `<p style="margin:0 0 10px;color:#a08050;font-size:9px;letter-spacing:4px;text-transform:uppercase;">${text}</p>`;

const bigCode = (text) =>
  `<p style="margin:0;color:#0f0d0b;font-size:36px;letter-spacing:10px;font-family:'Courier New',monospace;font-weight:700;">${text}</p>`;

const infoRow = (key, val) =>
  `<tr>
    <td style="padding:10px 16px;background:#f5f1eb;border-bottom:1px solid #e8e0d4;color:#8a7560;font-size:10px;letter-spacing:2px;text-transform:uppercase;width:30%;vertical-align:top;">${key}</td>
    <td style="padding:10px 16px;background:#faf8f5;border-bottom:1px solid #e8e0d4;color:#2e2518;font-size:13px;line-height:1.6;">${val}</td>
  </tr>`;

// ─── 1. Gửi OTP Quên mật khẩu ─────────────────────────────────────────────
const sendForgotPasswordEmail = async (toEmail, userName, otpCode) => {
    const transporter = createTransporter();
    const body = `
      ${section(`
        ${heading('Đặt lại mật khẩu')}
        ${bodyText(`Kính gửi <strong style="color:#0f0d0b;">${userName}</strong>,`)}
        ${bodyText(`Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <em>${toEmail}</em>. Vui lòng sử dụng mã xác nhận bên dưới để tiếp tục.`)}
        ${goldBox(`
          ${label('Mã xác nhận của bạn')}
          ${bigCode(otpCode)}
          <p style="margin:14px 0 0;color:#c0392b;font-size:11px;letter-spacing:1px;">⏱ &nbsp;Hiệu lực trong <strong>15 phút</strong></p>
        `)}
        <div style="background:#fdf5f5;border-left:2px solid #c0392b;padding:14px 18px;margin-top:20px;">
          <p style="margin:0;color:#7a3030;font-size:12px;line-height:1.7;letter-spacing:0.3px;">⚠ &nbsp;Vì lý do bảo mật, vui lòng không chia sẻ mã này với bất kỳ ai. ARUME sẽ không bao giờ yêu cầu mã xác nhận qua điện thoại.</p>
        </div>
        <p style="margin:20px 0 0;color:#8a7560;font-size:12px;line-height:1.7;font-style:italic;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email — tài khoản của bạn vẫn được bảo mật hoàn toàn.</p>
      `)}
    `;
    await transporter.sendMail({
        from: `"Arume Fine Jewelry" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Mã xác nhận đặt lại mật khẩu · ARUME`,
        html: layout(body),
    });
    console.log(`[EMAIL] OTP → ${toEmail}`);
};

// ─── 2. Xác nhận đơn hàng ─────────────────────────────────────────────────
const sendOrderConfirmationEmail = async (toEmail, order) => {
    const transporter = createTransporter();
    const { shippingAddress, items, totalPrice, originalPrice, discountAmount, couponCode, orderCode, paymentMethod, createdAt } = order;

    const paymentMethodMap = {
        cod: 'Thanh toán khi nhận hàng (COD)',
        bank: 'Chuyển khoản ngân hàng',
        momo: 'Ví MoMo',
        ewallet: 'Ví điện tử',
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    const orderDate = new Date(createdAt).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

    const itemRows = items.map(item => {
        const name = item.product?.name || 'Sản phẩm';
        const img = item.product?.image
            ? `<img src="${item.product.image}" width="56" height="56" style="object-fit:cover;border:1px solid #e2d9cc;display:block;"/>`
            : `<div style="width:56px;height:56px;background:#f0ede8;display:flex;align-items:center;justify-content:center;font-size:22px;">💍</div>`;
        return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #ede8e0;vertical-align:top;width:68px;">${img}</td>
          <td style="padding:14px 0 14px 14px;border-bottom:1px solid #ede8e0;vertical-align:top;">
            <p style="margin:0 0 4px;color:#0f0d0b;font-size:13px;font-weight:600;letter-spacing:0.5px;">${name}</p>
            ${item.size ? `<p style="margin:0 0 3px;color:#8a7560;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Size: ${item.size}</p>` : ''}
            <p style="margin:0;color:#a08050;font-size:11px;letter-spacing:1px;">Số lượng: ${item.quantity}</p>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #ede8e0;vertical-align:top;text-align:right;white-space:nowrap;">
            <p style="margin:0;color:#0f0d0b;font-size:13px;font-weight:600;">${fmt(item.price * item.quantity)}</p>
            ${item.quantity > 1 ? `<p style="margin:3px 0 0;color:#b0a090;font-size:11px;">${fmt(item.price)} / cái</p>` : ''}
          </td>
        </tr>`;
    }).join('');

    const body = `
      ${section(`
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#f0faf0;border:1px solid #c3e0c3;border-radius:1px;padding:10px 24px;">
            <p style="margin:0;color:#2d6a2d;font-size:11px;letter-spacing:3px;text-transform:uppercase;">✓ &nbsp;Đặt hàng thành công</p>
          </div>
        </div>
        ${heading('Xác nhận đơn hàng')}
        ${bodyText(`Cảm ơn bạn đã tin tưởng lựa chọn <strong style="color:#0f0d0b;">ARUME Fine Jewelry</strong>. Chúng tôi đã nhận được đơn hàng và sẽ xử lý trong thời gian sớm nhất.`)}
        ${goldBox(`
          ${label('Mã đơn hàng')}
          <p style="margin:0 0 8px;color:#0f0d0b;font-size:28px;letter-spacing:6px;font-family:'Courier New',monospace;font-weight:700;">${orderCode}</p>
          <p style="margin:0;color:#8a7560;font-size:11px;letter-spacing:1px;">Ngày đặt: ${orderDate}</p>
        `)}
      `)}

      ${section(`
        ${heading('Sản phẩm đã đặt')}
        <table width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
          ${originalPrice > totalPrice ? `
          <tr>
            <td style="padding:6px 0;color:#8a7560;font-size:12px;letter-spacing:0.5px;">Tạm tính</td>
            <td style="padding:6px 0;text-align:right;color:#8a7560;font-size:12px;">${fmt(originalPrice)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#5a8a5a;font-size:12px;letter-spacing:0.5px;">Giảm giá ${couponCode ? `(${couponCode})` : ''}</td>
            <td style="padding:6px 0;text-align:right;color:#5a8a5a;font-size:12px;">−${fmt(discountAmount)}</td>
          </tr>` : ''}
          <tr style="border-top:1px solid #c9a96e;">
            <td style="padding:14px 0 0;color:#0f0d0b;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Tổng thanh toán</td>
            <td style="padding:14px 0 0;text-align:right;color:#c9a96e;font-size:22px;font-weight:600;">${fmt(totalPrice)}</td>
          </tr>
        </table>
      `)}

      ${section(`
        ${heading('Thông tin giao hàng')}
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2d9cc;">
          ${infoRow('Người nhận', `<strong>${shippingAddress.name}</strong>`)}
          ${infoRow('Điện thoại', shippingAddress.phone)}
          ${infoRow('Địa chỉ', [shippingAddress.address, shippingAddress.district, shippingAddress.province].filter(Boolean).join(', '))}
          ${infoRow('Thanh toán', paymentMethodMap[paymentMethod] || paymentMethod)}
          ${shippingAddress.note ? infoRow('Ghi chú', `<em>${shippingAddress.note}</em>`) : ''}
        </table>
      `)}
    `;

    await transporter.sendMail({
        from: `"Arume Fine Jewelry" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Xác nhận đơn hàng #${orderCode} · ARUME Fine Jewelry`,
        html: layout(body),
    });
    console.log(`[EMAIL] Đơn hàng ${orderCode} → ${toEmail}`);
};

// ─── 3. Tin nhắn liên hệ ──────────────────────────────────────────────────
const sendContactEmail = async ({ name, phone, email, subject, message }) => {
    const transporter = createTransporter();

    const adminBody = `
      ${section(`
        ${heading('Tin nhắn liên hệ mới')}
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2d9cc;">
          ${infoRow('Họ tên', `<strong>${name}</strong>`)}
          ${infoRow('Email', email)}
          ${infoRow('Điện thoại', phone || '—')}
          ${infoRow('Chủ đề', subject)}
          ${infoRow('Tin nhắn', `<em style="line-height:1.8;">${message}</em>`)}
          ${infoRow('Thời gian', new Date().toLocaleString('vi-VN'))}
        </table>
      `)}
    `;

    const customerBody = `
      ${section(`
        ${heading('Chúng tôi đã nhận được tin nhắn')}
        ${bodyText(`Kính gửi <strong style="color:#0f0d0b;">${name}</strong>,`)}
        ${bodyText(`Cảm ơn bạn đã liên hệ với <strong style="color:#0f0d0b;">ARUME Fine Jewelry</strong>. Đội ngũ chăm sóc khách hàng của chúng tôi đã ghi nhận yêu cầu của bạn và sẽ phản hồi trong vòng <strong>24 giờ làm việc</strong>.`)}
        ${goldBox(`
          ${label('Nội dung bạn đã gửi')}
          <p style="margin:8px 0 0;color:#4a3f30;font-size:13px;line-height:1.8;font-style:italic;">"${message}"</p>
        `)}
        ${bodyText(`Trong thời gian chờ đợi, bạn có thể liên hệ trực tiếp qua <strong>care@arume.com</strong> hoặc hotline <strong>+84 123 456 789</strong> để được hỗ trợ nhanh hơn.`)}
      `)}
    `;

    await transporter.sendMail({
        from: `"Arume Fine Jewelry" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `Tin nhắn mới từ ${name} · ${subject}`,
        html: layout(adminBody),
    });
    await transporter.sendMail({
        from: `"Arume Fine Jewelry" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `ARUME đã nhận tin nhắn của bạn · ${subject}`,
        html: layout(customerBody),
    });
    console.log(`[EMAIL] Liên hệ từ ${email}`);
};

module.exports = { sendForgotPasswordEmail, sendOrderConfirmationEmail, sendContactEmail };