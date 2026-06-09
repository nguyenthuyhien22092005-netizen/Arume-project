const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    googleId: { type: String },
    avatar: { type: String },
    resetPasswordCode: { type: String },
    resetPasswordExpiry: { type: Date },
}, { timestamps: true });

// Mongoose 7+ / Express 5: async pre-save không cần next()
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('User', userSchema);
