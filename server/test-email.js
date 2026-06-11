/**
 * Script kiểm tra kết nối Gmail + gửi email thử
 * Chạy trên Railway terminal hoặc local:
 *   node test-email.js
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

console.log('=== ARUME Email Diagnostic ===');
console.log('EMAIL_USER:', EMAIL_USER || '❌ CHƯA SET');
console.log('EMAIL_PASS:', EMAIL_PASS
  ? `Đã set (${EMAIL_PASS.length} ký tự, có khoảng trắng: ${EMAIL_PASS.includes(' ')})`
  : 'CHƯA SET'
);

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('\nThiếu biến môi trường. Kiểm tra lại .env hoặc Railway Variables.');
  process.exit(1);
}

async function testEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  console.log('\n→ Đang xác thực với Gmail...');
  try {
    await transporter.verify();
    console.log('Kết nối Gmail thành công!');
  } catch (err) {
    console.error('❌ Xác thực thất bại:', err.message);
    console.error('\n📋 Hướng dẫn sửa:');
    console.error('  1. Vào https://myaccount.google.com/apppasswords');
    console.error('  2. Tạo App Password mới (chọn Mail + Other)');
    console.error('  3. Copy 16 ký tự → dán vào Railway Variables');
    console.error('     EMAIL_PASS = xxxx xxxx xxxx xxxx  (giữ nguyên khoảng trắng)');
    process.exit(1);
  }

  console.log('\n→ Đang gửi email thử...');
  try {
    const info = await transporter.sendMail({
      from: `"Arume Test" <${EMAIL_USER}>`,
      to: EMAIL_USER, // Gửi về chính mình để test
      subject: 'Test email - Arume Fine Jewelry',
      html: '<h2>Email hoạt động!</h2><p>Nếu bạn nhận được email này, hệ thống gửi mail đã sẵn sàng.</p>',
    });
    console.log('Gửi thành công! Message ID:', info.messageId);
    console.log(`→ Kiểm tra hộp thư: ${EMAIL_USER}`);
  } catch (err) {
    console.error('❌ Gửi thất bại:', err.message);
  }
}

testEmail();