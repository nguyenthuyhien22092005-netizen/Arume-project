require('dotenv').config();
const nodemailer = require('nodemailer');

const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, ' ').trim();
console.log('USER:', process.env.EMAIL_USER);
console.log('PASS length:', pass.length);

const t = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass } });
t.verify()
  .then(() => console.log('OK - Gmail xác thực thành công'))
  .catch(e => console.log('LOI:', e.message));