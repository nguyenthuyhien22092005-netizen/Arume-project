const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../utils/emailService');

// POST /api/contact
router.post('/', async (req, res) => {
    const { name, phone, email, subject, message } = req.body;

    // Validate
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, email và tin nhắn.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
    }

    try {
        await sendContactEmail({ name, phone, email, subject: subject || 'Khác', message });
        res.status(200).json({ success: true, message: 'Tin nhắn đã được gửi thành công!' });
    } catch (error) {
        console.error('[CONTACT] Lỗi gửi email:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
    }
});

// POST /api/contact/subscribe — Đăng ký nhận ưu đãi
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
    }

    try {
        const transporter = require('nodemailer').createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
            from: `"Arume Jewelry" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `📧 Đăng ký nhận ưu đãi mới: ${email}`,
            html: `<p style="font-family:Arial;font-size:15px;">Email <strong>${email}</strong> vừa đăng ký nhận ưu đãi từ ARUME.</p>`,
        });

        await transporter.sendMail({
            from: `"Arume Jewelry" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `🎁 Mã giảm giá 10% dành riêng cho bạn - ARUME`,
            html: `<!DOCTYPE html>
<html lang="vi"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:48px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#faf8f5;border:1px solid #e2d9cc;border-radius:2px;overflow:hidden;">
        <tr><td style="height:3px;padding:0;font-size:0;"><div style="height:3px;background:linear-gradient(90deg,#0f0d0b 0%,#c9a96e 30%,#e8d5a3 50%,#c9a96e 70%,#0f0d0b 100%);"></div></td></tr>
        <tr><td style="background:#0f0d0b;padding:36px 48px 28px;text-align:center;">
          <p style="margin:0 0 6px;color:#c9a96e;font-size:9px;letter-spacing:6px;text-transform:uppercase;">— Fine Jewelry —</p>
          <h1 style="margin:0;color:#f5f0e8;font-size:32px;font-weight:400;letter-spacing:12px;text-transform:uppercase;">ARUME</h1>
          <p style="margin:10px 0 0;color:#6b5f4e;font-size:8px;letter-spacing:4px;text-transform:uppercase;">Est. 2024 · Hà Nội</p>
        </td></tr>
        <tr><td style="background:#0f0d0b;padding:0 48px 32px;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="border-top:1px solid #3a2e1e;font-size:0;">&nbsp;</td>
            <td style="padding:0 14px;color:#c9a96e;font-size:13px;white-space:nowrap;">✦</td>
            <td style="border-top:1px solid #3a2e1e;font-size:0;">&nbsp;</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:44px 48px;text-align:center;">
          <p style="margin:0 0 4px;color:#a08050;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Ưu đãi độc quyền</p>
          <h2 style="margin:0 0 16px;color:#0f0d0b;font-size:20px;font-weight:400;letter-spacing:3px;text-transform:uppercase;">Chào mừng đến với ARUME</h2>
          <p style="margin:0 0 28px;color:#4a3f30;font-size:13px;line-height:1.9;">Cảm ơn bạn đã đăng ký. Như một lời chào từ chúng tôi,<br/>đây là mã giảm giá <strong style="color:#0f0d0b;">10%</strong> dành riêng cho đơn hàng đầu tiên của bạn.</p>
          <div style="background:#fdf9f2;border:1px solid #c9a96e;padding:32px 40px;margin:0 0 28px;">
            <p style="margin:0 0 12px;color:#a08050;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Mã ưu đãi của bạn</p>
            <p style="margin:0 0 12px;color:#0f0d0b;font-size:38px;letter-spacing:10px;font-family:'Courier New',monospace;font-weight:700;">ARUME10</p>
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="border-top:1px solid #e2d9cc;font-size:0;">&nbsp;</td>
              <td style="padding:0 10px;color:#c9a96e;font-size:10px;white-space:nowrap;">✦</td>
              <td style="border-top:1px solid #e2d9cc;font-size:0;">&nbsp;</td>
            </tr></table>
            <p style="margin:12px 0 0;color:#8a7560;font-size:11px;letter-spacing:1px;">Áp dụng cho đơn hàng đầu tiên &nbsp;·&nbsp; Hiệu lực 30 ngày</p>
          </div>
          <p style="margin:0;color:#8a7560;font-size:11px;line-height:1.8;font-style:italic;">Nhập mã tại bước thanh toán để nhận ưu đãi.<br/>Chúc bạn có trải nghiệm mua sắm tuyệt vời cùng ARUME.</p>
        </td></tr>
        <tr><td style="padding:0 48px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="border-top:1px solid #e2d9cc;font-size:0;">&nbsp;</td>
            <td style="padding:0 12px;color:#c9a96e;font-size:10px;white-space:nowrap;">✦</td>
            <td style="border-top:1px solid #e2d9cc;font-size:0;">&nbsp;</td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#0f0d0b;padding:28px 48px;text-align:center;">
          <p style="margin:0 0 6px;color:#c9a96e;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Arume Fine Jewelry</p>
          <p style="margin:0 0 14px;color:#4a3f30;font-size:11px;">56 Đường Láng, Hà Nội &nbsp;·&nbsp; care@arume.com</p>
          <p style="margin:0;color:#2e2518;font-size:10px;">© \${new Date().getFullYear()} Arume Fine Jewelry · Mọi quyền được bảo lưu</p>
        </td></tr>
        <tr><td style="height:3px;padding:0;font-size:0;"><div style="height:3px;background:linear-gradient(90deg,#f0ede8 0%,#c9a96e 30%,#e8d5a3 50%,#c9a96e 70%,#f0ede8 100%);"></div></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
        });

        res.status(200).json({ success: true, message: 'Đăng ký thành công!' });
    } catch (error) {
        console.error('[SUBSCRIBE] Lỗi gửi email:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
    }
});

module.exports = router;