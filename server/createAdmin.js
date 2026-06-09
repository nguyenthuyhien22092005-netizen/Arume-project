require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI?.replace('localhost', '127.0.0.1') || 'mongodb://127.0.0.1:27017/arume_db')
  .then(async () => {
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@arume.com';

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('Cập nhật quyền Admin cho tài khoản hiện có.');
      } else {
        console.log('Tài khoản Admin đã tồn tại.');
      }
    } else {
      // Create new admin
      const newAdmin = new User({
        name: 'Admin Arume',
        email: adminEmail,
        password: 'adminpassword123',
        isAdmin: true
      });

      // Model pre-save hook will hash the password
      await newAdmin.save();
      console.log('Tạo tài khoản Admin thành công!');
    }

    console.log('Email: admin@arume.com');
    console.log('Password: adminpassword123');

    mongoose.connection.close();
  }).catch(err => {
    console.error('Lỗi kết nối DB:', err);
    process.exit(1);
  });
